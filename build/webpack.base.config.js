/**
 *
 * @param {import("webpack").Configuration} config
 * @returns
 */
const createConfig = (config, expect = {}) => (env, argv) => {
    console.log('argv', argv);
    let mode = argv.mode || 'none';
    let devtool = 'none';
    if (!argv.mode || argv.mode === 'development') {
      // 无设置或设置为 development 时，默认为开发环境
      devtool = expect['devtool'] ?? 'source-map';
    }

    return {
      ...config,
      mode,
      devtool,
    };
  };

module.exports = {
  createConfig,
};
