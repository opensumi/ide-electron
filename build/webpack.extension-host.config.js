const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const { ProvidePlugin } = require('webpack');
const { createConfig } = require('./webpack.base.config');

const tsConfigPath = path.join(__dirname, '../tsconfig.json');
const distDir = path.join(__dirname, '../app/extension');

const nodeTarget = createConfig({
  entry: path.join(__dirname, '../src/extension/index'), // require.resolve('@opensumi/ide-extension/lib/hosted/ext.process.js'),
  target: 'node',
  output: {
    filename: 'index.js',
    path: distDir,
  },
  node: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json', '.less'],
    mainFields: ['main'],
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
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      { test: /\.css$/, loader: require.resolve('null-loader') },
      { test: /\.less$/, loader: require.resolve('null-loader') },
    ],
  },
  externals: [
    {
      nsfw: 'nsfw',
    },
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', 'vm2', 'keytar'].indexOf(request) !== -1) {
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
});

const workerTarget = createConfig({
  entry: path.join(__dirname, '../src/extension/index.worker'), // require.resolve('@opensumi/ide-extension/lib/hosted/ext.process.js'),
  target: 'webworker',
  output: {
    filename: 'index.worker.js',
    path: distDir,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json', '.less'],
    mainFields: ['main'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
    fallback: {
      os: false,
      net: false,
      path: false,
      global: false,
      util: false,
      crypto: false,
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
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
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      { test: /\.css$/, loader: require.resolve('null-loader') },
      { test: /\.less$/, loader: require.resolve('null-loader') },
    ],
  },
  externals: [
    {
      nsfw: 'nsfw',
    },
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', 'vm2', 'yargs', 'keytar'].indexOf(request) !== -1) {
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
});

module.exports = [nodeTarget, workerTarget];
