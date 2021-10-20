# GitHub Auth Generator

A JavaScript package, GitHub Action, and CLI tool for generating various kinds
of GitHub authentication tokens, from other kinds of authentication tokens.

## Parameters

- Token types (`tokenType` in GitHub Actions, command for CLI, function prefix for JS library)
  - `app` for "GitHub App" type apps - JWTs used for interacting with app APIs only
  - `installation` for "GitHub App" type apps - Generated tokens for interacting with most of the GitHub API - Generated from an app token, and scoped to organization/user/etc
  - `orgRunnerRegistration` for registering a GitHub Actions Runner with an organization
  - `repoRunnerRegistration` for registering a GitHub Actions Runner with a repository
  - `orgRunnerRemove` for removing a GitHub Actions Runner from an organization
  - `repoRunnerRemove` for removing a GitHub Actions Runner from a repository
- Options
  - `debug`: turn on debug outputs (`true`/`false`, or CLI flag)
  - `authorization`: authorization header mode outputs a valid `Authorization` header value (`true`/`false`, CLI flag, or function suffix for JS library)
  - `appId`: GitHub app ID
  - `privateKey`: private key data for the GitHub app (not available on the CLI)
  - `privateKeyPath`: path to the private key file for the GitHub app
  - `installationId`: installation ID for the app
  - `orgName`: organization name to act on
  - `repoName`: full name of the repository to act on
  - `personalAccessToken`: personal access token to use for generation

### Operation-dependant options

Most options are optional, and all functions will show an error if a full set
of values aren't available. For example:
- to get a repo runner token you can:
  - supply a `personalAccessToken`
  - supply a `appId`, and one of `privateKey` or `privateKeyPath`
- to get an installation token you can:
  - supply an `installationId`
  - supply an `orgName` (installations are searched for the org name)
  - supply a `repoName` (installations are searched for the org name)

## Use as GitHub Action

### Request repo metadata from an app private key

After adding your app, add the private key as a repo secret
```yaml
- id: token
  name: Generate authorization
  uses: RickyCook/github-auth-generator@1.1.2
  with:
    tokenType: installation
    authorization: true
    appId: 'deadbeef'
    privateKey: ${{ secrets.appPrivateKey }}
    repoName: myorg/privaterepo
- name: Check token works
  env:
    AUTH: ${{ steps.token.outputs.token }}
  run: curl -H "Authorization:$AUTH" https://api.github.com/repos/myorg/privaterepo
```

### Inputs

- `tokenType` - what type of token to generate
  - `app` - create an app JWT
  - `installation` - create an installation token
  - `orgRunnerRegistration` - create a token to add self-hosted runners to a repo
  - `repoRunnerRegistration` - create a token to add self-hosted runners to an org
  - `orgRunnerRemove` - create a token to remove self-hosted runners from a repo
  - `repoRunnerRemove` - create a token to remove self-hosted runners from an org
- `debug` - turn on debug outputs
- `authorization` - turn on "authorization" mode to return the value of an authorization header for curl/httpie/etc
- other inputs that match the lib/CLI opts (`appId`, `privateKey`, etc)

### Outputs

- `token` - the generated token or authorization header value

## Use as a library

### Request repo metadata from an app private key
```javascript
const https = require('https');
const githubTokens = require('github-tokens-generator');

// App ID and private key are from your app settings
const appId = 'deadbeef';
const privateKeyPath = '/tmp/myapp.2021-10-04.private-key.pem';
const repoName = 'myorg/privaterepo';

(async () => {
  https.get(
    `https://api.github.com/repos/${repoName}`,
    {
      headers: {
        // create...Authorization functions add Bearer/token as required
        // if you just need the token, you can use create...Token functions
        Authorization: await githubTokens.createInstallationAuthorization({
          appId, privateKeyPath, repoName,
        }),
        'User-Agent': 'nodejs',
      }
    },
    res => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      res.on('data', d => process.stdout.write(d));
    },
  );
})();
```

## Use as a CLI

### Request repo metadata from an app private key
```
token="$(
  node src/bin.js \
  installation \
    --authorization \
    --appId deadbeef \
    --privateKeyPath /tmp/myapp.2021-10-04.private-key.pem \
    --repoName myorg/privaterepo
)"
curl -H "Authorization:$token" https://api.github.com/repos/myorg/privaterepo
```

### Request repo metadata from an app private key (DOCKER 🐳)
```
token="$(
  docker run --rm -v /tmp/myapp.2020-10-04.private-key.pem:/key.pem \
  thatpanda/github-auth-generator:1.1.2 \
  installation \
    --authorization \
    --appId deadbeef \
    --privateKeyPath /key.pem \
    --repoName myorg/privaterepo
)"
curl -H "Authorization:$token" https://api.github.com/repos/myorg/privaterepo
```

### Request a GitHub Actions Runner registration token from an app private key
This token can be used according to the GitHub Actions self-hosted runner docs in place of
the token generated by the web UI.
```
node src/bin.js repoRunnerRegistration \
  --appId deadbeef \
  --privateKeyPath /tmp/myapp.2021-10-04.private-key.pem \
  --repoName myorg/privaterepo
```

### Request a GitHub Actions Runner registration token from a personal access token
This token can be used according to the GitHub Actions self-hosted runner docs in place of
the token generated by the web UI.
```
node src/bin.js repoRunnerRegistration \
  --personalAccessToken deadbeef \
  --repoName myorg/privaterepo
```

## Setting up a GitHub app

Navigate to your organization's developer settings:
`https://github.com/organizations/<yourorg>/settings/apps`

OR

Navigate to your personal developer settings:
`https://github.com/settings/apps`

Create a "GitHub App" (not an OAuth App) using these settings:
- Name can be anything you like
- Homepage URL can be anything you like (eg a website URL, an organization profile, personal profile, or repo URL)
- Uncheck "Active" under webhook (unless you want this, but this is not necessary for API interaction)
- Select any API permissions you'd like to request
  - *Note* some of these are not specifically necessary, but may be useful for ephemeral runners and other CI-related activities, so it's less hassle to do it now
  - For generating GitHub Actions runner tokens for repositories:
    - Repository -> Actions: Read & Write
    - Repository -> Administration: Read & Write
    - Repository -> Metadata: Read-only
    - Repository -> Checks: Read-only
  - For generating GitHub Actions runner tokens for organizations:
    - Organization -> Self-hosted runners: Read & Write
- For "Where can this GitHub App be installed?", it's up to you. For testing and internal purposes, "Only on this account" is a reasonable option

The `appId` setting of this library/CLI corresponds to the `App ID` on the app's about page

To retrieve a private key, scroll down on the app's about page and under "Private keys", click "Generate a private key". The PEM file that's saved corresponds to the `privateKeyPath` of this library/CLI

To allow access to repositories/orgs, in the app settings click "Install App". You can select any organization that you're a member of to install the app into (or there might only be 1 if you selected "only this account" in the setup). Click install, and then install again. You might like to select only a limited set of repositories.

Now you can use the app ID and private key to perform operations on your repository!
