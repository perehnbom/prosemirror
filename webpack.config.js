var path = require("path");
var webpack = require("webpack");
var plugins = [];
var BUILD = true;

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
  plugins: plugins,
  devtool: 'inline-source-map'
};
