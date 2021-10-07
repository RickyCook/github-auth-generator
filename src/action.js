const core = require('@actions/core');
const generate = require('./index');
const { setDebug } = require('./log');

async function run() {
  try {
    const tokenType = core.getInput('tokenType', { required: true });
    setDebug(core.getInput('debug'));
    const opts = {};
    for (const key of [
      'appId', 'privateKey', 'installationId', 'orgName', 'repoName', 'personalAccessToken',
    ]) {
      opts[key] = core.getInput(key, { required: false });
    }

    let fn;
    switch(tokenType) {
      case 'appToken':
        fn = generate.createAppToken;
        break;
      case 'appAuthorization':
        fn = generate.createAppAuthorization;
        break;
      case 'installationToken':
        fn = generate.createInstallationToken;
        break;
      case 'installationAuthorization':
        fn = generate.createInstallationAuthorization;
        break;
      case 'orgRunnerRegistrationToken':
        fn = generate.createOrgRunnerRegistrationToken;
        break;
      case 'repoRunnerRegistrationToken':
        fn = generate.createRepoRunnerRegistrationToken;
        break;
      default:
        throw new Error(`Unknown token type: ${tokenType}`);
    }

    core.info('Generating token');
    const output = await fn(opts);
    if (tokenType.endsWith('Authorization')) {
      const token = output.trim().replace(/^[^ ]+ +/, '');
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
