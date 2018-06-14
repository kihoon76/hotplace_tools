var config = require('./config.global');

config.log = {
	appenders: {hotplace_tools: {
		type:'dateFile',
		filename: '/home/hotplace/apis/hotplace_tools/logs/hotplace_tools.log',
		pattern: '-yyyy-MM-dd',
		alwaysIncludePattern: true
	}},
	categories: {default: {appenders: ['hotplace_tools'], level: 'debug'}}
};
config.uploadPath='/home/hotplace/tools_upload/';
module.exports = config;