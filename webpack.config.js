const {
	DefinePlugin,
	HotModuleReplacementPlugin,
	LoaderOptionsPlugin
} = require('webpack');
const libpath = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, { mode }) => {
	const dst = 'app/dst';
	const generateScopedName = '[name]__[local]_[hash:base64:5]';
	const context = libpath.join(__dirname, 'src/');
	const presets = ['react'];
	const isProduction = mode === 'production';
	const entryMain = [libpath.join(context, 'main')];
	const entryPicker = [libpath.join(context, 'picker')];

	const plugins = [
		new CleanWebpackPlugin(
			[libpath.join(dst, 'main'), libpath.join(dst, 'picker')],
			{
				root: __dirname,
				verbose: false,
				dry: false,
				exclude: ['index.html']
			}
		),
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(mode)
			}
		}),
		new LoaderOptionsPlugin({
			options: {
				context
			}
		})
	];

	if (isProduction) {
		presets.push(
			[
				'env',
				{
					targets: {
						chrome: 59
					}
				}
			],
			'stage-3'
		);
		entryMain.push('babel-polyfill');
		entryPicker.push('babel-polyfill');
	} else {
		plugins.push(new HotModuleReplacementPlugin());
		entryMain.push(
			'webpack-dev-server/client?http://0.0.0.0:3000',
			'webpack/hot/only-dev-server',
			'react-hot-loader/patch'
		);
		entryPicker.push(
			'webpack-dev-server/client?http://0.0.0.0:3000',
			'webpack/hot/only-dev-server',
			'react-hot-loader/patch'
		);
	}

	return {
		context,
		entry: {
			'main/index': entryMain,
			'picker/index': entryPicker
		},
		output: {
			path: libpath.join(__dirname, dst),
			publicPath: 'http://localhost:3000/',
			filename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.js(x?)$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					options: {
						babelrc: false,
						presets,
						plugins: [
							'transform-object-rest-spread',
							'transform-decorators-legacy',
							[
								'react-css-modules',
								{
									context,
									generateScopedName,
									filetypes: {
										'.scss': {
											syntax: 'postcss-scss'
										}
									}
								}
							]
						]
					}
				},
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						`css-loader?importLoader=1&modules&localIdentName=${generateScopedName}`,
						'postcss-loader',
						'sass-loader'
					]
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		},
		resolve: {
			extensions: ['.js', '.jsx']
		},
		plugins,
		node: {
			__filename: false,
			__dirname: false
		},
		target: 'electron-renderer',
		devServer: {
			hot: true,
			port: 3000,
			host: '0.0.0.0',
			contentBase: libpath.join(__dirname, dst)
		}
	};
};
