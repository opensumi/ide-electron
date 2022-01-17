const fs = require('fs');
const path = require('path');
const electronBuilder = require('electron-builder');
const rootPackage = require('../package.json');

const DEFAULT_TARGET_PLATFORM = 'darwin';

// disable code sign
process.env.CSC_IDENTITY_AUTO_DISCOVERY = false;

// use double package.json structure, auto handle node_modules
fs.copyFileSync(path.join(__dirname, '../build/package.json'), path.join(__dirname, '../app/package.json'));

const targetPlatforms = (process.env.TARGET_PLATFORMS || DEFAULT_TARGET_PLATFORM).split(',').map((str) => str.trim());
const targets = new Map();
if (targetPlatforms.includes('win32')) {
  targets.set(electronBuilder.Platform.WINDOWS, new Map([
    [electronBuilder.Arch.x64, ['nsis']],
  ]));
}
if (targetPlatforms.includes('darwin')) {
  targets.set(electronBuilder.Platform.MAC, new Map([
    [electronBuilder.Arch.x64, ['dmg']],
    // [electronBuilder.Arch.arm64, ['dmg']],
  ]));
}

electronBuilder.build({
  publish: null,
  targets: targets.size ? targets : undefined,
  config: {
    productName: 'OpenSumi',
    npmArgs: ['--registry=https://registry.npmmirror.com'],
    electronVersion: rootPackage.devDependencies.electron, // 根据前置 package.json 判断版本号即可
    extraResources: [
      {
        from: path.join(__dirname, '../extensions'),
        to: 'extensions',
        filter: ['**/*'],
      }
    ],
    directories: {
      output: path.join(__dirname, '../out/'),
    },
    asar: true,
    asarUnpack: [
      'node_modules/@opensumi/vscode-ripgrep',
    ],
    mac: {
      icon: 'build/icon/sumi.png',
      artifactName: '${productName}-Desktop-${version}.${ext}',
      target: 'dmg',
    },
    win: {
      artifactName: '${productName}-Desktop-${version}.${ext}',
      icon: 'build/icon/sumi.ico',
      target: [{
        target: 'nsis',
        arch: ['x64'],
      }],
    },
  }
})
