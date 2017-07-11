const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const PROD = process.env.NODE_ENV === "production";

const OUTPUT_PATH = PROD
  ? path.resolve(__dirname, "dist")
  : path.resolve(__dirname, "build");

const cssDev = ["style-loader", "css-loader"];
const cssProd = ExtractTextPlugin.extract({
  fallback: "style-loader",
  use: "css-loader"
});
const cssConfig = PROD ? cssProd : cssDev;

module.exports = {
  entry: "./src/index.js",

  output: {
    filename: addHash("bundle.js", "chunkhash"),
    path: OUTPUT_PATH,
    publicPath: "/"
  },

  module: {
    noParse: /(mapbox-gl)\.js$/, // https://github.com/mapbox/mapbox-gl-js/issues/4359
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: cssConfig
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },

  devtool: "source-map",

  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    publicPath: "/",
    hot: true,
    compress: false,
    stats: "minimal",
    port: 9110,
    historyApiFallback: true
  },

  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.ejs",
      minify: false
    }),
    new webpack.DefinePlugin({
      PROD: JSON.stringify(PROD)
    }),
    new CopyWebpackPlugin([{ from: "data.json", to: OUTPUT_PATH }], {
      copyUnmodified: true
    })
  ]
};

if (PROD) {
  module.exports.plugins = module.exports.plugins.concat([
    new ExtractTextPlugin({
      disable: !PROD,
      filename: addHash("bundle.css", "chunkhash")
    })
  ]);
} else {
  module.exports.plugins = module.exports.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new WriteFilePlugin()
  ]);
}

function addHash(template, hash) {
  return PROD ? template.replace(/\.[^.]+$/, `.[${hash}]$&`) : template;
}
