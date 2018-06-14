$(function() {
   var selectedFiles = {};
   var $selectedTr = null;

   var _fileUp = $('#fileUp').uploadFile({
        url: '/soojib/modify',
        fileName: 'program',
        showCancel: true,
        showDone: true,
        autoSubmit: false,
        showPreview: true,
        dynamicFormData: function() {
            var data = {
                'key': $('#key').val(),
                'damdang':  $('#damdang').val(),
                'soojibMethod' : $('#soojibMethod').val(),
                'soojibStatus': $('#soojibStatus').val(),
                'soojibBigo' : $('#soojibBigo').val(),
                'soojibRatio' : $('#soojibRatio').val(),
                'soojibUpdate' : $('#soojibUpdate').val()
            };
            return data;   
        },
        //dragdropWidth: '250px',
        //previewWidth: '100px',
        //previewHeight: '100px',
        //statusBarWidth: '200px',
        //allowedTypes: 'jpg,png,gif',
        returnType: 'json',
        //dragDropStr: '끌어다 놓기',
        maxFileCount: 1,
        onSuccess: _onSuccess,
        onError: _onError,
        onSelect: _onSelect,
        onCancel: _onCancel
    });

   $('table tbody tr').on('dblclick', function() {
       if($(this).hasClass('line') || $(this).hasClass('inactive')) return;
       $selectedTr = $(this);
       //console.log($tr.)
        _openModalsize($selectedTr, {width: '600px', height: '800px'});
   });

   $('#btnModify').on('click', function() {

        if( _hasFile()) {
            _fileUp.startUpload();
        }
        else {
           $.ajax({
               url: '/soojib/modify',
               type: 'POST',
               contentType: 'application/json',
               data: JSON.stringify(_getParam()),
               success: function(data) {
                    console.log(data)
                    if(data.success) {
                        _refreshTr(_getParam());
                    }
                    else {
                        alert('오류 (' + data.msg.originalError.info.message + ')');
                    }

                    _closeModal();  
               },
               error: function() {

               }
           }); 
        }
     
   });

   function _getParam(fileName) {
       var param =  {
            key: $('#key').val(),
            damdang: $('#damdang').val(),
            soojibMethod: $('#soojibMethod').val(),
            soojibStatus: $('#soojibStatus').val(),
            soojibBigo: $('#soojibBigo').val(),
            soojibRatio : $('#soojibRatio').val(),
            soojibUpdate : $('#soojibUpdate').val()
        };

        if(fileName) {
            param.fileName = fileName;
        }

        return param;
   }

   function _refreshTr(param) {
        $selectedTr.data('damdang', param.damdang);
        $selectedTr.data('soojibMethod', param.soojibMethod);
        $selectedTr.data('soojibStatus', param.soojibStatus);
        $selectedTr.data('soojibBigo', param.soojibBigo);
        $selectedTr.data('soojibRatio', param.soojibRatio);
        $selectedTr.data('soojibUpdate', param.soojibUpdate);

        $selectedTr.find('.td-damdang').text(param.damdang);
        $selectedTr.find('.td-method').text(param.soojibMethod);
        $selectedTr.find('.td-status').text(param.soojibStatus);
        $selectedTr.find('.td-bigo').text(param.soojibBigo); 
        $selectedTr.find('.td-progressive').text(param.soojibRatio + '%'); 
        $selectedTr.find('.td-update').text(param.soojibUpdate); 


        if(param.fileName) {
            $selectedTr.find('.td-tool').html('<a href="#" onclick="downloadTool(\'' + param.fileName + '\')">다운로드</a><a href="#" onClick="deleteTool(\''+ $selectedTr.data('seri')+'\')"><img src="/resources/img/delete.png" /></a>');
        }
        
   }

   function _collapseText(str) {
       if(str) {
           if(str.length > 20) {
               str = str.substring(0, 20) + '...';
           }
       }

       return str;
   }

   function _openModalsize($tr, size) {
        _fileUp.reset();
        selectedFiles = {};
        if(size) {
            var $modal = $('#centerModal .modal-content');
            $modal.css({'width':size.width, 'height': size.height});
        }
    
        $('#spCenterModalTitle').html('<h2>' + $tr.data('content') + '</h2>');
        $('#damdang').val($tr.data('damdang'));
        $('#soojibMethod').val($tr.data('soojibMethod'));
        $('#soojibStatus').val($tr.data('soojibStatus'));
        $('#soojibBigo').val($tr.data('soojibBigo'));
        $('#soojibUpdate').val($tr.data('soojibUpdate'));
        $('#key').val($tr.data('seri'));
        $('#centerModal').modal('show');
   }

   function _closeModal() {
       $('#centerModal').modal('hide');
   }

   function _save(data) {
        if(_fileUp) {
           
        }
    }

    function _onSuccess(files, data, xhr) {
        console.log(xhr)
        console.log(data)
        //_refreshTr();
        if(data.success) {
            _refreshTr(_getParam(data.toolName)); 
        }
        else {
            alert('오류 (' + data.msg + ')');
        }
        _closeModal();
    }

    function _onError(files, status, errMsg) {
        alert('오류 (' + errMsg + ')');
    }

    function _onSelect(files) {
        if(selectedFiles[files[0].name]) {
            alert('같은 이름의 파일이 있습니다.');
            return false;
        }
        selectedFiles[files[0].name] = files[0];
        console.log(files)
    }

    function _onCancel(files) {
        delete selectedFiles[files[0].name];
    }

    function _hasFile() {
        for(var k in selectedFiles) {
            if(selectedFiles[k]) return true;
        }

        return false;
    }

    window.downloadTool = function(fname) {
        window.location.href = 'http://hotplace.ddns.net:11000/soojib/download/' + fname;
    }

    window.deleteTool = function(key) {
        if(confirm('관리툴을 지우시겠습니까?')) {
          
           $.ajax({
                async: false,
                url: 'soojib/delete/' + key,
                type: 'GET',
                contentType: 'application/json',
                success: function(data) {
                   
                    if(data.success) {
                        alert('삭제되었습니다');
                        window.location.reload();
                    }
                    else {
                        alert('오류 (' + data.msg + ')');
                    }
 
                },
                error: function() {

                }
            }); 
        }
    }
   
});