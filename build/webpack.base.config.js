const { DefinePlugin } = require('webpack');

const product = require('../product.json');

/**
 * @param {import("webpack").Configuration} config
 * @returns
 */
const createConfig =
  (config, expect = {}) =>
  (env, argv) => {
    const mode = argv.mode || 'development';
    const devtool = expect['devtool'] ?? 'source-map';

    return {
      mode,
      devtool,
      ...config,
      plugins: [
        ...config.plugins,
        new DefinePlugin({
          'process.env.SERVER_APP_OPTS': product.serverApp,
          'process.env.DATA_FOLDER': product.dataFolderName,
          'process.env.DEVTOOL_FRONTEND_URL': product.devtoolFrontendUrl,
        }),
      ],
    };
  };

module.exports = {
  createConfig,
};
