const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = (props) => {
	const mode = props?.development ? 'development' : 'production';

	return merge(
		{
			entry: {
				contentScript: path.resolve('src/content-script/index.ts'),
				background: path.resolve('src/service-worker/index.ts'),
				panel: path.resolve('src/panel/index.tsx'),
			},
			output: {
				filename: '[name].js',
				publicPath: '',
				path: path.resolve('dist'),
				assetModuleFilename: 'assets/img/[hash][ext][query]',
			},
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
					template: path.join(__dirname, 'public/panel.html'),
					filename: 'panel.html',
					chunks: ['panel'],
					cache: false,
				}),
				new CopyWebpackPlugin({
					patterns: [
						{
							from: path.resolve('public/manifest.json'),
							to: path.resolve('dist/manifest.json'),
						},
						{
							from: path.resolve('public/favicon'),
							to: path.resolve('dist/favicon'),
						},
					],
				}),
			],
			resolve: {
				extensions: ['.tsx', '.ts', '.js', '.json', '.svg'],
			},
			target: 'web',
		},
		require(`./build-utils/webpack.${mode}`),
	);
};
