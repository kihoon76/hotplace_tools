var config = require('./config.global');

config.log = {
	appenders: {tools: {type:'console'}},
	categories: {default: {appenders: ['tools'], level: 'debug'}}
};
config.uploadPath='D:\\test\\tools\\';
module.exports = config;