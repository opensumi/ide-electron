export const Constants = {
  ELECTRON_MAIN_API_NAME: 'opensumi-main-api',
  ELECTRON_NODE_SERVICE_NAME: 'opensumi-electron-node',
  ELECTRON_NODE_SERVICE_PATH: 'opensumi-electron-node-service-path',

  DATA_FOLDER: process.env.DATA_FOLDER || '.sumi',

  DEFAULT_BACKGROUND: 'rgb(32, 34, 36)',
};

export const Commands = {
  OPEN_DEVTOOLS_MAIN: 'opensumi.help.openDevtools.main',
  OPEN_DEVTOOLS_NODE: 'opensumi.help.openDevtools.node',
  OPEN_DEVTOOLS_EXTENSION: 'opensumi.help.openDevtools.extension',
};

export const ExtensionCommands = {
  OPEN_DEVTOOLS: 'extension.opensumi.openDevtools',
};
