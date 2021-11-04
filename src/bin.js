const { program, Command } = require('commander');

const {
  ArgumentError,
  createAppToken,
  createAppAuthorization,
  createInstallationToken,
  createInstallationAuthorization,
  createRepoRunnerRegistrationToken,
  createOrgRunnerRegistrationToken,
  createEntRunnerRegistrationToken,
  createRepoRunnerRemoveToken,
  createOrgRunnerRemoveToken,
  createEntRunnerRemoveToken,
} = require('./index');
const { setDebug } = require('./log');

const createAction = (tokenFn, authFn) => async opts => {
  try {
    setDebug(opts.debug);
    console.log(await (opts.authorization ? authFn(opts) : tokenFn(opts)));
  } catch(err) {
    if (opts.debug) {
      console.error(err);
    } else {
      console.error('ERROR:', err.message);
    }
    process.exit(1);
  }
}
const appTokenAct = createAction(createAppToken, createAppAuthorization);
const installationTokenAct = createAction(createInstallationToken, createInstallationAuthorization);
const repoRunnerRegistrationTokenAct = createAction(createRepoRunnerRegistrationToken);
const orgRunnerRegistrationTokenAct = createAction(createOrgRunnerRegistrationToken);
const entRunnerRegistrationTokenAct = createAction(createEntRunnerRegistrationToken);
const repoRunnerRemoveTokenAct = createAction(createRepoRunnerRemoveToken);
const orgRunnerRemoveTokenAct = createAction(createOrgRunnerRemoveToken);
const entRunnerRemoveTokenAct = createAction(createEntRunnerRemoveToken);

const addDebugArgs = cmd => (
  cmd
    .option('--debug', 'turn on debug outputs')
)
const addAuthorizationArgs = cmd => (
  cmd
    .option('--authorization', 'authorization header mode')
)
const addAppTokenArgs = cmd => (
  cmd
    .option('-a, --appId <id>', 'app ID')
    .option('-k, --privateKeyPath <path>', 'path to the private key file for the app')
);
const addInstallationTokenArgs = cmd => (
  cmd
    .option('-i, --installationId <id>', 'installation ID for the app')
);
const addOrgNameArgs = cmd => (
  cmd
    .option('-o, --orgName <name>', 'organization name to act on')
);
const addRepoNameArgs = cmd => (
  cmd
    .option('-r, --repoName <name>', 'full name of the repository to act on')
);
const addPersonalAccessTokenArgs = cmd => (
  cmd
    .option('-p, --personalAccessToken <token>', 'personal access token to use for generation')
);

const root = program
  .version(
    JSON.parse(
      require('fs').readFileSync(`${__dirname}/../package.json`)
    ).version,
  )

const appTokenCmd = program
  .command('app')
  .description('create an app JWT')
addDebugArgs(appTokenCmd);
addAuthorizationArgs(appTokenCmd);
addAppTokenArgs(appTokenCmd);
appTokenCmd.action(appTokenAct);

const installationTokenCmd = program
  .command('installation')
  .description('create an installation token')
addDebugArgs(installationTokenCmd);
addAuthorizationArgs(installationTokenCmd);
addAppTokenArgs(installationTokenCmd);
addInstallationTokenArgs(installationTokenCmd);
addOrgNameArgs(installationTokenCmd);
addRepoNameArgs(installationTokenCmd);
installationTokenCmd.action(installationTokenAct);

const repoRunnerRegistrationTokenCmd = program
  .command('repoRunnerRegistration')
  .description('create a token to add self-hosted runners to a repo')
addDebugArgs(repoRunnerRegistrationTokenCmd);
addAppTokenArgs(repoRunnerRegistrationTokenCmd);
addInstallationTokenArgs(repoRunnerRegistrationTokenCmd);
addOrgNameArgs(repoRunnerRegistrationTokenCmd);
addRepoNameArgs(repoRunnerRegistrationTokenCmd);
addPersonalAccessTokenArgs(repoRunnerRegistrationTokenCmd);
repoRunnerRegistrationTokenCmd.action(repoRunnerRegistrationTokenAct);

const orgRunnerRegistrationTokenCmd = program
  .command('orgRunnerRegistration')
  .description('create a token to add self-hosted runners to an org')
addDebugArgs(orgRunnerRegistrationTokenCmd);
addAppTokenArgs(orgRunnerRegistrationTokenCmd);
addInstallationTokenArgs(orgRunnerRegistrationTokenCmd);
addOrgNameArgs(orgRunnerRegistrationTokenCmd);
addRepoNameArgs(orgRunnerRegistrationTokenCmd);
addPersonalAccessTokenArgs(orgRunnerRegistrationTokenCmd);
orgRunnerRegistrationTokenCmd.action(orgRunnerRegistrationTokenAct);

const entRunnerRegistrationTokenCmd = program
  .command('entRunnerRegistration')
  .description('create a token to add self-hosted runners to an enterprise')
addDebugArgs(entRunnerRegistrationTokenCmd);
addAppTokenArgs(entRunnerRegistrationTokenCmd);
addInstallationTokenArgs(entRunnerRegistrationTokenCmd);
addOrgNameArgs(entRunnerRegistrationTokenCmd);
addRepoNameArgs(entRunnerRegistrationTokenCmd);
addPersonalAccessTokenArgs(entRunnerRegistrationTokenCmd);
entRunnerRegistrationTokenCmd.action(entRunnerRegistrationTokenAct);

const repoRunnerRemoveTokenCmd = program
  .command('repoRunnerRemove')
  .description('create a token to remove self-hosted runners from a repo')
addDebugArgs(repoRunnerRemoveTokenCmd);
addAppTokenArgs(repoRunnerRemoveTokenCmd);
addInstallationTokenArgs(repoRunnerRemoveTokenCmd);
addOrgNameArgs(repoRunnerRemoveTokenCmd);
addRepoNameArgs(repoRunnerRemoveTokenCmd);
addPersonalAccessTokenArgs(repoRunnerRemoveTokenCmd);
repoRunnerRemoveTokenCmd.action(repoRunnerRemoveTokenAct);

const orgRunnerRemoveTokenCmd = program
  .command('orgRunnerRemove')
  .description('create a token to remove self-hosted runners from an org')
addDebugArgs(orgRunnerRemoveTokenCmd);
addAppTokenArgs(orgRunnerRemoveTokenCmd);
addInstallationTokenArgs(orgRunnerRemoveTokenCmd);
addOrgNameArgs(orgRunnerRemoveTokenCmd);
addRepoNameArgs(orgRunnerRemoveTokenCmd);
addPersonalAccessTokenArgs(orgRunnerRemoveTokenCmd);
orgRunnerRemoveTokenCmd.action(orgRunnerRemoveTokenAct);

const entRunnerRemoveTokenCmd = program
  .command('entRunnerRemove')
  .description('create a token to remove self-hosted runners from an enterprise')
addDebugArgs(entRunnerRemoveTokenCmd);
addAppTokenArgs(entRunnerRemoveTokenCmd);
addInstallationTokenArgs(entRunnerRemoveTokenCmd);
addOrgNameArgs(entRunnerRemoveTokenCmd);
addRepoNameArgs(entRunnerRemoveTokenCmd);
addPersonalAccessTokenArgs(entRunnerRemoveTokenCmd);
entRunnerRemoveTokenCmd.action(entRunnerRemoveTokenAct);

program.parse(process.argv);
