const path = require('path');
const fse = require('fs-extra');
// const log = require('debug')('download-vscode-extension');
const log = console.log;
const { ExtensionInstaller } = require('@opensumi/ide-extension-installer');

const extensionInstaller = new ExtensionInstaller({
  showBuiltinExtensions: true,
  accountId: 'nSIpLyllIOTIdHCGOdB7z8iA',
  masterKey: 'DTC0p2vH_-EOYeU23RZQ5dGh',
  retry: 3,
});


// 放置 vscode extension 的目录
const targetDir = path.resolve(__dirname, '../extensions/');
// vscode extension 的 tar 包 oss 地址
const { extensions } = require(path.resolve(__dirname, '../config/vscode-extensions.json'));

// 限制并发数，运行promise
const parallelRunPromise = (lazyPromises, n) => {
  const results = [];
  let index = 0;
  let working = 0;
  let complete = 0;

  const addWorking = (res, rej) => {
    while (working < n && index < lazyPromises.length) {
      const current = lazyPromises[index++];
      working++;

      ((index) => {
        current().then(result => {
          working--;
          complete++;
          results[index] = result;

          if (complete === lazyPromises.length) {
            res(results);
            return;
          }

          // note: 虽然addWorking中有while，这里其实每次只会加一个promise
          addWorking(res, rej);
        }, rej);
      })(index - 1);
    }
  };

  return new Promise(addWorking);
};

const downloadVscodeExtensions = async () => {
  log('清空 vscode extension 目录：%s', targetDir);
  await fse.remove(targetDir);
  await fse.ensureDir(targetDir);

  const promises = [];
  const publishers = Object.keys(extensions);
  for (const publisher of publishers) {
    const items = extensions[publisher];

    for (const item of items) {
      const { name } = item;
      promises.push(async () => {
        log('开始安装：%s.%s', publisher, name);
        await extensionInstaller.install({ publisher, dist: targetDir, ...item });
      });
    }
  }

  // 限制并发 promise 数
  await parallelRunPromise(promises, 3);
  log('安装完毕');
};

// 执行并捕捉异常
downloadVscodeExtensions().catch(e => {
  console.trace(e);
  process.exit(128);
});
