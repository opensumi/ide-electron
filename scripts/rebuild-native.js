const path = require('path');
const argv = require('yargs').argv;
const electronRebuild = require('electron-rebuild');

const electronVersion = argv.electronVersion || require('electron/package.json').version;

console.log('rebuilding native for electron version ' + electronVersion);
const force = argv['force-rebuild'] === 'true';
const buildPath = path.resolve(__dirname, '..');

if (force) {
  console.log('Force rebuild flag enabled.');
}

electronRebuild.rebuild({ buildPath, electronVersion, force })
