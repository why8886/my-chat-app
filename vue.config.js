module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://47.122.95.27/v1', // 后端实际地址
        changeOrigin: true,
        pathRewrite: {'^/api': '/api'},
        secure: false  // 如需忽略证书验证
      }
    }
  }
}