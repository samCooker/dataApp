/**
 * Created by Administrator on 2015/11/30.
 */

(function(){
    appModule
        .factory('tipMsg', TipMsgFun)//信息提示
        .factory('tools',ToolsFun)//各工具方法
        .factory('dbTool',DbToolFun)//本地存储
        .factory('httpHelper',HttpHelperFun)//封装http请求
    ;

    /**
     * 各种消息提示框
     * @param $ionicPopup
     * @returns {*}
     * @constructor
     */
    function TipMsgFun($ionicPopup){
        return {
            showMsg:showMsgFun,//Toast提示框
            alertMsg:alertMsgFun, //带确定按钮的提示框
            inputMsg:inputMsgFun,//自定义的可输入信息的对话框
            confirm:confirmFun//确定对话框
        };

        /**
         * Toast提示框
         * @param msg 显示的信息
         * @param duration 持续时间('short','long')默认short
         * @param position 显示位置('top', 'center', 'bottom'),默认center
         */
        function showMsgFun(msg,duration,position){
            var _duration=duration||'short';
            var _position=position||'center';
            if(window.plugins&&window.plugins.toast){
                //有toast插件
                window.plugins.toast.show(msg,_duration,_position);
            }else{
                //无toast插件显示提示框
                alertMsgFun(msg);
            }
        }

        /**
         * 带确定按钮的提示框 title:提示框标题 btnText:按钮的文字
         * @param msg
         * @param title
         * @param btnText
         */
        function alertMsgFun(msg,title,btnText){
            var alertPopup = $ionicPopup.alert({
                title: title||'提示信息', // String. 弹窗的标题。
                subTitle: '', // String (可选)。弹窗的子标题。
                template: msg, // String (可选)。放在弹窗body内的html模板。
                okText: btnText||'确定'// String (默认: 'OK')。OK按钮的文字。
                //templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL。
                //okType: '' // String (默认: 'button-positive')。OK按钮的类型。
            });
            alertPopup.then(function(res) {
                //点击确定后
            });
        }

        /**
         * 可输入信息的对话框
         * @param $scope
         * @param title
         * @param subTitle
         * @returns {*}
         */
        function inputMsgFun($scope,title,subTitle){
            $scope._popData = {};//需要预先定义一个弹出窗数据接收对象
            return $ionicPopup.show({
                template: '<input type="text" ng-model="_popData.text">',
                title: title||'请输入内容',
                subTitle:subTitle||'',
                scope: $scope,//弹出窗的scope继承自父页面，可以访问父页面数据
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>保存</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            //不允许用户关闭 e.preventDefault();
                            return $scope._popData.text;
                        }
                    }
                ]
            });
        }

        /**
         * 带有确定、取消的对话框
         * @param msg
         * @param title
         * @returns {*} 对话框对象
         */
        function confirmFun(msg,title){
           return $ionicPopup.confirm({
               okText:'确定',
               cancelText:'取消',
               title: title||'确认操作',
               template: msg
            });
        }
    }

    /**
     * 各工具方法
     * @returns {*}
     * @constructor
     */
    function ToolsFun(){
        return {
        };
    }

    /**
     * 本地存储
     * @param tipMsg
     * @returns {*}
     * @constructor
     */
    function DbToolFun(tipMsg){

        var _db;
        var _fdId='fodoItem';

        return {
            initWebSqlDb:initWebSqlDbFun,
            putFdData:putFdDataFun,
            postOrUpdate:postOrUpdateFun,
            findFdData:findFdDataFun,
            getAllFdData:getAllFdDataFun,
            rmFdData:removeFdDataFun,
            getAllDocs:getAllDocsFun,
            getDb:getDbFun
        };

        /**
         * 创建一个本地存储数据库
         * @param dbname 数据库名称
         */
        function initWebSqlDbFun(dbname){
            _db=new PouchDB(dbname, {adapter : 'websql'});
        }

        /**
         * 保存数据，_id指定
         * @param data 数据对象
         * @returns {*}
         */
        function putFdDataFun(data){
           data._id=_fdId+data.title;//指定id
           return _db.put(data).then(function (result) {
                tipMsg.showMsg('保存成功。');
                return result;
            }).catch(function (err) {
                tipMsg.showMsg('保存失败。');
                console.log(err);
            });
        }

        /**
         * 保存一条数据，有_id则进行更新操作，否则新增
         * @param data
         * @returns {*}
         */
        function postOrUpdateFun(data){
            if(data._id) {
                return _db.get(data._id).then(function (doc) {
                    doc.title = data.title;
                    doc.content = data.content;
                    return _db.put(doc).then(function (result) {
                        tipMsg.showMsg('修改成功。');
                        return result;
                    }).catch(function (err) {
                        tipMsg.showMsg('修改失败。');
                    });
                });
            }else{
                return _db.post(data).then(function (result) {
                    tipMsg.showMsg('保存成功。');
                    return result;
                }).catch(function (err) {
                    tipMsg.showMsg('保存失败。');
                });
            }
        }

        /**
         * 根据title查找doc
         * @param title
         * @returns {*}
         */
        function findFdDataFun(title){
            return _db.find({
                selector: {title:{$eq:title}},
                fields: ['_id','title','content','img']
            }).then(function(data){
                var itemList=[];
                if(data.docs&&data.docs.length>0){
                    data.docs.forEach(function(doc){
                        if(doc.title){
                            itemList.push(doc);
                        }
                    });
                }
                return itemList;
            });
        }

        /**
         * 获取所有doc数据
         * @returns {*}
         */
        function getAllDocsFun(){
            return _db.allDocs({include_docs: true});
        }

        /**
         * 获取所有含有title的doc
         * @returns {*}
         */
        function getAllFdDataFun(){
            var data=[];
            return _db.allDocs({include_docs: true}).then(function (result) {
                if(result.rows&&result.rows.length>0){
                    result.rows.forEach(function(row){
                        if(row.doc&&row.doc.title){
                            data.push(row.doc);
                        }
                    });
                }
                return data;
            });
        }

        /**
         * 删除指定的doc
         * @param item
         */
        function removeFdDataFun(item){
           return _db.remove(item);
        }

        /**
         * 获取创建的数据库
         * @returns _db 在应用启动时创建，见app.js
         */
        function getDbFun(){
            return _db;
        }

    }

    /**
     * 封装http请求
     * @param $q
     * @param $http
     * @param $httpParamSerializer
     * @returns {*}
     * @constructor
     */
    function HttpHelperFun($q,$http,$httpParamSerializer) {
        return {
            httpFormPost:httpFormPostFun,
            httpPost:httpPostFun,
            httpGet:httpGetFun
        };

        function httpPostFun(url,formData) {
            var delay = $q.defer();
            $http.post(url,formData)
                .success(function (data) {
                    delay.resolve(data);
                })
                .error(function (error) {
                    delay.reject(error);
                });
            return delay.promise;
        }

        function httpFormPostFun(url,formData) {
            var delay = $q.defer();
            $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializer(formData)
            })
                .success(function (data) {
                    delay.resolve(data);
                })
                .error(function (error) {
                    delay.reject(error);
                });
            return delay.promise;
        }

        function httpGetFun(url) {
            var delay = $q.defer();
            $http.get(url)
                .success(function (data) {
                    delay.resolve(data);
                })
                .error(function (error) {
                    console.log(error);
                });
            return delay.promise;
        }
    }

})();
