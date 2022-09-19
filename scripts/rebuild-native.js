const os = require('os');
const { join } = require('path');
const { execSync } = require('child_process');
const { pathExistsSync, copySync, removeSync } = require('fs-extra');
const argv = require('yargs').argv;

const nativeModules = [
  join(__dirname, '../node_modules/node-pty'),
  join(__dirname, '../node_modules/@parcel/watcher'),
  join(__dirname, '../node_modules/spdlog'),
  join(__dirname, '../node_modules/keytar'),
];

let version;
let commands;

const target = argv.target || 'node';
const platform = process.env.npm_config_platform || process.platform;
let arch = process.env.npm_config_arch || process.arch || os.arch();

if (
  platform === 'darwin' &&
  process.platform === 'darwin' &&
  arch === 'x64' &&
  process.env.npm_config_arch === undefined
) {
  // When downloading for macOS ON macOS and we think we need x64 we should
  // check if we're running under rosetta and download the arm64 version if appropriate
  try {
    const output = execSync('sysctl -in sysctl.proc_translated');
    if (output.toString().trim() === '1') {
      arch = 'arm64';
    }
  } catch {
    // Ignore failure
  }
}

if (target === 'electron') {
  version = argv.electronVersion || require('electron/package.json').version;

  console.log('rebuilding native for electron version ' + version);

  if (platform === 'win32') {
    commands = [
      'node-gyp',
      'rebuild',
      '--openssl_fips=X',
      `--target=${version}`,
      `--arch=${arch}`,
      '--dist-url=https://electronjs.org/headers',
    ];
  } else {
    commands = [
      `npm_config_arch=${arch}`,
      `npm_config_target_arch=${arch}`,
      'node-gyp',
      'rebuild',
      '--openssl_fips=X',
      `--target=${version}`,
      `--arch=${arch}`,
      '--dist-url=https://electronjs.org/headers',
    ];
  }
} else if (target === 'node') {
  console.log('rebuilding native for node version ' + process.version);

  version = process.version;

  commands = ['node-gyp', 'rebuild'];
}

function rebuildModule(modulePath, type, version) {
  const info = require(join(modulePath, './package.json'));
  console.log('rebuilding ' + info.name);
  const cache = getBuildCacheDir(modulePath, type, version, target);
  if (pathExistsSync(cache) && !argv['force-rebuild']) {
    console.log('cache found for ' + info.name);
    copySync(cache, join(modulePath, 'build'));
  } else {
    const command = commands.join(' ');
    console.log(command);
    execSync(command, {
      cwd: modulePath,
      HOME: target === 'electron' ? '~/.electron-gyp' : undefined,
    });
    removeSync(cache);
    copySync(join(modulePath, 'build'), cache);
  }
}

function getBuildCacheDir(modulePath, type, version, target) {
  const info = require(join(modulePath, './package.json'));
  return join(
    require('os').tmpdir(),
    'ide_build_cache',
    target,
    info.name + '-' + info.version + '-' + arch,
    type + '-' + version,
  );
}

nativeModules.forEach((path) => {
  rebuildModule(path, target, version);
});
