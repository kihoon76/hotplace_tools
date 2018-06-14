/**
	https://www.npmjs.com/package/mssql
*/
var env		= process.env.NODE_ENV || 'local';
var sql 	= require('mssql'),
	log4js	= require('log4js'),
	config	= require('./config.' + env);
	
var logger  = log4js.getLogger('lib/db.js');
var cp = null;

var format = function(param) {
	return {
		success: param.success,
		errMsg: param.errMsg || '',
		count: param.rowsAffected[0],
		recordset: param.recordset
	}
}

module.exports = function() {
	if(!cp) {
		cp = new sql.ConnectionPool(config.db, function(err) {
			if(err) {
				logger.error('Connection Pool not created...', err.message);
				return;		
			}
		});
	}
	
	function execute(q, request, res) {
		res.setHeader('Content-Type', 'text/json');
		request.execute(q, function(err, result) {
			if(err) {
				logger.error(q, err.message);
				res.status(500).json({success:false, errMsg: err.message});
			}
			else {
				result.success = true;
				
				res.status(200).json({success:true});
			}
		});
	}

	function _query(param, res, err, result) {
		var resForm = {}
		res.setHeader('Content-Type', 'text/json');
		if(err) {
			resForm.success = false;
			resForm.msg = err;
		}
		else {
			resForm.success = true;

			if(param.toolName) {
				resForm.toolName = param.toolName;
			}
		}

		res.send(JSON.stringify(resForm));
	}
	
	var obj = {
		deleteDbCollectionGwanliTool: function(param, req, res) {
			var sql = 'update [웹].[dbo].[데이타수집관리] set 관리툴 = null  where 고유번호 = ' + param.key;
			
			cp.request()
			.query(sql, function(err, result) {
				_query(param, res, err, result);
			});
		},
		setDbCollectionGwanli: function(param, req, res) {
			var sql = '';
			if(param.toolName) {
				sql = 'update [웹].[dbo].[데이타수집관리] set 관리자 = \'' + param.damdang + '\', 수집방법 = \'' +  param.soojibMethod + '\', 진행상황 = \'' + param.soojibStatus + '\', 비고 = \'' + param.soojibBigo + '\',  관리툴 = \'' + param.toolName + '\', 진행율 = ' + param.soojibRatio + ', 업데이트주기 = \'' + param.soojibUpdate + '\' where 고유번호 = ' + param.key;
			}
			else {
				sql = 'update [웹].[dbo].[데이타수집관리] set 관리자 = \'' + param.damdang + '\', 수집방법 = \'' +  param.soojibMethod + '\', 진행상황 = \'' + param.soojibStatus + '\', 비고 = \'' + param.soojibBigo + '\',  진행율 = ' + param.soojibRatio + ', 업데이트주기 = \'' + param.soojibUpdate + '\' where 고유번호 = ' + param.key;
			}
			
			console.log(sql);
			cp.request()
			.query(sql, function(err, result) {
				_query(param, res, err, result);
			});
		},
		getDbCollectionGwanli: function(req, res) {
			cp.request()
			.query('select 순서, 고유번호, 관리내용, 관리자, 진행율, 수집방법, 진행상황, 비고, 관리툴, 활성화, 업데이트주기 from [웹].[dbo].[데이타수집관리] order by 순서', function(err, result) {
				var list = null;

				if(err) {
					console.log(err);
				}
				else {
					list = result.recordsets[0];
				}

				res.render('soojib', {list: list});
			});
		},
		getPnuCode: function(q, req, res) {
			res.setHeader('Content-Type', 'text/json');
			cp.request()
			.input('int수집회차', sql.Int, req.query.p_01)
			.execute(q, function(err, result) {
				if(err) {
					logger.error(q, err.message);
					res.status(500).json({success:false, errMsg: err.message, rowsAffected:null, recordset:null});
				}
				else {
					logger.debug(result);
					result.success = true;
					res.status(200).json(format(result));
				}
			});
		},
		setInsOnnaraImya2: function(q, param, res) {
			res.setHeader('Content-Type', 'text/json');
			cp.request()
			.input('PnuSerial', sql.BigInt, param.PnuSerial)
			.input('Imya', sql.VarBinary, param.Imya)
			.execute(q, function(err, result) {
				if(err) {
					logger.error(q, err.message);
					res.status(500).json({success:false, errMsg: err.message});
				}
				else {
					result.success = true;
					
					res.status(200).json({success:true});
				}
			});
		},
		setProcedure: function(spName, req, res) {
			//console.dir(sql);
			switch(req.body.p_nm) {
			case 'INS_Onnara_Imya_2' :
				execute(spName, 
						cp.request()
						  .input('PnuSerial', sql.BigInt, req.body.p_01)
						  .input('Imya', sql.VarBinary, req.body.p_02),
						res);
				break;
			case 'INS_온나라_1국토법지역지구_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('지역지구원문', sql.NVarChar, req.body.p_02)
						  .input('지역지구', sql.NVarChar, req.body.p_03)
						  .input('설명', sql.NVarChar, req.body.p_04),
						res);
				break;
			case 'INS_온나라_2다른법령지역지구_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('법률', sql.NVarChar, req.body.p_02)
						  .input('지역지구', sql.NVarChar, req.body.p_03)
						  .input('지역지구상세', sql.NVarChar, req.body.p_04),
						res);
				break;
			case 'INS_온나라_3시행부칙추가확인_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('원문', sql.NVarChar, req.body.p_02)
						  .input('법률', sql.NVarChar, req.body.p_03)
						  .input('지역지구', sql.NVarChar, req.body.p_04)
						  .input('설명', sql.NVarChar, req.body.p_05),
						res);
				break;
			case 'INS_온나라_4토지이용시행령9조4항_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('원문', sql.NVarChar, req.body.p_02)
						  .input('법률', sql.NVarChar, req.body.p_03)
						  .input('지역지구', sql.NVarChar, req.body.p_04)
						  .input('설명', sql.NVarChar, req.body.p_05),
						res);
				break;
			case 'INS_온나라_개별주택가격_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('landArea', sql.Float, req.body.p_02)
						  .input('baseYear', sql.SmallInt, req.body.p_03)
						  .input('indiHousePrc', sql.BigInt, req.body.p_04)
						  .input('landCalcArea', sql.Float, req.body.p_05)
						  .input('bldgArea', sql.Float, req.body.p_06)
						  .input('dongNo', sql.NVarChar, req.body.p_07)
						  .input('stdmt', sql.NVarChar, req.body.p_08)
						  .input('bldgCalcArea', sql.Float, req.body.p_09),
						res);
				break;
			case 'INS_온나라_건물기본정보_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('번호', sql.SmallInt, req.body.p_02)
						  .input('주부건물여부', sql.NVarChar, req.body.p_03)
						  .input('건물이름', sql.NVarChar, req.body.p_04)
						  .input('지번', sql.NVarChar, req.body.p_05)
						  .input('건물종류코드', sql.NVarChar, req.body.p_06)
						  .input('건물종류이름', sql.NVarChar, req.body.p_07)
						  .input('건물동위치', sql.NVarChar, req.body.p_08)
						  .input('연면적', sql.Float, req.body.p_09)
						  .input('건물구분번호', sql.Int, req.body.p_10)
						  .input('동이름', sql.NVarChar, req.body.p_11)
						  .input('주용도명', sql.NVarChar, req.body.p_12),
						res);
				break;
			case 'INS_온나라_지적도경계점좌표_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('pointNo', sql.SmallInt, req.body.p_02)
						  .input('pointX', sql.Float, req.body.p_03)
						  .input('pointY', sql.Float, req.body.p_04),
						res);
				break;
			case 'INS_온나라_토지정보소유구분_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('공유인수', sql.Int, req.body.p_02)
						  .input('면적', sql.Float, req.body.p_03)
						  .input('토지이동변동사유', sql.NVarChar, req.body.p_04)
						  .input('토지이동변동일', sql.Date, req.body.p_05)
						  .input('소유권변동원인', sql.NVarChar, req.body.p_06)
						  .input('지목', sql.NVarChar, req.body.p_07)
						  .input('소유권변동일', sql.Date, req.body.p_08)
						  .input('소유구분', sql.NVarChar, req.body.p_09),
						res);
				break;
			case 'INS_온나라_getInfoByPnu_1_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('PNU', sql.NVarChar, req.body.p_02)
						  .input('mlno', sql.Int, req.body.p_03)
						  .input('zip', sql.NVarChar, req.body.p_04)
						  .input('bldNm', sql.NVarChar, req.body.p_05)
						  .input('emdNm', sql.NVarChar, req.body.p_06)
						  .input('buldSeq', sql.NVarChar, req.body.p_07)
						  .input('bsisZoneNo', sql.NVarChar, req.body.p_08)
						  .input('rnCd', sql.NVarChar, req.body.p_09)
						  .input('roadAddr', sql.NVarChar, req.body.p_10)
						  .input('bldSlno', sql.Int, req.body.p_11)
						  .input('aphusNm', sql.NVarChar, req.body.p_12)
						  .input('sidoNm', sql.NVarChar, req.body.p_13)
						  .input('jibun', sql.NVarChar, req.body.p_14)
						  .input('riNm', sql.NVarChar, req.body.p_15)
						  .input('emdSn', sql.NVarChar, req.body.p_16)
						  .input('slno', sql.Int, req.body.p_17)
						  .input('aphusYn', sql.NVarChar, req.body.p_18)
						  .input('bldMlno', sql.Int, req.body.p_19)
						  .input('signguNm', sql.NVarChar, req.body.p_20),
						res);
				break;
			case 'INS_온나라_getLandCharacterInfoList_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('PNU', sql.NVarChar, req.body.p_02)
						  .input('spfc2', sql.NVarChar, req.body.p_03)
						  .input('lndFrm', sql.NVarChar, req.body.p_04)
						  .input('rdDist', sql.NVarChar, req.body.p_05)
						  .input('signguCd', sql.NVarChar, req.body.p_06)
						  .input('spcfc', sql.NVarChar, req.body.p_07)
						  .input('lndSeqno', sql.Int, req.body.p_08)
						  .input('lndLevelNm', sql.NVarChar, req.body.p_09)
						  .input('lndCmps', sql.NVarChar, req.body.p_10)
						  .input('rdTuchNm', sql.Int, req.body.p_11)
						  .input('spfc1', sql.NVarChar, req.body.p_12)
						  .input('lndCmpsNm', sql.NVarChar, req.body.p_13)
						  .input('hrmflnsWste', sql.NVarChar, req.body.p_14)
						  .input('rdTuch', sql.NVarChar, req.body.p_15)
						  .input('baseMon', sql.NVarChar, req.body.p_16)
						  .input('lndFrmNm', sql.Int, req.body.p_17)
						  .input('hrmflnsRway', sql.NVarChar, req.body.p_18)
						  .input('lndLevel', sql.Int, req.body.p_19),
						res);
				break;
			case 'INS_온나라_selectDevelopInfoDetailList_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('LAST_STEP_CD', sql.NVarChar, req.body.p_02)
						  .input('buldHoCo', sql.Int, req.body.p_03)
						  .input('competDe', sql.NVarChar, req.body.p_04)
						  .input('devlopPlanNtfcNo', sql.NVarChar, req.body.p_05)
						  .input('aceptncPopltn', sql.Int, req.body.p_06)
						  .input('devlopPlanLcde', sql.NVarChar, req.body.p_07)
						  .input('LAST_STEP_NM', sql.NVarChar, req.body.p_08)
						  .input('oprtnPlanLcde', sql.NVarChar, req.body.p_09)
						  .input('relateBasisLaw', sql.NVarChar, req.body.p_10)
						  .input('oprtnPlanNtfcNo', sql.NVarChar, req.body.p_11)
						  .input('bsnsDstrcAr', sql.Float, req.body.p_12)
						  .input('DSTRC_CD', sql.NVarChar, req.body.p_13)
						  .input('dstrcAppnNtfcNo', sql.NVarChar, req.body.p_14)
						  .input('dstrcAppnLcde', sql.NVarChar, req.body.p_15)
						  .input('opertnMan', sql.NVarChar, req.body.p_16)
						  .input('bsnsDstrcNm', sql.NVarChar, req.body.p_17)
						  .input('lcAdres', sql.NVarChar, req.body.p_18),
						res);
				break;
			case 'INS_온나라_selectDevelopInfoDetailList_2' : 
				execute(spName, 
						cp.request()
						  .input('온나라PNU_고유번호', sql.BigInt, req.body.p_01)
						  .input('LAST_STEP_CD', sql.NVarChar, req.body.p_02)
						  .input('buldHoCo', sql.Int, req.body.p_03)
						  .input('competDe', sql.NVarChar, req.body.p_04)
						  .input('devlopPlanNtfcNo', sql.NVarChar, req.body.p_05)
						  .input('aceptncPopltn', sql.Int, req.body.p_06)
						  .input('devlopPlanLcde', sql.NVarChar, req.body.p_07)
						  .input('LAST_STEP_NM', sql.NVarChar, req.body.p_08)
						  .input('oprtnPlanLcde', sql.NVarChar, req.body.p_09)
						  .input('relateBasisLaw', sql.NVarChar, req.body.p_10)
						  .input('oprtnPlanNtfcNo', sql.NVarChar, req.body.p_11)
						  .input('bsnsDstrcAr', sql.Float, req.body.p_12)
						  .input('DSTRC_CD', sql.NVarChar, req.body.p_13)
						  .input('dstrcAppnNtfcNo', sql.NVarChar, req.body.p_14)
						  .input('dstrcAppnLcde', sql.NVarChar, req.body.p_15)
						  .input('opertnMan', sql.NVarChar, req.body.p_16)
						  .input('bsnsDstrcNm', sql.NVarChar, req.body.p_17)
						  .input('lcAdres', sql.NVarChar, req.body.p_18),
						res);
				break;
			}
		}
	};
	
	return obj; 
}