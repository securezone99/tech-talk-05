const restAPI_Url = process.env.REST_API_URL || "http://localhost:8000";

const PROXY_CONFIG = {
  '/api/': {
    'target': restAPI_Url,
    'secure': false,
    'logLevel': 'debug',
    'changeOrigin': true,
    'pathRewrite': {
      '^/api/': '/'
    }
  },
  '/ws/': {
    'target': restAPI_Url,
    'ws': true,
    'secure': false,
    'logLevel': 'debug',
    'changeOrigin': true,
    'pathRewrite': {
      '^/ws/': '/'
    }
  }
};

module.exports = PROXY_CONFIG;
