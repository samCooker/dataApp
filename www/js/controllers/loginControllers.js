/**
 * Created by Cookie on 2016/2/19.
 */
(function(){
    appModule
        .controller('loginController',LoginController)// 登陆控制器
        .factory('loginFac',LoginFac)
    ;
    // 登陆控制器
    function LoginController($scope,$state,loginFac){
        $scope.loginData={username:'sam',password:'1'};
        $scope.login=loginFun;//登陆

        //登陆
        function loginFun(){
            loginFac.login($scope.loginData).then(function (data) {
                if(data){
                    $state.go('app.oa');
                }
            });
        }
    }

    //
    function LoginFac(httpHelper,baseUrl,loginUrl,logoutUrl) {
        return {
            login:loginFun,
            logout:logoutFun
        };

        function loginFun(loginData){
            return httpHelper.httpFormPost(baseUrl+loginUrl,loginData);
        }

        function logoutFun() {
            return httpHelper.httpGet(baseUrl+logoutUrl);
        }

    }

})();