const path = require('path');
const webpack = require('webpack');

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      { pattern: 'test.ts', watched: false }
    ],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    preprocessors: {
      'test.ts': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',

      resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.ts'],
      },

      module: {

        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            loader: 'awesome-typescript-loader',
            options: {
              silent: true
            }
          }
        ]

      },

      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.(ts|js)($|\?)/i
        }),

        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
          __dirname
        )
      ]
    },

    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },

    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: true
  })
};
