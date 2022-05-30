const { DefinePlugin, NormalModuleReplacementPlugin } = require('webpack');

const product = require('../product.json');

/**
 * @param {import("webpack").Configuration} config
 * @returns
 */
const createConfig =
  (config, expect = {}) =>
  (env, argv) => {
    const mode = argv.mode || 'development';
    const devtool = expect['devtool'] ? 'source-map' : false;

    return {
      mode,
      devtool,
      ...config,
      plugins: [
        ...(config.plugins || []),
        new DefinePlugin({
          __PRODUCT: JSON.stringify(product),

          SERVER_APP_OPTS: JSON.stringify(product.serverApp || {}),
          'process.env.DATA_FOLDER': JSON.stringify(product.dataFolderName || ''),
          'process.env.DEVTOOL_FRONTEND_URL': JSON.stringify(product.devtoolFrontendUrl || ''),
        }),
      ].filter(Boolean),
    };
  };

module.exports = {
  createConfig,
};
