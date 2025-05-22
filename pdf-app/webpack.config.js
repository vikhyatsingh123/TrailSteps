const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = (props) => {
	const mode = props?.development ? 'development' : 'production';

	return merge(
		{
			entry: path.resolve(__dirname, 'src/index.tsx'),
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: 'pdf.js',
			},
			resolve: {
				extensions: ['.ts', '.tsx', '.js'],
			},
			target: 'web',
			module: {
				rules: [
					{
						use: 'ts-loader',
						test: /\.(ts|tsx)$/,
						exclude: /node_modules/,
					},
					{
						test: /\.m?js$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
					},
				],
			},
			plugins: [
				new CleanWebpackPlugin({
					cleanStaleWebpackAssets: true,
				}),
				new HtmlWebpackPlugin({
					template: path.join(__dirname, 'public/index.html'),
					filename: 'index.html',
					cache: false,
				}),
			],
		},
		require(`./build-utils/webpack.${mode}`),
	);
};
