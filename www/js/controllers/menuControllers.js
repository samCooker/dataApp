/**
 * Created by Cookie on 2016/2/20.
 */
appModule
    .controller('menuController',MenuController)
    .controller('oaController',OaController)
    ;

function MenuController($scope,$state,loginFac) {
    $scope.reLogin= function () {
        $state.go('login');
    };

    $scope.logout= function () {
        loginFac.logout();
    }
}

function OaController() {

}