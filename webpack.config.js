var path = require("path");
var webpack = require("webpack");
var plugins = [];
var BUILD = false;

if(BUILD){
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize : true}));
}


module.exports = {
  context: path.resolve(__dirname, './app'),
  entry: {
    app: "./app.js"
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/assets/",
    filename: "[name].bundle.js"
  },
  module: {
         loaders: [
             {
                 test: /\.js$/,
                 exclude: [/node_modules/],
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015']
                 }
             }
         ]
     },
  plugins: plugins,
  devtool: 'inline-source-map'
};
