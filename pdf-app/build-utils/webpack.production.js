const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
	mode: 'production',
	output: {
		filename: '[name].js',
		chunkFilename: 'bundle.[name].js',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader', 'postcss-loader'],
			},
		],
	},
	optimization: {
		minimizer: [
			// For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`)
			`...`,
			new CssMinimizerPlugin(),
		],
	},
	plugins: [
		new ProgressBarPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].[chunkhash].css',
			chunkFilename: '[id].[chunkhash].css',
		}),
	],
};
