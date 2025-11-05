const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './app/static/simple11.html',
  filename: 'simple11.html',
  inject: 'body',
  chunks: ['simple11'],
})

module.exports = {
  context: path.resolve(__dirname),
  devtool: 'source-map',
  entry: {
    simple11: ['./app/js/simple11.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: 'index_bundle.js',
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js',
  },
  devServer: {},
  mode: 'production',
  module: {
    rules: [
      {
        test: require.resolve('snapsvg'),
        use: 'imports-loader?this=>window,fix=>module.exports=0',
      },
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  stats: { children: false },
  plugins: [HtmlWebpackPluginConfig, new WebpackBar()],
}
