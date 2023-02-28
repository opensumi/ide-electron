const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { createConfig } = require('./webpack.base.config');

const tsConfigPath = path.join(__dirname, '../tsconfig.json');
const distDir = path.join(__dirname, '../app/webview');

module.exports = createConfig(
  {
    entry: require.resolve('@opensumi/ide-webview/lib/electron-webview/host-preload.js'),
    target: 'node',
    output: {
      filename: 'host-preload.js',
      path: distDir,
    },
    node: false,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigPath,
        }),
      ],
    },
    module: {
      // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
      exprContextCritical: false,
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            configFile: tsConfigPath,
            transpileOnly: true,
          },
        },
      ],
    },
    externals: [
      {
        nsfw: 'nsfw',
      },
      ({ context, request }, callback) => {
        if (['node-pty', '@parcel/watcher', 'spdlog', 'electron', 'vm2'].indexOf(request) !== -1) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      },
    ],
    resolveLoader: {
      modules: [path.join(__dirname, '../node_modules')],
      extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
      mainFields: ['loader', 'main'],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: require.resolve('@opensumi/ide-webview/lib/electron-webview/plain-preload.js'),
            to: path.join(distDir, 'plain-preload.js'),
          },
        ],
      }),
    ],
  },
  {
    devtool: 'eval',
  },
);
