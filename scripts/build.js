#!/usr/bin/node
const { build } = require('vite');
const { dirname } = require('path');

/** @type 'production' | 'development' | 'test' */
const mode = 'production'; // process.env.MODE = process.env.MODE || 'production';

const packagesConfigs = [
  // 'build/main.vite.js',
  'build/main.vite.js',
];

/**
 * Run `vite build` for config file
 */
const buildByConfig = (configFile) => build({ configFile, mode });
(async () => {
  try {
    const totalTimeLabel = 'Total bundling time';
    console.time(totalTimeLabel);

    for (const packageConfigPath of packagesConfigs) {
      const consoleGroupName = `${dirname(packageConfigPath)}/`;
      console.group(consoleGroupName);

      const timeLabel = 'Bundling time';
      console.time(timeLabel);

      await buildByConfig(packageConfigPath);

      console.timeEnd(timeLabel);
      console.groupEnd();
      console.log('\n'); // Just for pretty print
    }
    console.timeEnd(totalTimeLabel);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
