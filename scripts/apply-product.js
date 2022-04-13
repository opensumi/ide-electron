const { sumiVersion, version } = require('../product.json');

const { writeFileSync } = require('fs');
const path = require('path');

const prettier = require('prettier');

function saveWithPrettier(jsonPath, jsonContent) {
  const fileInfo = prettier.getFileInfo.sync(jsonPath, {
    resolveConfig: true,
  });
  prettier.resolveConfigFile().then((v) => {
    prettier.resolveConfig(v).then((options) => {
      const content = prettier.format(JSON.stringify(jsonContent), {
        parser: fileInfo.inferredParser,
        ...options,
      });
      writeFileSync(jsonPath, content);
    });
  });
}

function applySumiVersion() {
  const package = require('../package.json');
  const devDependencies = package['devDependencies'];
  const jsonPath = path.join(__dirname, '../package.json');

  for (const [k] of Object.entries(devDependencies)) {
    if (k === '@opensumi/di') {
      continue;
    }

    if (!k.startsWith('@opensumi/')) {
      continue;
    }
    devDependencies[k] = sumiVersion;
  }

  saveWithPrettier(jsonPath, package);
}

function applyVersion() {
  const buildPackage = require('../build/package.json');
  buildPackage['version'] = version;
  const jsonPath = path.join(__dirname, '../build/package.json');
  saveWithPrettier(jsonPath, buildPackage);
}

applySumiVersion();
applyVersion();
