const { program, Command } = require('commander');

const {
  ArgumentError,
  createAppToken,
  createInstallationToken,
  createRepoRunnerRegistrationToken,
  createOrgRunnerRegistrationToken,
} = require('./index');
const { setDebug } = require('./log');

const createAction = fn => async opts => {
  try {
    setDebug(opts.debug);
    console.log(await fn(opts));
  } catch(err) {
    if (opts.debug) {
      console.error(err);
    } else {
      console.error('ERROR:', err.message);
    }
    process.exit(1);
  }
}
const appTokenAct = createAction(createAppToken);
const installationTokenAct = createAction(createInstallationToken);
const repoRunnerTokenAct = createAction(createRepoRunnerRegistrationToken);
const orgRunnerTokenAct = createAction(createOrgRunnerRegistrationToken);

const addDebugArgs = cmd => (
  cmd
    .option('--debug', 'turn on debug outputs')
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
  .command('app-token')
  .description('create an app JWT')
addDebugArgs(appTokenCmd);
addAppTokenArgs(appTokenCmd);
appTokenCmd.action(appTokenAct);

const installationTokenCmd = program
  .command('installation-token')
  .description('create an installation token')
addDebugArgs(installationTokenCmd);
addAppTokenArgs(installationTokenCmd);
addInstallationTokenArgs(installationTokenCmd);
addOrgNameArgs(installationTokenCmd);
addRepoNameArgs(installationTokenCmd);
installationTokenCmd.action(installationTokenAct);

const repoRunnerTokenCmd = program
  .command('repo-runner-token')
  .description('create a token to manage self-hosted runners on a repo')
addDebugArgs(repoRunnerTokenCmd);
addAppTokenArgs(repoRunnerTokenCmd);
addInstallationTokenArgs(repoRunnerTokenCmd);
addOrgNameArgs(repoRunnerTokenCmd);
addRepoNameArgs(repoRunnerTokenCmd);
addPersonalAccessTokenArgs(repoRunnerTokenCmd);
repoRunnerTokenCmd.action(repoRunnerTokenAct);

const orgRunnerTokenCmd = program
  .command('org-runner-token')
  .description('create a token to manage self-hosted runners on an org')
addDebugArgs(orgRunnerTokenCmd);
addAppTokenArgs(orgRunnerTokenCmd);
addInstallationTokenArgs(orgRunnerTokenCmd);
addOrgNameArgs(orgRunnerTokenCmd);
addRepoNameArgs(orgRunnerTokenCmd);
addPersonalAccessTokenArgs(orgRunnerTokenCmd);
orgRunnerTokenCmd.action(orgRunnerTokenAct);

program.parse(process.argv);
