ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine

RUN mkdir -p /opt/github-auth-generator
WORKDIR /opt/github-auth-generator
ADD package.json /opt/github-auth-generator/package.json
ADD package-lock.json /opt/github-auth-generator/package-lock.json
ADD src /opt/github-auth-generator/src
RUN npm install

ENTRYPOINT ["/usr/local/bin/node", "/opt/github-auth-generator/src/bin.js"]
