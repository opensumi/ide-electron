const fs = require('fs');
const path = require('path');
const electronBuilder = require('electron-builder');
const rootPackage = require('../package.json');

// 使用双 package.json 结构，自动处理 node_modules
fs.copyFileSync(path.join(__dirname, '../build/package.json'), path.join(__dirname, '../app/package.json'));

electronBuilder.build({
  config: {
    productName: 'Kaitian IDE',
    npmArgs: ['--registry=https://registry.npm.alibaba-inc.com'],
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
    asarUnpack: 'node_modules/@ali/vscode-ripgrep',
    mac: {
      target: 'dmg',
    },
  }
})
