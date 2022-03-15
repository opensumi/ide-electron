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
    };
  };

module.exports = {
  createConfig,
};
