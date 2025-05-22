const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	output: {
		filename: '[name].js',
		chunkFilename: 'bundle.[name].js',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
		],
	},
	devServer: {
		compress: true,
		historyApiFallback: true,
		hot: true,
		port: 5000,
		static: {
			directory: path.resolve(__dirname, 'dist'),
			watch: true,
		},
		client: {
			progress: true,
			overlay: {
				runtimeErrors: false,
			},
			logging: 'error',
		},
		devMiddleware: {
			writeToDisk: true,
		},
		allowedHosts: 'all',
	},
};
