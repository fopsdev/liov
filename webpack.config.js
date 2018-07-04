const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Is the current build a development build
const IS_DEV = process.env.NODE_ENV === 'dev'

const dirNode = 'node_modules'
const dirApp = path.join(__dirname, 'app')
const dirAssets = path.join(__dirname, 'assets')

const appHtmlTitle = 'CeLiCa Testbed'

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        bundle: path.join(dirApp, 'index')
    },
    resolve: {
        modules: [dirNode, dirApp, dirAssets]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: IS_DEV ? 'dev' : 'prod'
        }),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.ejs'),
            title: appHtmlTitle
        })
    ],
    module: {
        rules: [
            // BABEL
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    compact: true,
                    presets: [
                        [
                            'env',
                            {
                                modules: false,
                                useBuiltIns: true,
                                targets: {
                                    browsers: [
                                        'Chrome >= 60',
                                        'Safari >= 10.1',
                                        'iOS >= 10.3',
                                        'Firefox >= 54',
                                        'Edge >= 15'
                                    ]
                                }
                            }
                        ]
                    ]
                },
                exclude: /(node_modules)/
            },

            // EJS
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            },

            // IMAGES
            {
                test: /\.(jpe?g|png|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }
        ]
    }
}
