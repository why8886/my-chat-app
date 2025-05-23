module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_DIFY_API_URL,
        changeOrigin: true,
        pathRewrite: {'^/api': ''},
        secure: false  // 如需忽略证书验证
      }
    }
  }
}