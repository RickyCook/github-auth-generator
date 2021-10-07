const core = require('@actions/core');
const generate = require('./index');
const { setDebug, log } = require('./log');

async function run() {
  try {
    const tokenType = core.getInput('tokenType', { required: true });
    const authorization = core.getInput('authorization');
    setDebug(core.getInput('debug'));
    const opts = {};
    for (const key of [
      'appId', 'privateKey', 'installationId', 'orgName', 'repoName', 'personalAccessToken',
    ]) {
      opts[key] = core.getInput(key, { required: false });
    }

    let fn;
    switch(tokenType) {
      case 'app':
        fn = authorization ?
          generate.createAppToken : generate.createAppAuthorization;
        break;
      case 'installation':
        fn = authorization ?
          generate.createInstallationToken : generate.createInstallationAuthorization;
        break;
      case 'orgRunnerRegistration':
        if (authorization) throw new Error('Authorization mode not supported for runner tokens');
        fn = generate.createOrgRunnerRegistrationToken;
        break;
      case 'repoRunnerRegistration':
        if (authorization) throw new Error('Authorization mode not supported for runner tokens');
        fn = generate.createRepoRunnerRegistrationToken;
        break;
      default:
        throw new Error(`Unknown token type: ${tokenType}`);
    }

    core.info('Generating token');
    const output = await fn(opts);
    if (authorization) {
      const token = output.trim().replace(/^[^ ]+ +/, '');
      log('Authorization header prefix: %s', output.trim().split(' ')[0]);
      core.setSecret(token);
    } else {
      core.setSecret(output);
    }
    core.setOutput('token', output);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
