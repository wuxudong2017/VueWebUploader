module.exports = {
    lintOnSave:false,
    devServer: { // 开发环境下的配置
        open: true,
        // host: "localhost",
        port:8080,
        // 支持webpack 下的所有devServer的配置
        // 一般使用静态代理
        proxy: {
            '/fdfs': {
                target: `http://192.168.20.82:8082`,
                ws: true,
                changeOrigin: true,
                pathRewrite:{
                    ['^/fdfs']: '/fdfs'
                },
            },
            
            
        },
        // after: require('./mock/mockServe.js')
       
    },
    parallel: require('os').cpus().length > 1,
}