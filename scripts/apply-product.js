const { writeFileSync } = require('fs');
const path = require('path');

function saveWithPrettier(jsonPath, jsonContent) {
  try {
    const prettier = require('prettier');
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
  } catch (error) {
    console.log('prettier is not installed');
    writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
  }
}

function saveProductJson() {
  const productJson = require('../product.json');
  if (process.env.SUMI_VERSION) {
    productJson['sumiVersion'] = String(process.env.SUMI_VERSION).trim();
  }
  if (process.env.PRODUCT_VERSION) {
    let _version = String(process.env.PRODUCT_VERSION).trim();
    if (_version.startsWith('v')) {
      // transform tag version eg. v1.3.6 to 1.3.6
      _version = _version.substring(1);
    }
    productJson['version'] = _version;
  }
  const jsonPath = path.join(__dirname, '../product.json');
  saveWithPrettier(jsonPath, productJson);
}

function applySumiVersion() {
  const { sumiVersion } = require('../product.json');
  // cancel if sumiVersion not specified
  if (!sumiVersion) {
    return;
  }

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
  const { version: productVersion } = require('../product.json');

  const buildPackage = require('../build/package.json');
  buildPackage['version'] = productVersion;
  const jsonPath = path.join(__dirname, '../build/package.json');
  saveWithPrettier(jsonPath, buildPackage);
}

saveProductJson();

applySumiVersion();
applyVersion();
