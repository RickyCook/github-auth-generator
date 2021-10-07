const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const uniq = require('lodash/uniq');
const flatten = require('lodash/flatten');
const { promisify } = require('util');

const rootLog = require('./log');

const defaultApiPrefix = 'https://api.github.com';

const createClient = ({ authorization, apiPrefix = defaultApiPrefix }) => (
  axios.create({
    baseURL: apiPrefix,
    headers: {
      Authorization: authorization,
      Accept: 'application/vnd.github.v3+json',
    },
  })
);
const tryCreateTokens = async (fns, opts) => {
  const argErrors = [];
  for (const fn of fns) {
    try {
      return await fn(opts);
    } catch(err) {
      if (err instanceof ArgumentError) {
        argErrors.push(err);
      } else {
        throw err;
      }
    }
  }

  const allMessages = uniq(argErrors.map(err => err.message));
  const allFields = uniq(flatten(argErrors.map(err => err.fields)));
  throw new ArgumentError(
    allMessages.join(' OR '),
    allFields,
  );
};

// GitHub actions doesn't support fs/promises
const readFile = promisify(fs.readFile);

class ArgumentError extends Error {
  constructor(msg, fields) {
    super(msg);
    this.fields = fields;
  }
}
exports.ArgumentError = ArgumentError;

exports.createAppToken = async opts => {
  const { appId, privateKey, privateKeyPath, parentLog = rootLog } = opts;
  if (!appId)
    throw new ArgumentError('Must give appId', ['appId']);
  if (!privateKey && !privateKeyPath)
    throw new ArgumentError('Must give either privateKey or privateKeyPath', ['privateKey', 'privateKeyPath']);

  const log = parentLog.extend('createAppToken');

  log('Loading PEM');
  const pem = privateKey
    ? privateKey
    : (await readFile(privateKeyPath)).toString();

  log('Creating app token');
  return jwt.sign({}, pem, {
    issuer: appId,
    expiresIn: '10m',
    algorithm: 'RS256',
  });
};
exports.createAppAuthorization = async opts => (
  'Bearer ' + await exports.createAppToken(opts)
);

exports.createInstallationToken = async opts => {
  if (opts.repoName && !opts.orgName)
    opts.orgName = opts.repoName.split('/')[0];

  let { installationId } = opts;
  const { orgName, parentLog = rootLog } = opts;
  if (!installationId && !orgName)
    throw new ArgumentError('Must give either installationId, orgName, or repoName', ['installationId', 'orgName', 'repoName']);

  const log = parentLog.extend('createInstallationToken');
  const logTrace = log.extend('trace');

  log('Getting installations');
  const client = createClient({ authorization: await exports.createAppAuthorization(opts) });
  if (!installationId) {
    log('Getting installation from org name %s', orgName);
    const installations = (await client.get('/app/installations')).data;
    logTrace('Installations: %O', installations);
    const installation = installations.find(i => {
      if (i.account) {
        logTrace('Installation %d has account type %s', i.id, i.account.type);
        logTrace('Installation %d has account login %s', i.id, i.account.login);
      } else {
        logTrace('Installation %d has no account object', i.id);
      }
      if (i.account && i.account.type === 'Organization' && i.account.login === orgName) {
        return true;
      }
    });
    if (!installation) throw new Error('Could not find installation');
    installationId = installation.id
  }

  log('Creating installation token');
  return (await client.post(
    `/app/installations/${installationId}/access_tokens`
  )).data.token;
}
exports.createInstallationAuthorization = async opts => (
  'Bearer ' + await exports.createInstallationToken(opts)
);

exports.getPersonalAccessToken = opts => {
  if (opts.personalAccessToken) return opts.personalAccessToken;
  throw new ArgumentError('Must give personlAccessToken', ['personalAccessToken']);
}
exports.createPersonalAccessAuthorization = async opts => (
  'token ' + exports.getPersonalAccessToken(opts)
);

exports.createOrgRunnerRegistrationToken = async opts => {
  if (opts.repoName && !opts.orgName)
    opts.orgName = opts.repoName.split('/')[0];

  const { orgName, parentLog = rootLog } = opts;
  if (!orgName) // TODO we could get this from installation
    throw new ArgumentError('Must give orgName or repoName', ['orgName', 'repoName']);

  const log = parentLog.extend('createOrgRunnerRegistrationToken');

  const client = createClient({
    authorization: await tryCreateTokens([
      exports.createInstallationAuthorization,
      exports.createPersonalAccessAuthorization,
    ], opts),
  });
  log('Creating organization runner registration token');
  return (await client.post(`/orgs/${orgName}/actions/runners/registration-token`)).data.token
};
exports.createRepoRunnerRegistrationToken = async opts => {
  const { repoName, parentLog = rootLog } = opts;
  if (!repoName) throw new ArgumentError('Must give repoName', ['repoName']);

  const log = parentLog.extend('createRepoRunnerRegistrationToken');

  const client = createClient({
    authorization: await tryCreateTokens([
      exports.createInstallationAuthorization,
      exports.createPersonalAccessAuthorization,
    ], opts),
  });
  log('Creating repo runner registration token');
  return (await client.post(`/repos/${repoName}/actions/runners/registration-token`)).data.token
};
