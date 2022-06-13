var path = require('path');

module.exports = function (env) {

  return {
    mode: env.production ? 'production' : 'development',
    devtool: 'inline-source-map',

    entry: {
      main: './src/index.ts',
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: "vdom",
      libraryTarget: 'umd',
    },

    plugins: [
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    resolve: { extensions: ['.ts', '.js'], },
    devServer: { static: './dist' },
  };
};
