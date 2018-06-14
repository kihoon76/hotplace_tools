var express    = require('express'),
	log4js	   = require('log4js'),
	db         = require('../lib/db')(),
	config	   = require('../lib/config.' + (process.env.NODE_ENV || 'local')),
	uuid	   = require('uuid/v1');

var router     = express.Router();
var logger	   = log4js.getLogger('index.js');

router.use(function preProcess(req, res, next) {
	logger.debug('요청 URL : ', req.originalUrl);
	logger.debug('요청 METHOD : ', req.method);
	
	if(req.method == 'GET') {
		logger.debug('파라미터  query : ', req.query);
	}
	else {
		logger.debug('파라미터 params: ', req.body);
	}
	
    next();
});

router.get('/soojib' , function(req, res) {
	db.getDbCollectionGwanli( req, res);
	//res.render('soojib');
});

router.get('/soojib/download/:fname', function(req, res) {
	var fname = req.params.fname;
	var file = config.uploadPath + fname;
	res.download(file);
});

router.get('/soojib/delete/:key', function(req, res) {
	var key = req.params.key;
	
	db.deleteDbCollectionGwanliTool({key: key}, req, res);
});

router.post('/soojib/modify', function(req, res) {
	
	//res.setHeader('Content-Type', 'application/json');
	var fileName = '';
	var resForm = {}
	var param = {
		damdang: req.body.damdang,
		soojibMethod: req.body.soojibMethod,
		soojibStatus: req.body.soojibStatus,
		soojibBigo: req.body.soojibBigo,
		toolName: '',
		soojibRatio: req.body.soojibRatio,
		soojibUpdate : req.body.soojibUpdate,
		key: req.body.key
	};

	if(req.files) {
		var tool = req.files.program;
		var gubun = tool.name.lastIndexOf('.');
		var ext  = tool.name.substring(gubun+1);
		var fname = uuid();
		var f_fullname = fname + '.' + ext;

		tool.mv(config.uploadPath + f_fullname, function(err) {
			if (err) {
				resForm.success = false;
				resForm.msg = err;

				res.send(JSON.stringify(resForm));
			}
			else {
				//console.log(req.body)
				param.toolName = f_fullname;
				
				console.log(param.toolName);
				db.setDbCollectionGwanli(param, req, res);
				//resForm.success = true;
				//res.send(JSON.stringify(resForm));
			}
		});
	}
	else {
		db.setDbCollectionGwanli(param, req, res);
	}
});

router.get('/api/onnara/pnucode', function(req, res) {
	db.getPnuCode('[데이터수집].[dbo].[SEL_온나라수집PNU_고유번호]', req, res);
});

router.post('/api/onnara', function(req, res) {
	db.setProcedure('[데이터수집].[dbo].' + req.body.p_nm, req, res);
});

router.get('/download', function(req, res) {
	res.render('download');
});

router.get('/download/:ver', function(req, res) {
	var ver = req.params.ver;
	var file = __dirname + '/../download/' + ver + '/온나라' + ver + '.zip';
	res.download(file);
});

router.get('/map', function(req, res) {
	var level = 1;
	var lng = req.query.lng;
	var lat = req.query.lat;
	var level = req.query.level;

	res.render('daummap', {lng:lng, lat:lat, level: level});
});

module.exports = router;