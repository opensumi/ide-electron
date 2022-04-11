const { sumiVersion } = require('../product.json');
const package = require('../package.json');

const devDependencies = package['devDependencies'];

const { writeFileSync } = require('fs');
const path = require('path');

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

const prettier = require('prettier');
const fileInfo = prettier.getFileInfo.sync(jsonPath, {
  resolveConfig: true,
});

prettier.resolveConfigFile().then((v) => {
  prettier.resolveConfig(v).then((options) => {
    const content = prettier.format(JSON.stringify(package), {
      parser: fileInfo.inferredParser,
      ...options,
    });
    writeFileSync(jsonPath, content);
  });
});
