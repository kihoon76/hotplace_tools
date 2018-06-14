var config = require('./config.global');

config.log = {
	appenders: {hotplace_tools: {
		type:'dateFile',
		filename: '/home/khnam/apis/hotplace_tools/logs/hotplace_tools.log',
		pattern: '-yyyy-MM-dd',
		alwaysIncludePattern: true
	}},
	categories: {default: {appenders: ['hotplace_tools'], level: 'debug'}}
};
config.uploadPath='/home/khnam/tools_upload/';
module.exports = config;