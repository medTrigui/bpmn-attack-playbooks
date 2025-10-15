module.exports = {
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 3000,
      },
    },
  },
};

