/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        BaseCtrl.$inject = ["$scope", "$rootScope", "$location", "$filter", "$uibModal", "$data", "routingService", "formGenerator", "recordHandler"];
        function BaseCtrl($scope, $rootScope, $location, $filter, $uibModal, $data, routingService, formGenerator, recordHandler) {
            var sharedStuff = $data;
            var ctrlState = {
                master: {},
                fngInvalidRequired: 'fng-invalid-required',
                allowLocationChange: true // Set when the data arrives..
            };
            angular.extend($scope, routingService.parsePathFunc()($location.$$path));
            $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);
            $rootScope.$broadcast('fngFormLoadStart', $scope);
            formGenerator.decorateScope($scope, formGenerator, recordHandler, sharedStuff);
            recordHandler.decorateScope($scope, $uibModal, recordHandler, ctrlState);
            recordHandler.fillFormWithBackendSchema($scope, formGenerator, recordHandler, ctrlState);
            // Tell the 'model controllers' that they can start fiddling with basescope
            for (var i = 0; i < sharedStuff.modelControllers.length; i++) {
                if (sharedStuff.modelControllers[i].onBaseCtrlReady) {
                    sharedStuff.modelControllers[i].onBaseCtrlReady($scope);
                }
            }
        }
        controllers.BaseCtrl = BaseCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        SaveChangesModalCtrl.$inject = ["$scope", "$uibModalInstance"];
        function SaveChangesModalCtrl($scope, $uibModalInstance) {
            $scope.yes = function () {
                $uibModalInstance.close(true);
            };
            $scope.no = function () {
                $uibModalInstance.close(false);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
        controllers.SaveChangesModalCtrl = SaveChangesModalCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        ModelCtrl.$inject = ["$scope", "$http", "$location", "routingService"];
        function ModelCtrl($scope, $http, $location, routingService) {
            $scope.models = [];
            $http.get('/api/models').success(function (data) {
                $scope.models = data;
            }).error(function () {
                $location.path('/404');
            });
            $scope.newUrl = function (model) {
                return routingService.buildUrl(model + '/new');
            };
            $scope.listUrl = function (model) {
                return routingService.buildUrl(model);
            };
        }
        controllers.ModelCtrl = ModelCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        NavCtrl.$inject = ["$scope", "$data", "$location", "$filter", "$controller", "routingService", "cssFrameworkService"];
        function NavCtrl($scope, $data, $location, $filter, $controller, routingService, cssFrameworkService) {
            $scope.items = [];
            /* isCollapsed and showShortcuts are used to control how the menu is displayed in a responsive environment and whether the shortcut keystrokes help should be displayed */
            $scope.isCollapsed = true;
            $scope.showShortcuts = false;
            $scope.shortcuts = [
                { key: '?', act: 'Show shortcuts' },
                { key: '/', act: 'Jump to search' },
                { key: 'Ctrl+Shift+S', act: 'Save the current record' },
                { key: 'Ctrl+Shift+Esc', act: 'Cancel changes on the current record' },
                { key: 'Ctrl+Shift+Ins', act: 'Create a new record' },
                { key: 'Ctrl+Shift+X', act: 'Delete the current record' }
            ];
            $scope.markupShortcut = function (keys) {
                return '<span class="key">' + keys.split('+').join('</span> + <span class="key">') + '</span>';
            };
            $scope.globalShortcuts = function (event) {
                function deferredBtnClick(id) {
                    var btn = document.getElementById(id);
                    if (btn) {
                        if (!btn.disabled) {
                            setTimeout(function () {
                                btn.click();
                            });
                        }
                        event.preventDefault();
                    }
                }
                function filter(event) {
                    var tagName = (event.target || event.srcElement).tagName;
                    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
                }
                //console.log(event.keyCode, event.ctrlKey, event.shiftKey, event.altKey, event.metaKey);
                if (event.keyCode === 191 && (filter(event) || (!event.altKey && !event.metaKey))) {
                    if (event.ctrlKey || !event.shiftKey) {
                        var searchInput = document.getElementById('searchinput');
                        if (searchInput) {
                            searchInput.focus();
                            event.preventDefault();
                        }
                    }
                    else {
                        $scope.showShortcuts = true;
                    }
                }
                else if (event.keyCode === 83 && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
                    deferredBtnClick('saveButton'); // Ctrl+Shift+S saves changes
                }
                else if (event.keyCode === 27 && ((event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) || $scope.showShortcuts)) {
                    if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
                        deferredBtnClick('cancelButton'); // Ctrl+Shift+Esc cancels updates
                    }
                    else {
                        $scope.showShortcuts = false;
                    }
                }
                else if (event.keyCode === 45 && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
                    deferredBtnClick('newButton'); // Ctrl+Shift+Ins creates New record
                }
                else if (event.keyCode === 88 && event.ctrlKey && event.shiftKey && event.altKey && !event.metaKey) {
                    deferredBtnClick('deleteButton'); // Ctrl+Shift+X deletes record
                }
            };
            $scope.css = function (fn, arg) {
                var result;
                if (typeof cssFrameworkService[fn] === 'function') {
                    result = cssFrameworkService[fn](arg);
                }
                else {
                    result = 'error text-error';
                }
                return result;
            };
            function loadControllerAndMenu(controllerName, level, needDivider) {
                var locals = {}, addThis;
                controllerName += 'Ctrl';
                locals.$scope = $data.modelControllers[level] = $scope.$new();
                try {
                    $controller(controllerName, locals);
                    if ($scope.routing.newRecord) {
                        addThis = 'creating';
                    }
                    else if ($scope.routing.id) {
                        addThis = 'editing';
                    }
                    else {
                        addThis = 'listing';
                    }
                    if (angular.isObject(locals.$scope.contextMenu)) {
                        angular.forEach(locals.$scope.contextMenu, function (value) {
                            if (value.divider) {
                                needDivider = true;
                            }
                            else if (value[addThis]) {
                                if (needDivider) {
                                    needDivider = false;
                                    $scope.items.push({ divider: true });
                                }
                                $scope.items.push(value);
                            }
                        });
                    }
                }
                catch (error) {
                    // Check to see if error is no such controller - don't care
                    if (!(/is not a function, got undefined/.test(error.message))) {
                        console.log('Unable to instantiate ' + controllerName + ' - ' + error.message);
                    }
                }
            }
            $scope.$on('$locationChangeSuccess', function () {
                $scope.routing = routingService.parsePathFunc()($location.$$path);
                $scope.items = [];
                if ($scope.routing.analyse) {
                    $scope.contextMenu = 'Report';
                    $scope.items = [
                        {
                            broadcast: 'exportToPDF',
                            text: 'PDF'
                        },
                        {
                            broadcast: 'exportToCSV',
                            text: 'CSV'
                        }
                    ];
                }
                else if ($scope.routing.modelName) {
                    angular.forEach($data.modelControllers, function (value) {
                        value.$destroy();
                    });
                    $data.modelControllers = [];
                    $data.record = {};
                    $data.disableFunctions = {};
                    $data.dataEventFunctions = {};
                    delete $data.dropDownDisplay;
                    delete $data.modelNameDisplay;
                    // Now load context menu.  For /person/client/:id/edit we need
                    // to load PersonCtrl and PersonClientCtrl
                    var modelName = $filter('titleCase')($scope.routing.modelName, true);
                    var needDivider = false;
                    loadControllerAndMenu(modelName, 0, needDivider);
                    if ($scope.routing.formName) {
                        loadControllerAndMenu(modelName + $filter('titleCase')($scope.routing.formName, true), 1, needDivider);
                    }
                    $scope.contextMenu = $data.dropDownDisplay || $data.modelNameDisplay || $filter('titleCase')($scope.routing.modelName, false);
                }
            });
            $scope.doClick = function (index, event) {
                var option = angular.element(event.target);
                var item = $scope.items[index];
                if (item.divider || option.parent().hasClass('disabled')) {
                    event.preventDefault();
                }
                else if (item.broadcast) {
                    $scope.$broadcast(item.broadcast);
                }
                else {
                    // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
                    var args = item.args || [], fn = item.fn;
                    switch (args.length) {
                        case 0:
                            fn();
                            break;
                        case 1:
                            fn(args[0]);
                            break;
                        case 2:
                            fn(args[0], args[1]);
                            break;
                        case 3:
                            fn(args[0], args[1], args[2]);
                            break;
                        case 4:
                            fn(args[0], args[1], args[2], args[3]);
                            break;
                    }
                }
            };
            $scope.isHidden = function (index) {
                return $scope.items[index].isHidden ? $scope.items[index].isHidden() : false;
            };
            $scope.isDisabled = function (index) {
                return $scope.items[index].isDisabled ? $scope.items[index].isDisabled() : false;
            };
            $scope.buildUrl = function (path) {
                return routingService.buildUrl(path);
            };
            $scope.dropdownClass = function (index) {
                var item = $scope.items[index];
                var thisClass = '';
                if (item.divider) {
                    thisClass = 'divider';
                }
                else if ($scope.isDisabled(index)) {
                    thisClass = 'disabled';
                }
                return thisClass;
            };
        }
        controllers.NavCtrl = NavCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        SearchCtrl.$inject = ["$scope", "$http", "$location", "routingService"];
        function SearchCtrl($scope, $http, $location, routingService) {
            var currentRequest = '';
            var _isNotMobile;
            _isNotMobile = (function () {
                var check = false;
                (function (a) {
                    /* tslint:disable:max-line-length */
                    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                        /* tslint:enable:max-line-length */
                        check = true;
                    }
                })(navigator.userAgent || navigator.vendor || window['opera']);
                return !check;
            })();
            $scope.searchPlaceholder = _isNotMobile ? 'Ctrl + / to Search' : 'Search';
            $scope.handleKey = function (event) {
                if (event.keyCode === 27 && $scope.searchTarget && $scope.searchTarget.length > 0) {
                    $scope.searchTarget = '';
                }
                else if ($scope.results.length > 0) {
                    switch (event.keyCode) {
                        case 38:
                            // up arrow pressed
                            if ($scope.focus > 0) {
                                $scope.setFocus($scope.focus - 1);
                            }
                            if (typeof event.preventDefault === 'function') {
                                event.preventDefault();
                            }
                            break;
                        case 40:
                            // down arrow pressed
                            if ($scope.results.length > $scope.focus + 1) {
                                $scope.setFocus($scope.focus + 1);
                            }
                            if (typeof event.preventDefault === 'function') {
                                event.preventDefault();
                            }
                            break;
                        case 13:
                            if ($scope.focus != null) {
                                $scope.selectResult($scope.focus);
                            }
                            break;
                    }
                }
            };
            $scope.setFocus = function (index) {
                if ($scope.focus !== null) {
                    delete $scope.results[$scope.focus].focussed;
                }
                $scope.results[index].focussed = true;
                $scope.focus = index;
            };
            $scope.selectResult = function (resultNo) {
                var result = $scope.results[resultNo];
                var newURL = routingService.prefix() + '/' + result.resource + '/' + result.id + '/edit';
                if (result.resourceTab) {
                    newURL += '/' + result.resourceTab;
                }
                $location.url(newURL);
            };
            $scope.resultClass = function (index) {
                var resultClass = 'search-result';
                if ($scope.results && $scope.results[index].focussed) {
                    resultClass += ' focus';
                }
                return resultClass;
            };
            var clearSearchResults = function () {
                $scope.moreCount = 0;
                $scope.errorClass = '';
                $scope.results = [];
                $scope.focus = null;
            };
            $scope.$watch('searchTarget', function (newValue) {
                if (newValue && newValue.length > 0) {
                    currentRequest = newValue;
                    $http.get('/api/search?q=' + newValue).success(function (data) {
                        // Check that we haven't fired off a subsequent request, in which
                        // case we are no longer interested in these results
                        if (currentRequest === newValue) {
                            if ($scope.searchTarget.length > 0) {
                                $scope.results = data.results;
                                $scope.moreCount = data.moreCount;
                                if (data.results.length > 0) {
                                    $scope.errorClass = '';
                                    $scope.setFocus(0);
                                }
                                $scope.errorClass = $scope.results.length === 0 ? 'error has-error' : '';
                            }
                            else {
                                clearSearchResults();
                            }
                        }
                    }).error(function (data, status) {
                        console.log('Error in searchbox.js : ' + data + ' (status=' + status + ')');
                    });
                }
                else {
                    clearSearchResults();
                }
            }, true);
            $scope.$on('$routeChangeStart', function () {
                $scope.searchTarget = '';
            });
        }
        controllers.SearchCtrl = SearchCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function modelControllerDropdown() {
            return {
                restrict: 'AE',
                replace: true,
                template: '<li ng-show="items.length > 0" class="mcdd" uib-dropdown>' +
                    ' <a uib-dropdown-toggle>' +
                    '  {{contextMenu}} <b class="caret"></b>' +
                    ' </a>' +
                    ' <ul class="uib-dropdown-menu dropdown-menu">' +
                    '  <li ng-repeat="choice in items" ng-hide="isHidden($index)" ng-class="dropdownClass($index)">' +
                    '   <a ng-show="choice.text" class="dropdown-option" ng-href="{{choice.url}}" ng-click="doClick($index, $event)">' +
                    '    {{choice.text}}' +
                    '   </a>' +
                    '  </li>' +
                    ' </ul>' +
                    '</li>'
            };
        }
        directives.modelControllerDropdown = modelControllerDropdown;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function errorDisplay() {
            return {
                restrict: 'E',
                template: '<div id="display-error" ng-show="errorMessage" ng-class="css(\'rowFluid\')">' +
                    '  <div class="alert alert-error col-lg-offset-3 offset3 col-lg-6 col-xs-12 span6 alert-warning alert-dismissable">' +
                    '    <button type="button" class="close" ng-click="dismissError()">×</button>' +
                    '    <h4>{{alertTitle}}</h4>' +
                    '    <div ng-bind-html="errorMessage"></div>' +
                    '  </div>' +
                    '</div>'
            };
        }
        directives.errorDisplay = errorDisplay;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        fngLink.$inject = ["routingService", "SubmissionsService"];
        function fngLink(routingService, SubmissionsService) {
            return {
                restrict: 'E',
                scope: { dataSrc: '&model' },
                link: function (scope, element, attrs) {
                    var ref = attrs['ref'];
                    var form = attrs['form'];
                    scope['readonly'] = attrs['readonly'];
                    form = form ? form + '/' : '';
                    if (attrs['text'] && attrs['text'].length > 0) {
                        scope['text'] = attrs['text'];
                    }
                    var index = scope['$parent']['$index'];
                    scope.$watch('dataSrc()', function (newVal) {
                        if (newVal) {
                            if (typeof index !== 'undefined' && angular.isArray(newVal)) {
                                newVal = newVal[index];
                            }
                            scope['link'] = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
                            if (!scope['text']) {
                                SubmissionsService.getListAttributes(ref, newVal).success(function (data) {
                                    if (data.success === false) {
                                        scope['text'] = data.err;
                                    }
                                    else {
                                        scope['text'] = data.list;
                                    }
                                }).error(function (status, err) {
                                    scope['text'] = 'Error ' + status + ': ' + err;
                                });
                            }
                        }
                    }, true);
                },
                template: function (element, attrs) {
                    return attrs.readonly ? '<span class="fng-link">{{text}}</span>' : '<a href="{{ link }}" class="fng-link">{{text}}</a>';
                }
            };
        }
        directives.fngLink = fngLink;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/underscore/underscore.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        formInput.$inject = ["$compile", "$rootScope", "$filter", "$data", "$timeout", "cssFrameworkService", "formGenerator", "formMarkupHelper"];
        var tabsSetupState;
        (function (tabsSetupState) {
            tabsSetupState[tabsSetupState["Y"] = 0] = "Y";
            tabsSetupState[tabsSetupState["N"] = 1] = "N";
            tabsSetupState[tabsSetupState["Forced"] = 2] = "Forced";
        })(tabsSetupState || (tabsSetupState = {}));
        /*@ngInject*/
        function formInput($compile, $rootScope, $filter, $data, $timeout, cssFrameworkService, formGenerator, formMarkupHelper) {
            return {
                restrict: 'EA',
                link: function (scope, element, attrs) {
                    //                generate markup for bootstrap forms
                    //
                    //                Bootstrap 3
                    //                Horizontal (default)
                    //                <div class="form-group">
                    //                    <label for="inputEmail3" class="col-sm-2 control-label">Email</label>
                    //                    <div class="col-sm-10">
                    //                        <input type="email" class="form-control" id="inputEmail3" placeholder="Email">
                    //                    </div>
                    //                 </div>
                    //
                    //                Vertical
                    //                <div class="form-group">
                    //                    <label for="exampleInputEmail1">Email address</label>
                    //                    <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email">
                    //                </div>
                    //
                    //                Inline
                    //                <div class="form-group">
                    //                    <label class="sr-only" for="exampleInputEmail2">Email address</label>
                    //                    <input type="email" class="form-control" id="exampleInputEmail2" placeholder="Enter email">
                    //                </div>
                    //                Bootstrap 2
                    //                Horizontal (default)
                    //                <div class="control-group">
                    //                    <label class="control-label" for="inputEmail">Email</label>
                    //                    <div class="controls">
                    //                        <input type="text" id="inputEmail" placeholder="Email">
                    //                    </div>
                    //                </div>
                    //
                    //                Vertical
                    //                <label>Label name</label>
                    //                <input type="text" placeholder="Type something…">
                    //                <span class="help-block">Example block-level help text here.</span>
                    //
                    //                Inline
                    //                <input type="text" class="input-small" placeholder="Email">
                    var subkeys = [];
                    var tabsSetup = tabsSetupState.N;
                    var generateInput = function (fieldInfo, modelString, isRequired, idString, options) {
                        function generateEnumInstructions() {
                            var enumInstruction;
                            if (angular.isArray(scope[fieldInfo.options])) {
                                enumInstruction = { repeat: fieldInfo.options, value: 'option' };
                            }
                            else if (scope[fieldInfo.options] && angular.isArray(scope[fieldInfo.options].values)) {
                                if (angular.isArray(scope[fieldInfo.options].labels)) {
                                    enumInstruction = {
                                        repeat: fieldInfo.options + '.values',
                                        value: fieldInfo.options + '.values[$index]',
                                        label: fieldInfo.options + '.labels[$index]'
                                    };
                                }
                                else {
                                    enumInstruction = {
                                        repeat: fieldInfo.options + '.values',
                                        value: fieldInfo.options + '.values[$index]'
                                    };
                                }
                            }
                            else {
                                throw new Error('Invalid enumeration setup in field ' + fieldInfo.name);
                            }
                            return enumInstruction;
                        }
                        var nameString;
                        if (!modelString) {
                            var modelBase = (options.model || 'record') + '.';
                            modelString = modelBase;
                            if (options.subschema && fieldInfo.name.indexOf('.') !== -1) {
                                // Schema handling - need to massage the ngModel and the id
                                var compoundName = fieldInfo.name;
                                var root = options.subschemaroot;
                                var lastPart = compoundName.slice(root.length + 1);
                                if (options.index) {
                                    modelString += root + '[' + options.index + '].' + lastPart;
                                    idString = 'f_' + modelString.slice(modelBase.length).replace(/(\.|\[|\]\.)/g, '-');
                                }
                                else {
                                    modelString += root;
                                    if (options.subkey) {
                                        idString = modelString.slice(modelBase.length).replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + lastPart;
                                        modelString += '[' + '$_arrayOffset_' + root.replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                                    }
                                    else {
                                        modelString += '[$index].' + lastPart;
                                        idString = null;
                                        nameString = compoundName.replace(/\./g, '-');
                                    }
                                }
                            }
                            else {
                                modelString += fieldInfo.name;
                            }
                        }
                        var allInputsVars = formMarkupHelper.allInputsVars(scope, fieldInfo, options, modelString, idString, nameString);
                        var common = allInputsVars.common;
                        var value;
                        var requiredStr = (isRequired || fieldInfo.required) ? ' required' : '';
                        var enumInstruction;
                        switch (fieldInfo.type) {
                            case 'select':
                                if (fieldInfo.select2) {
                                    common += 'class="fng-select2' + allInputsVars.formControl + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + '"';
                                    common += (fieldInfo.readonly ? ' readonly' : '');
                                    common += (fieldInfo.required ? ' ng-required="true"' : '');
                                    common += fieldInfo.add ? (' ' + fieldInfo.add + ' ') : '';
                                    if (fieldInfo.select2.fngAjax) {
                                        if (cssFrameworkService.framework() === 'bs2') {
                                            value = '<div class="input-append">';
                                            value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                                            value += '<button class="btn" type="button" data-select2-open="' + idString + '" ng-click="openSelect2($event)"><i class="icon-search"></i></button>';
                                            value += '</div>';
                                        }
                                        else {
                                            value = '<div class="input-group">';
                                            value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                                            value += '<span class="input-group-addon' + allInputsVars.compactClass + '" data-select2-open="' + idString + '" ';
                                            value += '    ng-click="openSelect2($event)"><i class="glyphicon glyphicon-search"></i></span>';
                                            value += '</div>';
                                        }
                                    }
                                    else if (fieldInfo.select2) {
                                        value = '<input ui-select2="' + fieldInfo.select2.s2query + '" ' + common + '>';
                                    }
                                }
                                else {
                                    common += (fieldInfo.readonly ? 'disabled ' : '');
                                    common += fieldInfo.add ? (' ' + fieldInfo.add + ' ') : '';
                                    value = '<select ' + common + 'class="' + allInputsVars.formControl.trim() + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + '" ' + requiredStr + '>';
                                    if (!isRequired) {
                                        value += '<option></option>';
                                    }
                                    if (angular.isArray(fieldInfo.options)) {
                                        angular.forEach(fieldInfo.options, function (optValue) {
                                            if (_.isObject(optValue)) {
                                                value += '<option value="' + (optValue.val || optValue.id) + '">' + (optValue.label || optValue.text) + '</option>';
                                            }
                                            else {
                                                value += '<option>' + optValue + '</option>';
                                            }
                                        });
                                    }
                                    else {
                                        enumInstruction = generateEnumInstructions();
                                        value += '<option ng-repeat="option in ' + enumInstruction.repeat + '"';
                                        if (enumInstruction.label) {
                                            value += ' value="{{' + enumInstruction.value + '}}"> {{ ' + enumInstruction.label + ' }} </option> ';
                                        }
                                        else {
                                            value += '>{{' + enumInstruction.value + '}}</option> ';
                                        }
                                    }
                                    value += '</select>';
                                }
                                break;
                            case 'link':
                                value = '<fng-link model="' + modelString + '" ref="' + fieldInfo.ref + '"';
                                if (fieldInfo.form) {
                                    value += ' form="' + fieldInfo.form + '"';
                                }
                                if (fieldInfo.linkText) {
                                    value += ' text="' + fieldInfo.linkText + '"';
                                }
                                if (fieldInfo.readonly) {
                                    value += ' readonly="true"';
                                }
                                value += '></fng-link>';
                                break;
                            case 'radio':
                                value = '';
                                common += requiredStr + (fieldInfo.readonly ? ' disabled ' : ' ');
                                var separateLines = options.formstyle === 'vertical' || (options.formstyle !== 'inline' && !fieldInfo.inlineRadio);
                                if (angular.isArray(fieldInfo.options)) {
                                    if (options.subschema) {
                                        common = common.replace('name="', 'name="{{$index}}-');
                                    }
                                    angular.forEach(fieldInfo.options, function (optValue) {
                                        value += '<input ' + common + 'type="radio"';
                                        value += ' value="' + optValue + '">' + optValue;
                                        if (separateLines) {
                                            value += '<br />';
                                        }
                                    });
                                }
                                else {
                                    var tagType = separateLines ? 'div' : 'span';
                                    if (options.subschema) {
                                        common = common.replace('$index', '$parent.$index').replace('name="', 'name="{{$parent.$index}}-');
                                    }
                                    enumInstruction = generateEnumInstructions();
                                    value += '<' + tagType + ' ng-repeat="option in ' + enumInstruction.repeat + '"><input ' + common + ' type="radio" value="{{' + enumInstruction.value + '}}"> {{';
                                    value += enumInstruction.label || enumInstruction.value;
                                    value += ' }} </' + tagType + '> ';
                                }
                                break;
                            case 'checkbox':
                                common += requiredStr + (fieldInfo.readonly ? ' disabled ' : ' ');
                                if (cssFrameworkService.framework() === 'bs3') {
                                    value = '<div class="checkbox"><input ' + common + 'type="checkbox"></div>';
                                }
                                else {
                                    value = formMarkupHelper.generateSimpleInput(common, fieldInfo, options);
                                }
                                break;
                            default:
                                common += formMarkupHelper.addTextInputMarkup(allInputsVars, fieldInfo, requiredStr);
                                if (fieldInfo.type === 'textarea') {
                                    if (fieldInfo.rows) {
                                        if (fieldInfo.rows === 'auto') {
                                            common += 'msd-elastic="\n" class="ng-animate" ';
                                        }
                                        else {
                                            common += 'rows = "' + fieldInfo.rows + '" ';
                                        }
                                    }
                                    if (fieldInfo.editor === 'ckEditor') {
                                        common += 'ckeditor = "" ';
                                        if (cssFrameworkService.framework() === 'bs3') {
                                            allInputsVars.sizeClassBS3 = 'col-xs-12';
                                        }
                                    }
                                    value = '<textarea ' + common + ' />';
                                }
                                else {
                                    value = formMarkupHelper.generateSimpleInput(common, fieldInfo, options);
                                }
                        }
                        return formMarkupHelper.inputChrome(value, fieldInfo, options, allInputsVars);
                    };
                    var convertFormStyleToClass = function (aFormStyle) {
                        var result;
                        switch (aFormStyle) {
                            case 'horizontal':
                                result = 'form-horizontal';
                                break;
                            case 'vertical':
                                result = '';
                                break;
                            case 'inline':
                                result = 'form-inline';
                                break;
                            case 'horizontalCompact':
                                result = 'form-horizontal compact';
                                break;
                            default:
                                result = 'form-horizontal compact';
                                break;
                        }
                        return result;
                    };
                    var containerInstructions = function (info) {
                        var result = { before: '', after: '' };
                        if (typeof info.containerType === 'function') {
                            result = info.containerType(info);
                        }
                        else {
                            switch (info.containerType) {
                                case 'tab':
                                    var tabNo = -1;
                                    for (var i = 0; i < scope.tabs.length; i++) {
                                        if (scope.tabs[i].title === info.title) {
                                            tabNo = i;
                                            break;
                                        }
                                    }
                                    if (tabNo >= 0) {
                                        result.before = '<uib-tab select="updateQueryForTab(\'' + info.title + '\')" heading="' + info.title + '"';
                                        if (tabNo > 0) {
                                            result.before += 'active="tabs[' + tabNo + '].active"';
                                        }
                                        result.before += '>';
                                        result.after = '</uib-tab>';
                                    }
                                    else {
                                        result.before = '<p>Error!  Tab ' + info.title + ' not found in tab list</p>';
                                        result.after = '';
                                    }
                                    break;
                                case 'tabset':
                                    result.before = '<uib-tabset>';
                                    result.after = '</uib-tabset>';
                                    break;
                                case 'well':
                                    result.before = '<div class="well">';
                                    if (info.title) {
                                        result.before += '<h4>' + info.title + '</h4>';
                                    }
                                    result.after = '</div>';
                                    break;
                                case 'well-large':
                                    result.before = '<div class="well well-lg well-large">';
                                    result.after = '</div>';
                                    break;
                                case 'well-small':
                                    result.before = '<div class="well well-sm well-small">';
                                    result.after = '</div>';
                                    break;
                                case 'fieldset':
                                    result.before = '<fieldset>';
                                    if (info.title) {
                                        result.before += '<legend>' + info.title + '</legend>';
                                    }
                                    result.after = '</fieldset>';
                                    break;
                                case undefined:
                                    break;
                                case null:
                                    break;
                                case '':
                                    break;
                                default:
                                    result.before = '<div class="' + info.containerType + '">';
                                    if (info.title) {
                                        var titleLook = info.titleTagOrClass || 'h4';
                                        if (titleLook.match(/h[1-6]/)) {
                                            result.before += '<' + titleLook + '>' + info.title + '</' + titleLook + '>';
                                        }
                                        else {
                                            result.before += '<p class="' + titleLook + '">' + info.title + '</p>';
                                        }
                                    }
                                    result.after = '</div>';
                                    break;
                            }
                        }
                        return result;
                    };
                    var handleField = function (info, options) {
                        var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options);
                        var template = fieldChrome.template;
                        if (info.schema) {
                            var niceName = info.name.replace(/\./g, '_');
                            var schemaDefName = '$_schema_' + niceName;
                            scope[schemaDefName] = info.schema;
                            if (info.schema) {
                                //schemas (which means they are arrays in Mongoose)
                                // Check for subkey - selecting out one or more of the array
                                if (info.subkey) {
                                    info.subkey.path = info.name;
                                    scope[schemaDefName + '_subkey'] = info.subkey;
                                    var subKeyArray = angular.isArray(info.subkey) ? info.subkey : [info.subkey];
                                    for (var arraySel = 0; arraySel < subKeyArray.length; arraySel++) {
                                        var topAndTail = containerInstructions(subKeyArray[arraySel]);
                                        template += topAndTail.before;
                                        template += processInstructions(info.schema, null, {
                                            subschema: 'true',
                                            formstyle: options.formstyle,
                                            subkey: schemaDefName + '_subkey',
                                            subkeyno: arraySel,
                                            subschemaroot: info.name
                                        });
                                        template += topAndTail.after;
                                    }
                                    subkeys.push(info);
                                }
                                else {
                                    if (options.subschema) {
                                        console.log('Attempts at supporting deep nesting have been removed - will hopefully be re-introduced at a later date');
                                    }
                                    else {
                                        template += '<div class="schema-head">' + info.label;
                                        if (info.unshift) {
                                            template += '<button id="unshift_' + info.id + '_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="unshift(\'' + info.name + '\',$event)">' +
                                                '<i class="' + formMarkupHelper.glyphClass() + '-plus"></i> Add</button>';
                                        }
                                        template += '</div>' +
                                            '<div ng-form class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid ' : '') +
                                            convertFormStyleToClass(info.formStyle) + '" name="form_' + niceName + '{{$index}}" class="sub-doc well" id="' + info.id + 'List_{{$index}}" ' +
                                            ' ng-repeat="subDoc in ' + (options.model || 'record') + '.' + info.name + ' track by $index">' +
                                            '   <div class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid' : 'row') + ' sub-doc">';
                                        if (!info.noRemove || info.customSubDoc) {
                                            template += '   <div class="sub-doc-btns">';
                                            if (info.customSubDoc) {
                                                template += info.customSubDoc;
                                            }
                                            if (!info.noRemove) {
                                                template += '<button name="remove_' + info.id + '_btn" class="remove-btn btn btn-mini btn-default btn-xs form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                                                    '<i class="' + formMarkupHelper.glyphClass() + '-minus"></i> Remove</button>';
                                            }
                                            template += '  </div> ';
                                        }
                                        template += processInstructions(info.schema, false, {
                                            subschema: 'true',
                                            formstyle: info.formStyle,
                                            model: options.model,
                                            subschemaroot: info.name
                                        });
                                        template += '   </div>' +
                                            '</div>';
                                        if (!info.noAdd || info.customFooter) {
                                            template += '<div class = "schema-foot">';
                                            if (info.customFooter) {
                                                template += info.customFooter;
                                            }
                                            if (!info.noAdd) {
                                                template += '<button id="add_' + info.id + '_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                                                    '<i class="' + formMarkupHelper.glyphClass() + '-plus"></i> Add</button>';
                                            }
                                            template += '</div>';
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            // Handle arrays here
                            var controlDivClasses = formMarkupHelper.controlDivClasses(options);
                            if (info.array) {
                                controlDivClasses.push('fng-array');
                                if (options.formstyle === 'inline') {
                                    throw new Error('Cannot use arrays in an inline form');
                                }
                                template += formMarkupHelper.label(scope, info, info.type !== 'link', options);
                                template += formMarkupHelper.handleArrayInputAndControlDiv(generateInput(info, info.type === 'link' ? null : 'arrayItem.x', true, info.id + '_{{$index}}', options), controlDivClasses, info, options);
                            }
                            else {
                                // Single fields here
                                template += formMarkupHelper.label(scope, info, null, options);
                                if (options.required) {
                                    console.log("*********  Options required - found it ********");
                                }
                                template += formMarkupHelper.handleInputAndControlDiv(generateInput(info, null, options.required, info.id, options), controlDivClasses);
                            }
                        }
                        template += fieldChrome.closeTag;
                        return template;
                    };
                    var inferMissingProperties = function (info) {
                        // infer missing values
                        info.type = info.type || 'text';
                        if (info.id) {
                            if (typeof info.id === 'number' || (info.id[0] >= 0 && info.id <= '9')) {
                                info.id = '_' + info.id;
                            }
                        }
                        else {
                            info.id = 'f_' + info.name.replace(/\./g, '_');
                        }
                        info.label = (info.label !== undefined) ? (info.label === null ? '' : info.label) : $filter('titleCase')(info.name.split('.').slice(-1)[0]);
                    };
                    //              var processInstructions = function (instructionsArray, topLevel, groupId) {
                    //  removing groupId as it was only used when called by containerType container, which is removed for now
                    var processInstructions = function (instructionsArray, topLevel, options) {
                        var result = '';
                        if (instructionsArray) {
                            for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
                                var info = instructionsArray[anInstruction];
                                if (anInstruction === 0 && topLevel && !options.schema.match(/$_schema_/) && typeof info.add !== 'object') {
                                    info.add = info.add ? ' ' + info.add + ' ' : '';
                                    if (info.add.indexOf('ui-date') === -1 && !options.noautofocus && !info.containerType) {
                                        info.add = info.add + 'autofocus ';
                                    }
                                }
                                var callHandleField = true;
                                if (info.directive) {
                                    var directiveName = info.directive;
                                    var newElement = '<' + directiveName + ' model="' + (options.model || 'record') + '"';
                                    var thisElement = element[0];
                                    inferMissingProperties(info);
                                    for (var i = 0; i < thisElement.attributes.length; i++) {
                                        var thisAttr = thisElement.attributes[i];
                                        switch (thisAttr.nodeName) {
                                            case 'class':
                                                var classes = thisAttr.value.replace('ng-scope', '');
                                                if (classes.length > 0) {
                                                    newElement += ' class="' + classes + '"';
                                                }
                                                break;
                                            case 'schema':
                                                var bespokeSchemaDefName = ('bespoke_' + info.name).replace(/\./g, '_');
                                                scope[bespokeSchemaDefName] = angular.copy(info);
                                                delete scope[bespokeSchemaDefName].directive;
                                                newElement += ' schema="' + bespokeSchemaDefName + '"';
                                                break;
                                            default:
                                                newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.value + '"';
                                        }
                                    }
                                    newElement += ' ';
                                    var directiveCamel = $filter('camelCase')(info.directive);
                                    for (var prop in info) {
                                        if (info.hasOwnProperty(prop)) {
                                            switch (prop) {
                                                case 'directive':
                                                    break;
                                                case 'schema':
                                                    break;
                                                case 'add':
                                                    switch (typeof info.add) {
                                                        case 'string':
                                                            newElement += ' ' + info.add;
                                                            break;
                                                        case 'object':
                                                            for (var subAdd in info.add) {
                                                                newElement += ' ' + subAdd + '="' + info.add[subAdd].toString().replace(/"/g, '&quot;') + '"';
                                                            }
                                                            break;
                                                        default:
                                                            throw new Error('Invalid add property of type ' + typeof (info.add) + ' in directive ' + info.name);
                                                    }
                                                    break;
                                                case directiveCamel:
                                                    for (var subProp in info[prop]) {
                                                        newElement += info.directive + '-' + subProp + '="' + info[prop][subProp] + '"';
                                                    }
                                                    break;
                                                default:
                                                    newElement += ' fng-fld-' + prop + '="' + info[prop].toString().replace(/"/g, '&quot;') + '"';
                                                    break;
                                            }
                                        }
                                    }
                                    for (prop in options) {
                                        if (options.hasOwnProperty(prop) && prop[0] !== '$' && typeof options[prop] !== 'undefined') {
                                            newElement += ' fng-opt-' + prop + '="' + options[prop].toString().replace(/"/g, '&quot;') + '"';
                                        }
                                    }
                                    newElement += 'ng-model="' + info.name + '"></' + directiveName + '>';
                                    result += newElement;
                                    callHandleField = false;
                                }
                                else if (info.containerType) {
                                    var parts = containerInstructions(info);
                                    switch (info.containerType) {
                                        case 'tab':
                                            // maintain support for simplified tabset syntax for now
                                            if (tabsSetup === tabsSetupState.N) {
                                                tabsSetup = tabsSetupState.Forced;
                                                result += '<uib-tabset>';
                                            }
                                            result += parts.before;
                                            result += processInstructions(info.content, null, options);
                                            result += parts.after;
                                            break;
                                        case 'tabset':
                                            tabsSetup = tabsSetupState.Y;
                                            result += parts.before;
                                            result += processInstructions(info.content, null, options);
                                            result += parts.after;
                                            break;
                                        default:
                                            // includes wells, fieldset
                                            result += parts.before;
                                            result += processInstructions(info.content, null, options);
                                            result += parts.after;
                                            break;
                                    }
                                    callHandleField = false;
                                }
                                else if (options.subkey) {
                                    // Don't display fields that form part of the subkey, as they should not be edited (because in these circumstances they form some kind of key)
                                    var objectToSearch = angular.isArray(scope[options.subkey]) ? scope[options.subkey][0].keyList : scope[options.subkey].keyList;
                                    if (_.find(objectToSearch, function (value, key) {
                                        return scope[options.subkey].path + '.' + key === info.name;
                                    })) {
                                        callHandleField = false;
                                    }
                                }
                                if (callHandleField) {
                                    //                            if (groupId) {
                                    //                                scope['showHide' + groupId] = true;
                                    //                            }
                                    inferMissingProperties(info);
                                    result += handleField(info, options);
                                }
                            }
                        }
                        else {
                            console.log('Empty array passed to processInstructions');
                            result = '';
                        }
                        return result;
                    };
                    var unwatch = scope.$watch(attrs.schema, function (newValue) {
                        if (newValue) {
                            newValue = angular.isArray(newValue) ? newValue : [newValue]; // otherwise some old tests stop working for no real reason
                            if (newValue.length > 0) {
                                unwatch();
                                var elementHtml = '';
                                var recordAttribute = attrs.model || 'record'; // By default data comes from scope.record
                                var theRecord = scope[recordAttribute];
                                theRecord = theRecord || {};
                                if ((attrs.subschema || attrs.model) && !attrs.forceform) {
                                    elementHtml = '';
                                }
                                else {
                                    scope.topLevelFormName = attrs.name || 'myForm'; // Form name defaults to myForm
                                    // Copy attrs we don't process into form
                                    var customAttrs = '';
                                    for (var thisAttr in attrs) {
                                        if (attrs.hasOwnProperty(thisAttr)) {
                                            if (thisAttr[0] !== '$' && ['name', 'formstyle', 'schema', 'subschema', 'model'].indexOf(thisAttr) === -1) {
                                                customAttrs += ' ' + attrs.$attr[thisAttr] + '="' + attrs[thisAttr] + '"';
                                            }
                                        }
                                    }
                                    elementHtml = '<form name="' + scope.topLevelFormName + '" class="' + convertFormStyleToClass(attrs.formstyle) + ' novalidate"' + customAttrs + '>';
                                }
                                if (theRecord === scope.topLevelFormName) {
                                    throw new Error('Model and Name must be distinct - they are both ' + theRecord);
                                }
                                elementHtml += processInstructions(newValue, true, attrs);
                                if (tabsSetup === tabsSetupState.Forced) {
                                    elementHtml += '</uib-tabset>';
                                }
                                elementHtml += attrs.subschema ? '' : '</form>';
                                //console.log(elementHtml);
                                element.replaceWith($compile(elementHtml)(scope));
                                // If there are subkeys we need to fix up ng-model references when record is read
                                // If we have modelControllers we need to let them know when we have form + data
                                if (subkeys.length > 0 || $data.modelControllers.length > 0) {
                                    var unwatch2 = scope.$watch('phase', function (newValue) {
                                        if (newValue === 'ready') {
                                            unwatch2();
                                            // Tell the 'model controllers' that the form and data are there
                                            for (var i = 0; i < $data.modelControllers.length; i++) {
                                                if ($data.modelControllers[i].onAllReady) {
                                                    $data.modelControllers[i].onAllReady(scope);
                                                }
                                            }
                                            // For each one of the subkeys sets in the form we need to fix up ng-model references
                                            for (var subkeyCtr = 0; subkeyCtr < subkeys.length; subkeyCtr++) {
                                                var info = subkeys[subkeyCtr];
                                                var arrayOffset;
                                                var matching;
                                                var arrayToProcess = angular.isArray(info.subkey) ? info.subkey : [info.subkey];
                                                var parts = info.name.split('.');
                                                var dataVal = theRecord;
                                                while (parts.length > 1) {
                                                    dataVal = dataVal[parts.shift()] || {};
                                                }
                                                dataVal = dataVal[parts[0]] = dataVal[parts[0]] || [];
                                                // For each of the required subkeys of this type
                                                for (var thisOffset = 0; thisOffset < arrayToProcess.length; thisOffset++) {
                                                    if (arrayToProcess[thisOffset].selectFunc) {
                                                        // Get the array offset from a function
                                                        if (!scope[arrayToProcess[thisOffset].selectFunc] || typeof scope[arrayToProcess[thisOffset].selectFunc] !== 'function') {
                                                            throw new Error('Subkey function ' + arrayToProcess[thisOffset].selectFunc + ' is not properly set up');
                                                        }
                                                        arrayOffset = scope[arrayToProcess[thisOffset].selectFunc](theRecord, info);
                                                    }
                                                    else if (arrayToProcess[thisOffset].keyList) {
                                                        // We are chosing the array element by matching one or more keys
                                                        var thisSubkeyList = arrayToProcess[thisOffset].keyList;
                                                        for (arrayOffset = 0; arrayOffset < dataVal.length; arrayOffset++) {
                                                            matching = true;
                                                            for (var keyField in thisSubkeyList) {
                                                                if (thisSubkeyList.hasOwnProperty(keyField)) {
                                                                    // Not (currently) concerned with objects here - just simple types and lookups
                                                                    if (dataVal[arrayOffset][keyField] !== thisSubkeyList[keyField] &&
                                                                        (typeof dataVal[arrayOffset][keyField] === 'undefined' || !dataVal[arrayOffset][keyField].text || dataVal[arrayOffset][keyField].text !== thisSubkeyList[keyField])) {
                                                                        matching = false;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                            if (matching) {
                                                                break;
                                                            }
                                                        }
                                                        if (!matching) {
                                                            // There is no matching array element
                                                            switch (arrayToProcess[thisOffset].onNotFound) {
                                                                case 'error':
                                                                    var errorMessage = 'Cannot find matching ' + (arrayToProcess[thisOffset].title || arrayToProcess[thisOffset].path);
                                                                    //Have to do this async as setPristine clears it
                                                                    $timeout(function () {
                                                                        scope.showError(errorMessage, 'Unable to set up form correctly');
                                                                    });
                                                                    arrayOffset = -1;
                                                                    //throw new Error(scope.errorMessage);
                                                                    break;
                                                                case 'create':
                                                                default:
                                                                    arrayOffset = theRecord[info.name].push(thisSubkeyList) - 1;
                                                                    break;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        throw new Error('Invalid subkey setup for ' + info.name);
                                                    }
                                                    scope['$_arrayOffset_' + info.name.replace(/\./g, '_') + '_' + thisOffset] = arrayOffset;
                                                }
                                            }
                                        }
                                    });
                                }
                                $rootScope.$broadcast('formInputDone');
                                if (formGenerator.updateDataDependentDisplay && theRecord && Object.keys(theRecord).length > 0) {
                                    // If this is not a test force the data dependent updates to the DOM
                                    formGenerator.updateDataDependentDisplay(theRecord, null, true, scope);
                                }
                            }
                        }
                    }, true);
                }
            };
        }
        directives.formInput = formInput;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        formButtons.$inject = ["cssFrameworkService"];
        function formButtons(cssFrameworkService) {
            return {
                restrict: 'A',
                templateUrl: 'form-button-' + cssFrameworkService.framework() + '.html'
            };
        }
        directives.formButtons = formButtons;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../controllers/search-ctrl.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        globalSearch.$inject = ["cssFrameworkService"];
        function globalSearch(cssFrameworkService) {
            return {
                restrict: 'AE',
                templateUrl: 'search-' + cssFrameworkService.framework() + '.html',
                controller: fng.controllers.SearchCtrl
            };
        }
        directives.globalSearch = globalSearch;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var filters;
    (function (filters) {
        /*@ngInject*/
        function camelCase() {
            return function (name) {
                var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
                return name.
                    replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                    return offset ? letter.toUpperCase() : letter;
                });
            };
        }
        filters.camelCase = camelCase;
    })(filters = fng.filters || (fng.filters = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var filters;
    (function (filters) {
        /*@ngInject*/
        function titleCase() {
            return function (str, stripSpaces) {
                if (str) {
                    str = str
                        .replace(/(_|\.)/g, ' ') // replace underscores and dots with spaces
                        .replace(/[A-Z]/g, ' $&').trim() // precede replace caps with a space
                        .replace(/\w\S*/g, function (txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                    if (stripSpaces) {
                        str = str.replace(/\s/g, '');
                    }
                    else {
                        // lose double spaces
                        str = str.replace(/\s{2,}/g, ' ');
                    }
                }
                return str;
            };
        }
        filters.titleCase = titleCase;
    })(filters = fng.filters || (fng.filters = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function addAllService() {
            this.getAddAllGroupOptions = function (scope, attrs, classes) {
                return getAddAllOptions(scope, attrs, 'Group', classes);
            };
            this.getAddAllFieldOptions = function (scope, attrs, classes) {
                return getAddAllOptions(scope, attrs, 'Field', classes);
            };
            this.getAddAllLabelOptions = function (scope, attrs, classes) {
                return getAddAllOptions(scope, attrs, 'Label', classes);
            };
            this.addAll = function (scope, type, additionalClasses, options) {
                var action = 'getAddAll' + type + 'Options';
                return this[action](scope, options, additionalClasses) || [];
            };
            function getAddAllOptions(scope, attrs, type, classes) {
                var addAllOptions = [], classList = [], tmp, i, options;
                type = 'addAll' + type;
                if (typeof (classes) === 'string') {
                    tmp = classes.split(' ');
                    for (i = 0; i < tmp.length; i++) {
                        classList.push(tmp[i]);
                    }
                }
                function getAllOptions(obj) {
                    for (var key in obj) {
                        if (key === type) {
                            addAllOptions.push(obj[key]);
                        }
                        if (key === '$parent') {
                            getAllOptions(obj[key]);
                        }
                    }
                }
                getAllOptions(scope);
                if (attrs[type] !== undefined) {
                    // TODO add support for objects and raise error on invalid types
                    if (typeof (attrs[type]) === 'string') {
                        tmp = attrs[type].split(' ');
                        for (i = 0; i < tmp.length; i++) {
                            if (tmp[i].indexOf('class=') === 0) {
                                classList.push(tmp[i].substring(6, tmp[i].length));
                            }
                            else {
                                addAllOptions.push(tmp[i]);
                            }
                        }
                    }
                }
                if (classList.length > 0) {
                    classes = ' class="' + classList.join(' ') + '" ';
                }
                else {
                    classes = ' ';
                }
                if (addAllOptions.length > 0) {
                    options = addAllOptions.join(' ') + ' ';
                }
                else {
                    options = '';
                }
                return classes + options;
            }
        }
        services.addAllService = addAllService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function cssFrameworkService() {
            // Supported options for framework are:
            //      bs2 = Twitter Bootstrap 2.3.2 (default)
            //      bs3 = Bootstrap 3.3.5
            var config = {
                framework: 'bs2' // Unit tests depend on this being bs2
            };
            return {
                setOptions: function (options) {
                    angular.extend(config, options);
                },
                $get: function () {
                    return {
                        framework: function () {
                            return config.framework;
                        },
                        // This next function is just for the demo website - don't use it
                        setFrameworkForDemoWebsite: function (framework) {
                            config.framework = framework;
                        },
                        span: function (cols) {
                            var result;
                            switch (config.framework) {
                                case 'bs2':
                                    result = 'span' + cols;
                                    break;
                                case 'bs3':
                                    result = 'col-xs-' + cols;
                                    break;
                            }
                            return result;
                        },
                        offset: function (cols) {
                            var result;
                            switch (config.framework) {
                                case 'bs2':
                                    result = 'offset' + cols;
                                    break;
                                case 'bs3':
                                    result = 'col-lg-offset-' + cols;
                                    break;
                            }
                            return result;
                        },
                        rowFluid: function () {
                            var result;
                            switch (config.framework) {
                                case 'bs2':
                                    result = 'row-fluid';
                                    break;
                                case 'bs3':
                                    result = 'row';
                                    break;
                            }
                            return result;
                        }
                    };
                }
            };
        }
        services.cssFrameworkService = cssFrameworkService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function $data() {
            var sharedData = {
                // The record from BaseCtrl
                record: {},
                disableFunctions: {},
                dataEventFunctions: {},
                modelControllers: []
            };
            return sharedData;
        }
        services.$data = $data;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        routingService.$inject = ["$injector", "$locationProvider"];
        function routingService($injector, $locationProvider) {
            var config = {
                //  fixedRoutes: [] an array in the same format as builtInRoutes that is matched before the generic routes.  Can be omitted
                hashPrefix: '',
                html5Mode: false,
                routing: 'ngroute',
                prefix: '' // How do we want to prefix out routes?  If not empty string then first character must be slash (which is added if not)
            };
            var builtInRoutes = [
                {
                    route: '/analyse/:model/:reportSchemaName',
                    state: 'analyse::model::report',
                    templateUrl: 'partials/base-analysis.html'
                },
                { route: '/analyse/:model', state: 'analyse::model', templateUrl: 'partials/base-analysis.html' },
                { route: '/:model/:id/edit', state: 'model::edit', templateUrl: 'partials/base-edit.html' },
                { route: '/:model/:id/edit/:tab', state: 'model::edit::tab', templateUrl: 'partials/base-edit.html' },
                { route: '/:model/new', state: 'model::new', templateUrl: 'partials/base-edit.html' },
                { route: '/:model', state: 'model::list', templateUrl: 'partials/base-list.html' },
                { route: '/:model/:form/:id/edit', state: 'model::form::edit', templateUrl: 'partials/base-edit.html' },
                { route: '/:model/:form/:id/edit/:tab', state: 'model::form::edit::tab', templateUrl: 'partials/base-edit.html' },
                { route: '/:model/:form/new', state: 'model::form::new', templateUrl: 'partials/base-edit.html' },
                { route: '/:model/:form', state: 'model::form::list', templateUrl: 'partials/base-list.html' } // list page with links to non default form
            ];
            var _routeProvider, _stateProvider;
            var lastRoute = null;
            var lastObject = {};
            function _setUpNgRoutes(routes, prefix, additional) {
                if (prefix === void 0) { prefix = ''; }
                prefix = prefix || '';
                angular.forEach(routes, function (routeSpec) {
                    _routeProvider.when(prefix + routeSpec.route, angular.extend(routeSpec.options || { templateUrl: routeSpec.templateUrl }, additional));
                });
                // This next bit is just for the demo website to allow demonstrating multiple frameworks - not available with other routers
                if (config.variantsForDemoWebsite) {
                    angular.forEach(config.variantsForDemoWebsite, function (variant) {
                        angular.forEach(routes, function (routeSpec) {
                            _routeProvider.when(prefix + variant + routeSpec.route, angular.extend(routeSpec.options || { templateUrl: routeSpec.templateUrl }, additional));
                        });
                    });
                }
            }
            function _setUpUIRoutes(routes, prefix, additional) {
                if (prefix === void 0) { prefix = ''; }
                prefix = prefix || '';
                angular.forEach(routes, function (routeSpec) {
                    _stateProvider.state(routeSpec.state, angular.extend(routeSpec.options || {
                        url: prefix + routeSpec.route,
                        templateUrl: routeSpec.templateUrl
                    }, additional));
                });
            }
            function _buildOperationUrl(prefix, operation, modelName, formName, id, tabName) {
                var formString = formName ? ('/' + formName) : '';
                var modelString = prefix + '/' + modelName;
                var tabString = tabName ? ('/' + tabName) : '';
                var urlStr;
                switch (operation) {
                    case 'list':
                        urlStr = modelString + formString;
                        break;
                    case 'edit':
                        urlStr = modelString + formString + '/' + id + '/edit' + tabString;
                        break;
                    case 'new':
                        urlStr = modelString + formString + '/new' + tabString;
                        break;
                }
                return urlStr;
            }
            return {
                start: function (options) {
                    angular.extend(config, options);
                    if (config.prefix[0] && config.prefix[0] !== '/') {
                        config.prefix = '/' + config.prefix;
                    }
                    $locationProvider.html5Mode(config.html5Mode);
                    if (config.hashPrefix !== '') {
                        $locationProvider.hashPrefix(config.hashPrefix);
                    }
                    switch (config.routing) {
                        case 'ngroute':
                            _routeProvider = $injector.get('$routeProvider');
                            if (config.fixedRoutes) {
                                _setUpNgRoutes(config.fixedRoutes);
                            }
                            _setUpNgRoutes(builtInRoutes, config.prefix, options.add2fngRoutes);
                            break;
                        case 'uirouter':
                            _stateProvider = $injector.get('$stateProvider');
                            if (config.fixedRoutes) {
                                _setUpUIRoutes(config.fixedRoutes);
                            }
                            setTimeout(function () {
                                _setUpUIRoutes(builtInRoutes, config.prefix, options.add2fngRoutes);
                            });
                            break;
                    }
                },
                $get: function () {
                    return {
                        router: function () {
                            return config.routing;
                        },
                        prefix: function () {
                            return config.prefix;
                        },
                        parsePathFunc: function () {
                            return function (location) {
                                if (location !== lastRoute) {
                                    lastRoute = location;
                                    lastObject = { newRecord: false };
                                    // Get rid of the prefix
                                    if (config.prefix.length > 0) {
                                        if (location.indexOf(config.prefix) === 0) {
                                            location = location.slice(config.prefix.length);
                                        }
                                    }
                                    var locationSplit = location.split('/');
                                    // get rid of variant if present - just used for demo website
                                    if (config.variants) {
                                        if (config.variants.indexOf(locationSplit[1]) !== -1) {
                                            lastObject.variant = locationSplit[1];
                                            locationSplit.shift();
                                        }
                                    }
                                    var locationParts = locationSplit.length;
                                    if (locationSplit[1] === 'analyse') {
                                        lastObject.analyse = true;
                                        lastObject.modelName = locationSplit[2];
                                        lastObject.reportSchemaName = locationParts >= 4 ? locationSplit[3] : null;
                                    }
                                    else {
                                        lastObject.modelName = locationSplit[1];
                                        var lastParts = [locationSplit[locationParts - 1], locationSplit[locationParts - 2]];
                                        var newPos = lastParts.indexOf('new');
                                        var editPos;
                                        if (newPos === -1) {
                                            editPos = lastParts.indexOf('edit');
                                            if (editPos !== -1) {
                                                locationParts -= (2 + editPos);
                                                lastObject.id = locationSplit[locationParts];
                                            }
                                        }
                                        else {
                                            lastObject.newRecord = true;
                                            locationParts -= (1 + newPos);
                                        }
                                        if (editPos === 1 || newPos === 1) {
                                            lastObject.tab = lastParts[0];
                                        }
                                        if (locationParts > 2) {
                                            lastObject.formName = locationSplit[2];
                                        }
                                    }
                                }
                                return lastObject;
                            };
                            ///**
                            // * DominicBoettger wrote:
                            // *
                            // * Parser for the states provided by ui.router
                            // */
                            //'use strict';
                            //formsAngular.factory('$stateParse', [function () {
                            //
                            //  var lastObject = {};
                            //
                            //  return function (state) {
                            //    if (state.current && state.current.name) {
                            //      lastObject = {newRecord: false};
                            //      lastObject.modelName = state.params.model;
                            //      if (state.current.name === 'model::list') {
                            //        lastObject = {index: true};
                            //        lastObject.modelName = state.params.model;
                            //      } else if (state.current.name === 'model::edit') {
                            //        lastObject.id = state.params.id;
                            //      } else if (state.current.name === 'model::new') {
                            //        lastObject.newRecord = true;
                            //      } else if (state.current.name === 'model::analyse') {
                            //        lastObject.analyse = true;
                            //      }
                            //    }
                            //    return lastObject;
                            //  };
                            //}]);
                        },
                        buildUrl: function (path) {
                            var url = config.html5Mode ? '' : '#';
                            url += config.hashPrefix;
                            url += config.prefix;
                            if (url[0]) {
                                url += '/';
                            }
                            url += (path[0] === '/' ? path.slice(1) : path);
                            return url;
                        },
                        buildOperationUrl: function (operation, modelName, formName, id, tab) {
                            return _buildOperationUrl(config.prefix, operation, modelName, formName, id, tab);
                        },
                        redirectTo: function () {
                            return function (operation, scope, location, id, tab) {
                                //            switch (config.routing) {
                                //              case 'ngroute' :
                                if (location.search()) {
                                    location.url(location.path());
                                }
                                var urlStr = _buildOperationUrl(config.prefix, operation, scope.modelName, scope.formName, id, tab);
                                location.path(urlStr);
                                //                break;
                                //              case 'uirouter' :
                                //                var formString = scope.formName ? ('/' + scope.formName) : '';
                                //                var modelString = config.prefix + '/' + scope.modelName;
                                //                console.log('form schemas not supported with ui-router');
                                //                switch (operation) {
                                //                  case 'list' :
                                //                    location.path(modelString + formString);
                                //                    break;
                                //                  case 'edit' :
                                //                    location.path(modelString + formString + '/' + id + '/edit');
                                //                    break;
                                //                  case 'new' :
                                //                    location.path(modelString + formString + '/new');
                                //                    break;
                                //                }
                                //                switch (operation) {
                                //                  case 'list' :
                                //                    $state.go('model::list', { model: model });
                                //                    break;
                                //                  case 'edit' :
                                //                    location.path('/' + scope.modelName + formString + '/' + id + '/edit');
                                //                    break;
                                //                  case 'new' :
                                //                    location.path('/' + scope.modelName + formString + '/new');
                                //                    break;
                                //                }
                                //                break;
                                //
                                //
                                //                //  edit: $state.go('model::edit', {id: data._id, model: $scope.modelName });
                                //                //  new:  $state.go('model::new', {model: $scope.modelName});
                                //                break;
                            };
                        }
                    };
                }
            };
        }
        services.routingService = routingService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/underscore/underscore.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        function formGenerator($location, $timeout, $filter, SubmissionsService, routingService, recordHandler) {
            function handleSchema(description, source, destForm, destList, prefix, doRecursion, $scope, ctrlState) {
                function handletabInfo(tabName, thisInst) {
                    var tabTitle = angular.copy(tabName);
                    var tab = _.find($scope.tabs, function (atab) {
                        return atab.title === tabTitle;
                    });
                    if (!tab) {
                        if ($scope.tabs.length === 0) {
                            if ($scope.formSchema.length > 0) {
                                $scope.tabs.push({ title: 'Main', content: [], active: ($scope.tab === 'Main' || !$scope.tab) });
                                tab = $scope.tabs[0];
                                for (var i = 0; i < $scope.formSchema.length; i++) {
                                    tab.content.push($scope.formSchema[i]);
                                }
                            }
                        }
                        tab = $scope.tabs[$scope.tabs.push({
                            title: tabTitle,
                            containerType: 'tab',
                            content: [],
                            active: (tabTitle === $scope.tab)
                        }) - 1];
                    }
                    tab.content.push(thisInst);
                }
                for (var field in source) {
                    if (field !== '_id' && source.hasOwnProperty(field)) {
                        var mongooseType = source[field], mongooseOptions = mongooseType.options || {};
                        var formData = mongooseOptions.form || {};
                        if (mongooseType.schema && !formData.hidden) {
                            if (doRecursion && destForm) {
                                var schemaSchema = [];
                                handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, null, field + '.', true, $scope, ctrlState);
                                var sectionInstructions = basicInstructions(field, formData, prefix);
                                sectionInstructions.schema = schemaSchema;
                                if (formData.tab) {
                                    handletabInfo(formData.tab, sectionInstructions);
                                }
                                if (formData.order !== undefined) {
                                    destForm.splice(formData.order, 0, sectionInstructions);
                                }
                                else {
                                    destForm.push(sectionInstructions);
                                }
                            }
                        }
                        else {
                            if (destForm && !formData.hidden) {
                                var formInstructions = basicInstructions(field, formData, prefix);
                                if (handleConditionals(formInstructions.showIf, formInstructions.name, $scope) && field !== 'options') {
                                    var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope, ctrlState);
                                    if (formInst.tab) {
                                        handletabInfo(formInst.tab, formInst);
                                    }
                                    if (formData.order !== undefined) {
                                        destForm.splice(formData.order, 0, formInst);
                                    }
                                    else {
                                        destForm.push(formInst);
                                    }
                                }
                            }
                            if (destList && mongooseOptions.list) {
                                handleListInfo(destList, mongooseOptions.list, field);
                            }
                        }
                    }
                }
                //        //if a hash is defined then make that the selected tab is displayed
                //        if ($scope.tabs.length > 0 && $location.hash()) {
                //            var tab = _.find($scope.tabs, function (atab) {
                //                return atab.title === $location.hash();
                //            });
                //
                //            if (tab) {
                //                for (var i = 0; i < $scope.tabs.length; i++) {
                //                    $scope.tabs[i].active = false;
                //                }
                //                tab.active = true;
                //            }
                //        }
                //
                //        //now add a hash for the active tab if none exists
                //        if ($scope.tabs.length > 0 && !$location.hash()) {
                //            console.log($scope.tabs[0]['title'])
                //            $location.hash($scope.tabs[0]['title']);
                //        }
                if (destList && destList.length === 0) {
                    handleEmptyList(description, destList, destForm, source);
                }
            }
            function handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope, ctrlState) {
                var select2ajaxName;
                if (mongooseType.caster) {
                    formInstructions.array = true;
                    mongooseType = mongooseType.caster;
                    angular.extend(mongooseOptions, mongooseType.options);
                    if (mongooseType.options && mongooseType.options.form) {
                        angular.extend(formInstructions, mongooseType.options.form);
                    }
                }
                if (mongooseType.instance === 'String') {
                    if (mongooseOptions.enum) {
                        formInstructions.type = formInstructions.type || 'select';
                        if (formInstructions.select2) {
                            $scope.conversions[formInstructions.name] = formInstructions.select2;
                            // Hacky way to get required styling working on select2 controls
                            if (mongooseOptions.required) {
                                $scope.$watch('record.' + formInstructions.name, function (newValue) {
                                    updateInvalidClasses(newValue, formInstructions.id, formInstructions.select2, ctrlState);
                                }, true);
                                // FIXME: use $timeout?
                                setTimeout(function () {
                                    updateInvalidClasses($scope.record[formInstructions.name], formInstructions.id, formInstructions.select2, ctrlState);
                                }, 0);
                            }
                            if (formInstructions.select2 === true) {
                                formInstructions.select2 = {};
                            }
                            formInstructions.select2.s2query = 'select2' + formInstructions.name.replace(/\./g, '_');
                            $scope[formInstructions.select2.s2query] = {
                                allowClear: !mongooseOptions.required,
                                initSelection: function (element, callback) {
                                    function executeCallback() {
                                        function drillIntoObject(parts, dataVal, fn) {
                                            if (dataVal) {
                                                if (parts.length === 0) {
                                                    fn(dataVal);
                                                }
                                                else {
                                                    if (angular.isArray(dataVal)) {
                                                        // extract the array offset of the subkey from the element id
                                                        var workString = element.context.getAttribute('ng-model');
                                                        var pos = workString.indexOf('.' + parts[0]);
                                                        workString = workString.slice(0, pos);
                                                        pos = workString.lastIndexOf('.');
                                                        workString = workString.slice(pos + 1);
                                                        workString = /.+\[(.+)\]/.exec(workString);
                                                        dataVal = dataVal[$scope[workString[1]]];
                                                    }
                                                    dataVal = dataVal[parts.shift()];
                                                    drillIntoObject(parts, dataVal, fn);
                                                }
                                            }
                                        }
                                        var dataVal = $scope.record;
                                        if (dataVal) {
                                            var parts = formInstructions.name.split('.');
                                            drillIntoObject(parts, dataVal, function (leafVal) {
                                                setTimeout(updateInvalidClasses(leafVal, formInstructions.id, formInstructions.select2, ctrlState));
                                                if (leafVal) {
                                                    if (formInstructions.array) {
                                                        var offset = parseInt(element.context.id.match('_[0-9].*$')[0].slice(1));
                                                        if (leafVal[offset].x) {
                                                            recordHandler.preservePristine(element, function () {
                                                                callback(leafVal[offset].x);
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        recordHandler.preservePristine(element, function () {
                                                            callback(leafVal);
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            $timeout(executeCallback);
                                        }
                                    }
                                    $timeout(executeCallback);
                                },
                                query: function (query) {
                                    var data = { results: [] }, searchString = query.term.toUpperCase();
                                    for (var i = 0; i < mongooseOptions.enum.length; i++) {
                                        if (mongooseOptions.enum[i].toUpperCase().indexOf(searchString) !== -1) {
                                            data.results.push({ id: i, text: mongooseOptions.enum[i] });
                                        }
                                    }
                                    query.callback(data);
                                }
                            };
                            _.extend($scope[formInstructions.select2.s2query], formInstructions.select2);
                            if (formInstructions.select2 === true) {
                                formInstructions.select2 = {};
                            } // In case they have used select2: true syntax
                            $scope.select2List.push(formInstructions.name);
                        }
                        else {
                            formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                            $scope[formInstructions.options] = mongooseOptions.enum;
                        }
                    }
                    else {
                        if (!formInstructions.type) {
                            formInstructions.type = (formInstructions.name.toLowerCase().indexOf('password') !== -1) ? 'password' : 'text';
                        }
                        if (mongooseOptions.match) {
                            formInstructions.add = 'pattern="' + mongooseOptions.match + '" ' + (formInstructions.add || '');
                        }
                    }
                }
                else if (mongooseType.instance === 'ObjectID') {
                    formInstructions.ref = mongooseOptions.ref;
                    if (formInstructions.link && formInstructions.link.linkOnly) {
                        formInstructions.type = 'link';
                        formInstructions.linkText = formInstructions.link.text;
                        formInstructions.form = formInstructions.link.form;
                        delete formInstructions.link;
                    }
                    else {
                        formInstructions.type = 'select';
                        // Support both of the syntaxes below
                        //            team : [ { type: Schema.Types.ObjectId , ref: 'f_nested_schema', form: {select2: {fngAjax: true}}} ],
                        //            team2:   { type:[Schema.Types.ObjectId], ref: 'f_nested_schema', form: {select2: {fngAjax: true}}},
                        if (formInstructions.select2 || (mongooseOptions.form && mongooseOptions.form.select2)) {
                            if (!formInstructions.select2) {
                                formInstructions.select2 = mongooseOptions.form.select2;
                            }
                            if (formInstructions.select2 === true) {
                                formInstructions.select2 = {};
                            }
                            $scope.select2List.push(formInstructions.name);
                            $scope.conversions[formInstructions.name] = formInstructions.select2;
                            if (formInstructions.select2.fngAjax) {
                                // create the instructions for select2
                                select2ajaxName = 'ajax' + formInstructions.name.replace(/\./g, '');
                                // If not required then generate a place holder if none specified (see https://github.com/forms-angular/forms-angular/issues/53)
                                if (!mongooseOptions.required && !formInstructions.placeHolder) {
                                    formInstructions.placeHolder = 'Select...';
                                }
                                $scope[select2ajaxName] = {
                                    allowClear: !mongooseOptions.required,
                                    minimumInputLength: 2,
                                    initSelection: function (element, callback) {
                                        var theId = element.val();
                                        if (theId && theId !== '') {
                                            SubmissionsService.getListAttributes(mongooseOptions.ref, theId)
                                                .success(function (data) {
                                                if (data.success === false) {
                                                    $location.path('/404');
                                                }
                                                var display = { id: theId, text: data.list };
                                                recordHandler.preservePristine(element, function () {
                                                    callback(display);
                                                });
                                            }).error($scope.handleHttpError);
                                        }
                                    },
                                    ajax: {
                                        url: '/api/search/' + mongooseOptions.ref,
                                        data: function (term, page) {
                                            var queryList = {
                                                q: term,
                                                pageLimit: 10,
                                                page: page // page number
                                            };
                                            var queryListExtension;
                                            if (typeof mongooseOptions.form.searchQuery === 'object') {
                                                queryListExtension = mongooseOptions.form.searchQuery;
                                            }
                                            else if (typeof mongooseOptions.form.searchQuery === 'function') {
                                                queryListExtension = mongooseOptions.form.searchQuery($scope, mongooseOptions);
                                            }
                                            if (queryListExtension) {
                                                _.extend(queryList, queryListExtension);
                                            }
                                            return queryList;
                                        },
                                        results: function (data) {
                                            return { results: data.results, more: data.moreCount > 0 };
                                        }
                                    }
                                };
                                _.extend($scope[select2ajaxName], formInstructions.select2);
                                formInstructions.select2.fngAjax = select2ajaxName;
                            }
                            else {
                                if (formInstructions.select2 === true) {
                                    formInstructions.select2 = {};
                                }
                                formInstructions.select2.s2query = 'select2' + formInstructions.name.replace(/\./g, '_');
                                $scope['select2' + formInstructions.select2.s2query] = {
                                    allowClear: !mongooseOptions.required,
                                    initSelection: function (element, callback) {
                                        var myId = element.val();
                                        if (myId !== '' && $scope[formInstructions.ids].length > 0) {
                                            var myVal = recordHandler.convertIdToListValue(myId, $scope[formInstructions.ids], $scope[formInstructions.options], formInstructions.name);
                                            var display = { id: myId, text: myVal };
                                            callback(display);
                                        }
                                    },
                                    query: function (query) {
                                        var data = { results: [] }, searchString = query.term.toUpperCase();
                                        for (var i = 0; i < $scope[formInstructions.options].length; i++) {
                                            if ($scope[formInstructions.options][i].toUpperCase().indexOf(searchString) !== -1) {
                                                data.results.push({
                                                    id: $scope[formInstructions.ids][i],
                                                    text: $scope[formInstructions.options][i]
                                                });
                                            }
                                        }
                                        query.callback(data);
                                    }
                                };
                                _.extend($scope[formInstructions.select2.s2query], formInstructions.select2);
                                formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                                formInstructions.ids = recordHandler.suffixCleanId(formInstructions, '_ids');
                                recordHandler.setUpSelectOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, handleSchema);
                            }
                        }
                        else if (!formInstructions.directive || !formInstructions[$filter('camelCase')(formInstructions.directive)] || !formInstructions[$filter('camelCase')(formInstructions.directive)].fngAjax) {
                            formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                            formInstructions.ids = recordHandler.suffixCleanId(formInstructions, '_ids');
                            recordHandler.setUpSelectOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, handleSchema);
                        }
                    }
                }
                else if (mongooseType.instance === 'Date') {
                    if (!formInstructions.type) {
                        if (formInstructions.readonly) {
                            formInstructions.type = 'text';
                        }
                        else {
                            formInstructions.type = 'text';
                            formInstructions.add = 'ui-date ui-date-format datepicker-popup-fix ';
                        }
                    }
                }
                else if (mongooseType.instance.toLowerCase() === 'boolean') {
                    formInstructions.type = 'checkbox';
                }
                else if (mongooseType.instance === 'Number') {
                    formInstructions.type = 'number';
                    if (mongooseOptions.min) {
                        formInstructions.add = 'min="' + mongooseOptions.min + '" ' + (formInstructions.add || '');
                    }
                    if (mongooseOptions.max) {
                        formInstructions.add = 'max="' + mongooseOptions.max + '" ' + (formInstructions.add || '');
                    }
                    if (formInstructions.step) {
                        formInstructions.add = 'step="' + formInstructions.step + '" ' + (formInstructions.add || '');
                    }
                }
                else {
                    throw new Error('Field ' + formInstructions.name + ' is of unsupported type ' + mongooseType.instance);
                }
                if (mongooseOptions.required) {
                    formInstructions.required = true;
                }
                if (mongooseOptions.readonly) {
                    formInstructions.readonly = true;
                }
                return formInstructions;
            }
            function updateInvalidClasses(value, id, select2, ctrlState) {
                var target = '#' + ((select2) ? 'cg_' : '') + id;
                var element = angular.element(document.querySelector(target));
                if (value) {
                    element.removeClass(ctrlState.fngInvalidRequired);
                }
                else {
                    element.addClass(ctrlState.fngInvalidRequired);
                }
            }
            function getArrayFieldToExtend(fieldName, $scope) {
                var fieldParts = fieldName.split('.');
                var arrayField = $scope.record;
                for (var i = 0, l = fieldParts.length; i < l; i++) {
                    if (!arrayField[fieldParts[i]]) {
                        if (i === l - 1) {
                            arrayField[fieldParts[i]] = [];
                        }
                        else {
                            arrayField[fieldParts[i]] = {};
                        }
                    }
                    arrayField = arrayField[fieldParts[i]];
                }
                return arrayField;
            }
            // TODO: Do this in form
            var basicInstructions = function (field, formData, prefix) {
                formData.name = prefix + field;
                //        formData.id = formData.id || 'f_' + prefix + field.replace(/\./g, '_');
                //        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || $filter('titleCase')(field));
                return formData;
            };
            var handleListInfo = function (destList, listOptions, field) {
                if (typeof listOptions === 'object') {
                    listOptions.name = field;
                    destList.push(listOptions);
                }
                else {
                    destList.push({ name: field });
                }
            };
            var handleEmptyList = function (description, destList, destForm, source) {
                // If no list fields specified use the first non hidden string field
                if (destForm) {
                    for (var i = 0, l = destForm.length; i < l; i++) {
                        if (destForm[i].type === 'text') {
                            destList.push({ name: destForm[i].name });
                            break;
                        }
                    }
                    if (destList.length === 0 && destForm.length !== 0) {
                        // If it is still blank then just use the first field
                        destList.push({ name: destForm[0].name });
                    }
                }
                if (destList.length === 0) {
                    // If it is still blank then just use the first field from source
                    for (var field in source) {
                        if (field !== '_id' && source.hasOwnProperty(field)) {
                            destList.push({ name: field });
                            break;
                        }
                    }
                    if (destList.length === 0) {
                        throw new Error('Unable to generate a title for ' + description);
                    }
                }
            };
            var evaluateConditional = function (condition, data, select2List) {
                function evaluateSide(side) {
                    var result = side;
                    if (typeof side === 'string' && side.slice(0, 1) === '$') {
                        var sideParts = side.split('.');
                        switch (sideParts.length) {
                            case 1:
                                result = recordHandler.getListData(data, side.slice(1), select2List);
                                break;
                            case 2:
                                // this is a sub schema element, and the appropriate array element has been passed
                                result = recordHandler.getListData(data, sideParts[1], select2List);
                                break;
                            default:
                                throw new Error('Unsupported showIf format');
                        }
                    }
                    return result;
                }
                var lhs = evaluateSide(condition.lhs), rhs = evaluateSide(condition.rhs), result;
                switch (condition.comp) {
                    case 'eq':
                        result = (lhs === rhs);
                        break;
                    case 'ne':
                        result = (lhs !== rhs);
                        break;
                    default:
                        throw new Error('Unsupported comparator ' + condition.comp);
                }
                return result;
            };
            // Conditionals
            // $scope.dataDependencies is of the form {fieldName1: [fieldId1, fieldId2], fieldName2:[fieldId2]}
            var handleConditionals = function (condInst, name, $scope) {
                var dependency = 0;
                function handleVar(theVar) {
                    if (typeof theVar === 'string' && theVar.slice(0, 1) === '$') {
                        var fieldName = theVar.slice(1);
                        var fieldDependencies = $scope.dataDependencies[fieldName] || [];
                        fieldDependencies.push(name);
                        $scope.dataDependencies[fieldName] = fieldDependencies;
                        dependency += 1;
                    }
                }
                var display = true;
                if (condInst) {
                    handleVar(condInst.lhs);
                    handleVar(condInst.rhs);
                    if (dependency === 0 && !evaluateConditional(condInst, undefined, $scope.select2List)) {
                        display = false;
                    }
                }
                return display;
            };
            return {
                // utility for apps that use forms-angular
                generateEditUrl: function generateEditUrl(obj, $scope) {
                    return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/edit');
                },
                generateNewUrl: function generateNewUrl($scope) {
                    return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + 'new');
                },
                handleFieldType: handleFieldType,
                handleSchema: handleSchema,
                // Conventional view is that this should go in a directive.  I reckon it is quicker here.
                updateDataDependentDisplay: function updateDataDependentDisplay(curValue, oldValue, force, $scope) {
                    var depends, i, j, k, element;
                    var forceNextTime;
                    for (var field in $scope.dataDependencies) {
                        if ($scope.dataDependencies.hasOwnProperty(field)) {
                            var parts = field.split('.');
                            // TODO: what about a simple (non array) subdoc?
                            if (parts.length === 1) {
                                if (force || !oldValue || curValue[field] !== oldValue[field]) {
                                    depends = $scope.dataDependencies[field];
                                    for (i = 0; i < depends.length; i += 1) {
                                        var name = depends[i];
                                        for (j = 0; j < $scope.formSchema.length; j += 1) {
                                            if ($scope.formSchema[j].name === name) {
                                                element = angular.element(document.querySelector('#cg_' + $scope.formSchema[j].id));
                                                if (evaluateConditional($scope.formSchema[j].showIf, curValue, $scope.select2List)) {
                                                    element.removeClass('ng-hide');
                                                }
                                                else {
                                                    element.addClass('ng-hide');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else if (parts.length === 2) {
                                if (forceNextTime === undefined) {
                                    forceNextTime = true;
                                }
                                if (curValue[parts[0]]) {
                                    for (k = 0; k < curValue[parts[0]].length; k++) {
                                        // We want to carry on if this is new array element or it is changed
                                        if (force || !oldValue || !oldValue[parts[0]] || !oldValue[parts[0]][k] || curValue[parts[0]][k][parts[1]] !== oldValue[parts[0]][k][parts[1]]) {
                                            depends = $scope.dataDependencies[field];
                                            for (i = 0; i < depends.length; i += 1) {
                                                var nameParts = depends[i].split('.');
                                                if (nameParts.length !== 2) {
                                                    throw new Error('Conditional display must control dependent fields at same level ');
                                                }
                                                for (j = 0; j < $scope.formSchema.length; j += 1) {
                                                    if ($scope.formSchema[j].name === nameParts[0]) {
                                                        var subSchema = $scope.formSchema[j].schema;
                                                        for (var l = 0; l < subSchema.length; l++) {
                                                            if (subSchema[l].name === depends[i]) {
                                                                element = angular.element(document.querySelector('#f_' + nameParts[0] + 'List_' + k + ' #cg_f_' + depends[i].replace('.', '_')));
                                                                if (element.length === 0) {
                                                                    // Test Plait care plan structures if you change next line
                                                                    element = angular.element(document.querySelector('#f_elements-' + k + '-' + nameParts[1]));
                                                                }
                                                                else {
                                                                    forceNextTime = false; // Because the sub schema has been rendered we don't need to do this again until the record changes
                                                                }
                                                                if (element.length > 0) {
                                                                    if (evaluateConditional($scope.formSchema[j].schema[l].showIf, curValue[parts[0]][k], $scope.select2List)) {
                                                                        element.show();
                                                                    }
                                                                    else {
                                                                        element.hide();
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                // TODO: this needs rewrite for nesting
                                throw new Error('You can only go down one level of subdocument with showIf');
                            }
                        }
                    }
                    return forceNextTime;
                },
                add: function add(fieldName, $event, $scope) {
                    var arrayField = getArrayFieldToExtend(fieldName, $scope);
                    arrayField.push({});
                    $scope.setFormDirty($event);
                },
                unshift: function unshift(fieldName, $event, $scope) {
                    var arrayField = getArrayFieldToExtend(fieldName, $scope);
                    arrayField.unshift({});
                    $scope.setFormDirty($event);
                },
                remove: function remove(fieldName, value, $event, $scope) {
                    // Remove an element from an array
                    var fieldParts = fieldName.split('.');
                    var arrayField = $scope.record;
                    for (var i = 0, l = fieldParts.length; i < l; i++) {
                        arrayField = arrayField[fieldParts[i]];
                    }
                    arrayField.splice(value, 1);
                    $scope.setFormDirty($event);
                },
                hasError: function hasError(formName, name, index, $scope) {
                    var result = false;
                    if ($scope) {
                        var form = $scope[$scope.topLevelFormName];
                        if (formName !== 'null') {
                            form = form[formName.replace('$index', index)];
                        }
                        // Cannot assume that directives will use the same methods
                        if (form) {
                            var field = form[name];
                            if (field && field.$invalid) {
                                if (field.$dirty) {
                                    result = true;
                                }
                                else {
                                    // with pristine fields, they have to have some sort of invalidity other than ng-invalid-required
                                    angular.forEach(field.$validators, function (obj, key) {
                                        if (key !== 'required' && field.$error[key]) {
                                            result = true;
                                        }
                                    });
                                }
                            }
                        }
                    }
                    else {
                        console.log('hasError called with no scope! ', formName, name, index);
                    }
                    return result;
                },
                decorateScope: function decorateScope($scope, formGeneratorInstance, recordHandlerInstance, sharedStuff) {
                    $scope.record = sharedStuff.record;
                    $scope.phase = 'init';
                    $scope.disableFunctions = sharedStuff.disableFunctions;
                    $scope.dataEventFunctions = sharedStuff.dataEventFunctions;
                    $scope.topLevelFormName = undefined;
                    $scope.formSchema = [];
                    $scope.tabs = [];
                    $scope.listSchema = [];
                    $scope.recordList = [];
                    $scope.dataDependencies = {};
                    $scope.select2List = [];
                    $scope.conversions = {};
                    $scope.pageSize = 60;
                    $scope.pagesLoaded = 0;
                    sharedStuff.baseScope = $scope;
                    $scope.generateEditUrl = function (obj) {
                        return formGeneratorInstance.generateEditUrl(obj, $scope);
                    };
                    $scope.generateNewUrl = function () {
                        return formGeneratorInstance.generateNewUrl($scope);
                    };
                    $scope.scrollTheList = function () {
                        return recordHandlerInstance.scrollTheList($scope);
                    };
                    $scope.getListData = function (record, fieldName) {
                        return recordHandlerInstance.getListData(record, fieldName, $scope.select2List);
                    };
                    $scope.setPristine = function (clearErrors) {
                        if (clearErrors) {
                            $scope.dismissError();
                        }
                        if ($scope[$scope.topLevelFormName]) {
                            $scope[$scope.topLevelFormName].$setPristine();
                        }
                    };
                    $scope.skipCols = function (index) {
                        return index > 0 ? 'col-md-offset-3' : '';
                    };
                    $scope.setFormDirty = function (event) {
                        if (event) {
                            var form = angular.element(event.target).inheritedData('$formController');
                            form.$setDirty();
                        }
                        else {
                            console.log('setFormDirty called without an event (fine in a unit test)');
                        }
                    };
                    $scope.add = function (fieldName, $event) {
                        return formGeneratorInstance.add(fieldName, $event, $scope);
                    };
                    $scope.hasError = function (form, name, index) {
                        return formGeneratorInstance.hasError(form, name, index, $scope);
                    };
                    $scope.unshift = function (fieldName, $event) {
                        return formGeneratorInstance.unshift(fieldName, $event, $scope);
                    };
                    $scope.remove = function (fieldName, value, $event) {
                        return formGeneratorInstance.remove(fieldName, value, $event, $scope);
                    };
                    // Open a select2 control from the appended search button.  OK to use $ here as select2 itself is dependent on jQuery.
                    $scope.openSelect2 = function (ev) {
                        $('#' + $(ev.currentTarget).data('select2-open'))['select2']('open');
                    };
                    // Useful utility when debugging
                    $scope.toJSON = function (obj) {
                        return 'The toJSON function is deprecated - use the json filter instead\n\n' + JSON.stringify(obj, null, 2) +
                            '\n\n*** The toJSON function is deprecated - use the json filter instead ***';
                    };
                    $scope.baseSchema = function () {
                        return ($scope.tabs.length ? $scope.tabs : $scope.formSchema);
                    };
                }
            };
        }
        services.formGenerator = formGenerator;
        formGenerator.$inject = ["$location", "$timeout", "$filter", "SubmissionsService", "routingService", "recordHandler"];
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        formMarkupHelper.$inject = ["cssFrameworkService", "inputSizeHelper", "addAllService"];
        function formMarkupHelper(cssFrameworkService, inputSizeHelper, addAllService) {
            function generateNgShow(showWhen, model) {
                function evaluateSide(side) {
                    var result = side;
                    if (typeof side === 'string') {
                        if (side.slice(0, 1) === '$') {
                            result = (model || 'record') + '.';
                            var parts = side.slice(1).split('.');
                            if (parts.length > 1) {
                                var lastBit = parts.pop();
                                result += parts.join('.') + '[$index].' + lastBit;
                            }
                            else {
                                result += side.slice(1);
                            }
                        }
                        else {
                            result = '\'' + side + '\'';
                        }
                    }
                    return result;
                }
                var conditionText = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'], conditionSymbols = ['===', '!==', '>', '>=', '<', '<='], conditionPos = conditionText.indexOf(showWhen.comp);
                if (conditionPos === -1) {
                    throw new Error('Invalid comparison in showWhen');
                }
                return evaluateSide(showWhen.lhs) + conditionSymbols[conditionPos] + evaluateSide(showWhen.rhs);
            }
            var isHorizontalStyle = function isHorizontalStyle(formStyle) {
                return (!formStyle || formStyle === 'undefined' || ['vertical', 'inline'].indexOf(formStyle) === -1);
            };
            function glyphClass() {
                return (cssFrameworkService.framework() === 'bs2') ? 'icon' : 'glyphicon glyphicon';
            }
            return {
                isHorizontalStyle: isHorizontalStyle,
                fieldChrome: function fieldChrome(scope, info, options) {
                    var classes = '';
                    var template = '';
                    var closeTag = '';
                    var insert = '';
                    info.showWhen = info.showWhen || info.showwhen; //  deal with use within a directive
                    if (info.showWhen) {
                        if (typeof info.showWhen === 'string') {
                            insert += 'ng-show="' + info.showWhen + '"';
                        }
                        else {
                            insert += 'ng-show="' + generateNgShow(info.showWhen, options.model) + '"';
                        }
                    }
                    insert += ' id="cg_' + info.id.replace(/\./g, '-') + '"';
                    if (cssFrameworkService.framework() === 'bs3') {
                        classes = 'form-group';
                        if (options.formstyle === 'vertical' && info.size !== 'block-level') {
                            template += '<div class="row">';
                            classes += ' col-sm-' + inputSizeHelper.sizeAsNumber(info.size);
                            closeTag += '</div>';
                        }
                        var modelControllerName;
                        var formName = null;
                        var parts = info.name.split('.');
                        if (options && typeof options.subkeyno !== 'undefined') {
                            modelControllerName = options.subschemaroot.replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + parts[parts.length - 1];
                        }
                        else if (options.subschema) {
                            formName = 'form_' + parts.slice(0, -1).join('_') + '$index';
                            modelControllerName = info.name.replace(/\./g, '-');
                        }
                        else {
                            modelControllerName = 'f_' + info.name.replace(/\./g, '_');
                        }
                        template += '<div' + addAllService.addAll(scope, 'Group', classes, options) + ' ng-class="{\'has-error\': hasError(\'' + formName + '\',\'' + modelControllerName + '\', $index)}"';
                        closeTag += '</div>';
                    }
                    else {
                        if (isHorizontalStyle(options.formstyle)) {
                            template += '<div' + addAllService.addAll(scope, 'Group', 'control-group', options);
                            closeTag = '</div>';
                        }
                        else {
                            template += '<span ';
                            closeTag = '</span>';
                        }
                    }
                    template += (insert || '') + '>';
                    return { template: template, closeTag: closeTag };
                },
                label: function label(scope, fieldInfo, addButtonMarkup, options) {
                    var labelHTML = '';
                    if ((cssFrameworkService.framework() === 'bs3' || (options.formstyle !== 'inline' && fieldInfo.label !== '')) || addButtonMarkup) {
                        labelHTML = '<label';
                        var classes = 'control-label';
                        if (isHorizontalStyle(options.formstyle)) {
                            labelHTML += ' for="' + fieldInfo.id + '"';
                            if (typeof fieldInfo.labelDefaultClass !== 'undefined') {
                                // Override default label class (can be empty)
                                classes += ' ' + fieldInfo.labelDefaultClass;
                            }
                            else if (cssFrameworkService.framework() === 'bs3') {
                                classes += ' col-sm-3';
                            }
                        }
                        else if (options.formstyle === 'inline') {
                            labelHTML += ' for="' + fieldInfo.id + '"';
                            classes += ' sr-only';
                        }
                        labelHTML += addAllService.addAll(scope, 'Label', null, options) + ' class="' + classes + '">' + fieldInfo.label;
                        if (addButtonMarkup) {
                            labelHTML += ' <i id="add_' + fieldInfo.id + '" ng-click="add(\'' + fieldInfo.name + '\',$event)" class="' + glyphClass() + '-plus-sign"></i>';
                        }
                        labelHTML += '</label>';
                    }
                    return labelHTML;
                },
                glyphClass: glyphClass,
                allInputsVars: function allInputsVars(scope, fieldInfo, options, modelString, idString, nameString) {
                    var placeHolder = fieldInfo.placeHolder;
                    var common;
                    var compactClass = '';
                    var sizeClassBS3 = '';
                    var sizeClassBS2 = '';
                    var formControl = '';
                    if (cssFrameworkService.framework() === 'bs3') {
                        compactClass = (['horizontal', 'vertical', 'inline'].indexOf(options.formstyle) === -1) ? ' input-sm' : '';
                        sizeClassBS3 = 'col-sm-' + inputSizeHelper.sizeAsNumber(fieldInfo.size);
                        formControl = ' form-control';
                    }
                    else {
                        sizeClassBS2 = (fieldInfo.size ? ' input-' + fieldInfo.size : '');
                    }
                    if (options.formstyle === 'inline') {
                        placeHolder = placeHolder || fieldInfo.label;
                    }
                    common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' name="' + nameString + '" ');
                    common += (placeHolder ? ('placeholder="' + placeHolder + '" ') : '');
                    if (fieldInfo.popup) {
                        common += 'title="' + fieldInfo.popup + '" ';
                    }
                    common += addAllService.addAll(scope, 'Field', null, options);
                    return {
                        common: common,
                        sizeClassBS3: sizeClassBS3,
                        sizeClassBS2: sizeClassBS2,
                        compactClass: compactClass,
                        formControl: formControl
                    };
                },
                inputChrome: function inputChrome(value, fieldInfo, options, markupVars) {
                    if (cssFrameworkService.framework() === 'bs3' && isHorizontalStyle(options.formstyle) && fieldInfo.type !== 'checkbox') {
                        value = '<div class="bs3-input ' + markupVars.sizeClassBS3 + '">' + value + '</div>';
                    }
                    if (fieldInfo.helpInline) {
                        value += '<span class="' + (cssFrameworkService.framework() === 'bs2' ? 'help-inline' : 'help-block') + '">' + fieldInfo.helpInline + '</span>';
                    }
                    // If we have chosen
                    value += '<div ng-if="' + (options.name || 'myForm') + '.' + fieldInfo.id + '.$dirty" class="help-block">' +
                        ' <div ng-messages="' + (options.name || 'myForm') + '.' + fieldInfo.id + '.$error">' +
                        '  <div ng-messages-include="error-messages.html">' +
                        '  </div>' +
                        ' </div>' +
                        '</div>';
                    if (fieldInfo.help) {
                        value += '<span class="help-block">' + fieldInfo.help + '</span>';
                    }
                    return value;
                },
                generateSimpleInput: function generateSimpleInput(common, fieldInfo, options) {
                    var result = '<input ' + common + 'type="' + fieldInfo.type + '"';
                    if (options.formstyle === 'inline' && cssFrameworkService.framework() === 'bs2' && !fieldInfo.size) {
                        result += 'class="input-small"';
                    }
                    result += ' />';
                    return result;
                },
                controlDivClasses: function controlDivClasses(options) {
                    var result = [];
                    if (isHorizontalStyle(options.formstyle)) {
                        result.push(cssFrameworkService.framework() === 'bs2' ? 'controls' : 'col-sm-9');
                    }
                    return result;
                },
                handleInputAndControlDiv: function handleInputAndControlDiv(inputMarkup, controlDivClasses) {
                    if (controlDivClasses.length > 0) {
                        inputMarkup = '<div class="' + controlDivClasses.join(' ') + '">' + inputMarkup + '</div>';
                    }
                    return inputMarkup;
                },
                handleArrayInputAndControlDiv: function handleArrayInputAndControlDiv(inputMarkup, controlDivClasses, info, options) {
                    var result = '<div ';
                    if (cssFrameworkService.framework() === 'bs3') {
                        result += 'ng-class="skipCols($index)" ';
                    }
                    result += 'class="' + controlDivClasses.join(' ') + '" id="' + info.id + 'List" ';
                    result += 'ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + ' track by $index">';
                    result += inputMarkup;
                    if (info.type !== 'link') {
                        result += '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="' + glyphClass() + '-minus-sign"></i>';
                    }
                    result += '</div>';
                    return result;
                },
                addTextInputMarkup: function addTextInputMarkup(allInputsVars, fieldInfo, requiredStr) {
                    var result = '';
                    var setClass = allInputsVars.formControl.trim() + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + (fieldInfo.class ? ' ' + fieldInfo.class : '');
                    if (setClass.length !== 0) {
                        result += 'class="' + setClass + '"';
                    }
                    if (fieldInfo.add) {
                        result += ' ' + fieldInfo.add + ' ';
                    }
                    result += requiredStr + (fieldInfo.readonly ? ' readonly' : '') + ' ';
                    return result;
                }
            };
        }
        services.formMarkupHelper = formMarkupHelper;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function inputSizeHelper() {
            var sizeMapping = [1, 2, 4, 6, 8, 10, 12];
            var sizeDescriptions = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'];
            var defaultSizeOffset = 2; // medium, which was the default for Twitter Bootstrap 2
            return {
                sizeMapping: sizeMapping,
                sizeDescriptions: sizeDescriptions,
                defaultSizeOffset: defaultSizeOffset,
                sizeAsNumber: function (fieldSizeAsText) {
                    return sizeMapping[fieldSizeAsText ? sizeDescriptions.indexOf(fieldSizeAsText) : defaultSizeOffset];
                }
            };
        }
        services.inputSizeHelper = inputSizeHelper;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*
         A helper service to provide a starting off point for directive plugins
         */
        /*@ngInject*/
        pluginHelper.$inject = ["formMarkupHelper"];
        function pluginHelper(formMarkupHelper) {
            return {
                extractFromAttr: function extractFromAttr(attr, directiveName) {
                    function deserialize(str) {
                        var retVal = str.replace(/&quot;/g, '"');
                        if (retVal === 'true') {
                            retVal = true;
                        }
                        else if (retVal === 'false') {
                            retVal = false;
                        }
                        else if (!isNaN(parseFloat(retVal)) && isFinite(retVal)) {
                            retVal = parseFloat(retVal);
                        }
                        return retVal;
                    }
                    var info = {};
                    var options = { formStyle: attr.formstyle };
                    var directiveOptions = {};
                    var directiveNameLength = directiveName ? directiveName.length : 0;
                    for (var prop in attr) {
                        if (attr.hasOwnProperty(prop)) {
                            if (prop.slice(0, 6) === 'fngFld') {
                                info[prop.slice(6).toLowerCase()] = deserialize(attr[prop]);
                            }
                            else if (prop.slice(0, 6) === 'fngOpt') {
                                options[prop.slice(6).toLowerCase()] = deserialize(attr[prop]);
                            }
                            else if (directiveName && prop.slice(0, directiveNameLength) === directiveName) {
                                directiveOptions[prop.slice(directiveNameLength).toLowerCase()] = deserialize(attr[prop]);
                            }
                        }
                    }
                    return { info: info, options: options, directiveOptions: directiveOptions };
                },
                buildInputMarkup: function buildInputMarkup(scope, model, info, options, addButtons, needsX, generateInputControl) {
                    var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options, ' id="cg_' + info.id + '"');
                    var controlDivClasses = formMarkupHelper.controlDivClasses(options);
                    var elementHtml = fieldChrome.template + formMarkupHelper.label(scope, info, addButtons, options);
                    var modelString, idString, nameString;
                    if (addButtons) {
                        modelString = 'arrayItem' + (needsX ? '.x' : '');
                        idString = info.id + '_{{$index}}';
                        nameString = info.name + '_{{$index}}';
                    }
                    else {
                        modelString = model + '.' + info.name;
                        idString = info.id;
                        nameString = info.name;
                    }
                    if (options.subschema && info.name.indexOf('.') !== -1) {
                        // Schema handling - need to massage the ngModel and the id
                        var modelBase = model + '.';
                        var compoundName = info.name;
                        var root = options.subschemaroot;
                        var lastPart = compoundName.slice(root.length + 1);
                        modelString = modelBase;
                        if (options.index) {
                            modelString += root + '[' + options.index + '].' + lastPart;
                            idString = 'f_' + modelString.slice(modelBase.length).replace(/(\.|\[|\]\.)/g, '-');
                        }
                        else {
                            modelString += root;
                            if (options.subkey) {
                                idString = modelString.slice(modelBase.length).replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + lastPart;
                                modelString += '[' + '$_arrayOffset_' + root.replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                            }
                            else {
                                modelString += '[$index].' + lastPart;
                                idString = null;
                                nameString = compoundName.replace(/\./g, '-');
                            }
                        }
                    }
                    var buildingBlocks = formMarkupHelper.allInputsVars(scope, info, options, modelString, idString, nameString);
                    elementHtml += formMarkupHelper['handle' + (addButtons ? 'Array' : '') + 'InputAndControlDiv'](formMarkupHelper.inputChrome(generateInputControl(buildingBlocks), info, options, buildingBlocks), controlDivClasses, info, options);
                    elementHtml += fieldChrome.closeTag;
                    return elementHtml;
                },
                findIdInSchemaAndFlagNeedX: function findIdInSchemaAndFlagNeedX(scope, id) {
                    // Find the entry in the schema of scope for id and add a needsX property so string arrays are properly handled
                    var foundIt = false;
                    for (var i = 0; i < scope.length; i++) {
                        var element = scope[i];
                        if (element.id === id) {
                            element.needsX = true;
                            foundIt = true;
                            break;
                        }
                        else if (element.schema) {
                            if (findIdInSchemaAndFlagNeedX(element.schema, id)) {
                                foundIt = true;
                                break;
                            }
                        }
                    }
                    return foundIt;
                }
            };
        }
        services.pluginHelper = pluginHelper;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/underscore/underscore.d.ts" />
/// <reference path="../fng-types.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /**
         * Operations on a whole record
         *
         * All methods should be state-less
         *
         */
        /*@ngInject*/
        recordHandler.$inject = ["$location", "$window", "$filter", "$timeout", "routingService", "SubmissionsService", "SchemasService"];
        function recordHandler($location, $window, $filter, $timeout, routingService, SubmissionsService, SchemasService) {
            var suffixCleanId = function suffixCleanId(inst, suffix) {
                return (inst.id || 'f_' + inst.name).replace(/\./g, '_') + suffix;
            };
            var walkTree = function (object, fieldname, element) {
                // Walk through subdocs to find the required key
                // for instance walkTree(master,'address.street.number',element)
                // called by getData and setData
                // element is used when accessing in the context of a input, as the id (like exams-2-grader)
                // gives us the element of an array (one level down only for now).  Leaving element blank returns the whole array
                var parts = fieldname.split('.'), higherLevels = parts.length - 1, workingRec = object;
                for (var i = 0; i < higherLevels; i++) {
                    if (angular.isArray(workingRec)) {
                        workingRec = _.map(workingRec, function (obj) {
                            return obj[parts[i]];
                        });
                    }
                    else {
                        workingRec = workingRec[parts[i]];
                    }
                    if (angular.isArray(workingRec) && element && element.scope && typeof element.scope === 'function') {
                        // If we come across an array we need to find the correct position, if we have an element
                        workingRec = workingRec[element.scope().$index];
                    }
                    if (!workingRec) {
                        break;
                    }
                }
                return {
                    lastObject: workingRec,
                    key: workingRec ? parts[higherLevels] : undefined
                };
            };
            var setData = function setData(object, fieldname, element, value) {
                var leafData = walkTree(object, fieldname, element);
                if (leafData.lastObject && leafData.key) {
                    if (angular.isArray(leafData.lastObject)) {
                        for (var i = 0; i < leafData.lastObject.length; i++) {
                            leafData.lastObject[i][leafData.key] = value[i];
                        }
                    }
                    else {
                        leafData.lastObject[leafData.key] = value;
                    }
                }
            };
            var getData = function (object, fieldname, element) {
                var leafData = walkTree(object, fieldname, element);
                var retVal;
                if (leafData.lastObject && leafData.key) {
                    if (angular.isArray(leafData.lastObject)) {
                        retVal = _.map(leafData.lastObject, function (obj) {
                            return obj[leafData.key];
                        });
                    }
                    else {
                        retVal = leafData.lastObject[leafData.key];
                    }
                }
                return retVal;
            };
            var updateRecordWithLookupValues = function (schemaElement, $scope, ctrlState) {
                // Update the master and the record with the lookup values, master first
                if (!$scope.topLevelFormName || $scope[$scope.topLevelFormName].$pristine) {
                    updateObject(schemaElement.name, ctrlState.master, function (value) {
                        return convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]);
                    });
                    // Then copy the converted keys from master into record
                    var newVal = getData(ctrlState.master, schemaElement.name);
                    if (newVal) {
                        setData($scope.record, schemaElement.name, undefined, newVal);
                    }
                }
            };
            // Split a field name into the next level and all following levels
            function splitFieldName(aFieldName) {
                var nesting = aFieldName.split('.'), result = [nesting[0]];
                if (nesting.length > 1) {
                    result.push(nesting.slice(1).join('.'));
                }
                return result;
            }
            // TODO: Think about nested arrays
            // This doesn't handle things like :
            // {a:"hhh",b:[{c:[1,2]},{c:[3,4]}]}
            var getListData = function getListData(record, fieldName, select2List) {
                var nests = fieldName.split('.');
                for (var i = 0; i < nests.length; i++) {
                    if (record !== undefined && record !== null) {
                        record = record[nests[i]];
                    }
                }
                if (record && select2List.indexOf(nests[i - 1]) !== -1) {
                    record = record.text || record;
                }
                if (record === undefined) {
                    record = '';
                }
                return record;
            };
            function updateObject(aFieldName, portion, fn) {
                var fieldDetails = splitFieldName(aFieldName);
                if (fieldDetails.length > 1) {
                    updateArrayOrObject(fieldDetails[1], portion[fieldDetails[0]], fn);
                }
                else if (portion[fieldDetails[0]]) {
                    var theValue = portion[fieldDetails[0]];
                    // Strip out empty objects here (in case anyone added to an array and didn't populate it)
                    if (angular.isArray(theValue)) {
                        for (var i = theValue.length - 1; i >= 0; i--) {
                            var type = typeof theValue[i];
                            if (type === 'undefined' || (type === 'object' && Object.keys(theValue[i]).length === 0)) {
                                theValue.splice(i, 1);
                            }
                        }
                    }
                    portion[fieldDetails[0]] = fn(theValue);
                }
            }
            function updateArrayOrObject(aFieldName, portion, fn) {
                if (portion !== undefined) {
                    if (angular.isArray(portion)) {
                        for (var i = 0; i < portion.length; i++) {
                            updateObject(aFieldName, portion[i], fn);
                        }
                    }
                    else {
                        updateObject(aFieldName, portion, fn);
                    }
                }
            }
            var simpleArrayNeedsX = function (aSchema) {
                var result = false;
                if (aSchema.type === 'text') {
                    result = true;
                }
                else if (aSchema.needsX || ((aSchema.type === 'select') && !aSchema.ids && !aSchema.directive)) {
                    result = true;
                }
                return result;
            };
            // Convert {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
            // Which is what we need for use in the browser
            var convertToAngularModel = function (schema, anObject, prefixLength, $scope, master) {
                master = master || anObject;
                for (var i = 0; i < schema.length; i++) {
                    var schemaEntry = schema[i];
                    var fieldName = schemaEntry.name.slice(prefixLength);
                    var fieldValue = getData(anObject, fieldName);
                    if (schemaEntry.schema) {
                        if (fieldValue) {
                            for (var j = 0; j < fieldValue.length; j++) {
                                fieldValue[j] = convertToAngularModel(schemaEntry.schema, fieldValue[j], prefixLength + 1 + fieldName.length, $scope, master);
                            }
                        }
                    }
                    else {
                        // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
                        var thisField = getListData(anObject, fieldName, $scope.select2List);
                        if (schemaEntry.array && simpleArrayNeedsX(schemaEntry) && thisField) {
                            for (var k = 0; k < thisField.length; k++) {
                                thisField[k] = { x: thisField[k] };
                            }
                        }
                        // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
                        var idList = $scope[suffixCleanId(schemaEntry, '_ids')];
                        if (fieldValue && idList && idList.length > 0) {
                            if (fieldName.indexOf('.') !== -1) {
                                throw new Error('Trying to directly assign to a nested field 332');
                            } // Not sure that this can happen, but put in a runtime test
                            anObject[fieldName] = convertForeignKeys(schemaEntry, fieldValue, $scope[suffixCleanId(schemaEntry, 'Options')], idList);
                        }
                        else if (schemaEntry.select2 && !schemaEntry.select2.fngAjax) {
                            if (fieldValue) {
                                if (schemaEntry.array) {
                                    for (var n = 0; n < fieldValue.length; n++) {
                                        $scope[schemaEntry.select2.s2query].query({
                                            term: fieldValue[n].x.text || fieldValue[n].text || fieldValue[n].x || fieldValue[n],
                                            callback: function (array) {
                                                if (array.results.length > 0) {
                                                    if (fieldValue[n].x) {
                                                        if (fieldName.indexOf('.') !== -1) {
                                                            throw new Error('Trying to directly assign to a nested field 342');
                                                        }
                                                        anObject[fieldName][n].x = array.results[0];
                                                    }
                                                    else {
                                                        if (fieldName.indexOf('.') !== -1) {
                                                            throw new Error('Trying to directly assign to a nested field 345');
                                                        }
                                                        anObject[fieldName][n] = array.results[0];
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                                else {
                                    $scope[schemaEntry.select2.s2query].query({
                                        term: fieldValue,
                                        callback: function (array) {
                                            if (array.results.length > 0) {
                                                if (fieldName.indexOf('.') !== -1) {
                                                    throw new Error('Trying to directly assign to a nested field 357');
                                                }
                                                anObject[fieldName] = array.results[0];
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        else if (schemaEntry.select2) {
                            // Do nothing with these - handled elsewhere (and deprecated)
                            void (schemaEntry.select2);
                        }
                        else if (fieldValue &&
                            $scope.conversions[schemaEntry.name] &&
                            $scope.conversions[schemaEntry.name].fngajax &&
                            !$scope.conversions[schemaEntry.name].noconvert) {
                            var conversionEntry = schemaEntry;
                            $scope.conversions[conversionEntry.name].fngajax(fieldValue, conversionEntry, function (updateEntry, value) {
                                // Update the master and (preserving pristine if appropriate) the record
                                setData(master, updateEntry.name, undefined, value);
                                preservePristine(angular.element('#' + updateEntry.id), function () {
                                    setData($scope.record, updateEntry.name, undefined, value);
                                });
                            });
                        }
                    }
                }
                return anObject;
            };
            // Convert foreign keys into their display for selects
            // Called when the model is read and when the lookups are read
            // No support for nested schemas here as it is called from convertToAngularModel which does that
            function convertForeignKeys(schemaElement, input, values, ids) {
                if (schemaElement.array) {
                    var returnArray = [];
                    var needsX = !schemaElement.directive || simpleArrayNeedsX(schemaElement);
                    for (var j = 0; j < input.length; j++) {
                        var val = input[j];
                        if (val && val.x) {
                            val = val.x;
                        }
                        var lookup = convertIdToListValue(val, ids, values, schemaElement.name);
                        if (needsX) {
                            lookup = { x: lookup };
                        }
                        returnArray.push(lookup);
                    }
                    return returnArray;
                }
                else if (schemaElement.select2) {
                    return { id: input, text: convertIdToListValue(input, ids, values, schemaElement.name) };
                }
                else {
                    return convertIdToListValue(input, ids, values, schemaElement.name);
                }
            }
            // Convert ids into their foreign keys
            // Called when saving the model
            // No support for nested schemas here as it is called from convertToMongoModel which does that
            function convertToForeignKeys(schemaElement, input, values, ids) {
                if (schemaElement.array) {
                    var returnArray = [];
                    for (var j = 0; j < input.length; j++) {
                        returnArray.push(convertListValueToId(input[j], values, ids, schemaElement.name));
                    }
                    return returnArray;
                }
                else {
                    return convertListValueToId(input, values, ids, schemaElement.name);
                }
            }
            var convertListValueToId = function (value, valuesArray, idsArray, fname) {
                var textToConvert = _.isObject(value) ? (value.x || value.text) : value;
                if (textToConvert && textToConvert.match(/^[0-9a-f]{24}$/)) {
                    return textToConvert; // a plugin probably added this
                }
                else {
                    var index = valuesArray.indexOf(textToConvert);
                    if (index === -1) {
                        throw new Error('convertListValueToId: Invalid data - value ' + textToConvert + ' not found in ' + valuesArray + ' processing ' + fname);
                    }
                    return idsArray[index];
                }
            };
            var preservePristine = function preservePristine(element, fn) {
                // stop the form being set to dirty when a fn is called
                // Use when the record (and master) need to be updated by lookup values displayed asynchronously
                var modelController = element.inheritedData('$ngModelController');
                var isClean = (modelController && modelController.$pristine);
                if (isClean) {
                    // fake it to dirty here and reset after call to fn
                    modelController.$pristine = false;
                }
                fn();
                if (isClean) {
                    modelController.$pristine = true;
                }
            };
            var convertIdToListValue = function convertIdToListValue(id, idsArray, valuesArray, fname) {
                var index = idsArray.indexOf(id);
                if (index === -1) {
                    throw new Error('convertIdToListValue: Invalid data - id ' + id + ' not found in ' + idsArray + ' processing ' + fname);
                }
                return valuesArray[index];
            };
            var processServerData = function processServerData(recordFromServer, $scope, ctrlState) {
                ctrlState.master = convertToAngularModel($scope.formSchema, recordFromServer, 0, $scope);
                $scope.phase = 'ready';
                $scope.cancel();
            };
            function fillFormFromBackendCustomSchema(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState) {
                var listOnly = (!$scope.id && !$scope.newRecord);
                // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
                // but should be removed when/if formschemas are cached
                formGeneratorInstance.handleSchema('Main ' + $scope.modelName, schema, listOnly ? null : $scope.formSchema, $scope.listSchema, '', true, $scope, ctrlState);
                if (listOnly) {
                    ctrlState.allowLocationChange = true;
                }
                else {
                    var force = true;
                    $scope.$watch('record', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            force = formGeneratorInstance.updateDataDependentDisplay(newValue, oldValue, force, $scope);
                        }
                    }, true);
                    if ($scope.id) {
                        // Going to read a record
                        if (typeof $scope.dataEventFunctions.onBeforeRead === 'function') {
                            $scope.dataEventFunctions.onBeforeRead($scope.id, function (err) {
                                if (err) {
                                    $scope.showError(err);
                                }
                                else {
                                    recordHandlerInstance.readRecord($scope, ctrlState);
                                }
                            });
                        }
                        else {
                            recordHandlerInstance.readRecord($scope, ctrlState);
                        }
                    }
                    else {
                        // New record
                        ctrlState.master = {};
                        $scope.phase = 'ready';
                        $scope.cancel();
                    }
                }
            }
            function handleError($scope) {
                return function (data, status) {
                    if ([200, 400].indexOf(status) !== -1) {
                        var errorMessage = '';
                        for (var errorField in data.errors) {
                            if (data.errors.hasOwnProperty(errorField)) {
                                errorMessage += '<li><b>' + $filter('titleCase')(errorField) + ': </b> ';
                                switch (data.errors[errorField].type) {
                                    case 'enum':
                                        errorMessage += 'You need to select from the list of values';
                                        break;
                                    default:
                                        errorMessage += data.errors[errorField].message;
                                        break;
                                }
                                errorMessage += '</li>';
                            }
                        }
                        if (errorMessage.length > 0) {
                            errorMessage = data.message + '<br /><ul>' + errorMessage + '</ul>';
                        }
                        else {
                            errorMessage = data.message || 'Error!  Sorry - No further details available.';
                        }
                        $scope.showError(errorMessage);
                    }
                    else {
                        $scope.showError(status + ' ' + JSON.stringify(data));
                    }
                };
            }
            return {
                readRecord: function readRecord($scope, ctrlState) {
                    // TODO Consider using $parse for this - http://bahmutov.calepin.co/angularjs-parse-hacks.html
                    SubmissionsService.readRecord($scope.modelName, $scope.id)
                        .success(function (data) {
                        if (data.success === false) {
                            $location.path('/404');
                        }
                        ctrlState.allowLocationChange = false;
                        $scope.phase = 'reading';
                        if (typeof $scope.dataEventFunctions.onAfterRead === 'function') {
                            $scope.dataEventFunctions.onAfterRead(data);
                        }
                        processServerData(data, $scope, ctrlState);
                    }).error($scope.handleHttpError);
                },
                scrollTheList: function scrollTheList($scope) {
                    var pagesLoaded = $scope.pagesLoaded;
                    SubmissionsService.getPagedAndFilteredList($scope.modelName, {
                        aggregate: $location.$$search.a,
                        find: $location.$$search.f,
                        limit: $scope.pageSize,
                        skip: pagesLoaded * $scope.pageSize,
                        order: $location.$$search.o
                    })
                        .success(function (data) {
                        if (angular.isArray(data)) {
                            //  I have seen an intermittent problem where a page is requested twice
                            if (pagesLoaded === $scope.pagesLoaded) {
                                $scope.pagesLoaded++;
                                $scope.recordList = $scope.recordList.concat(data);
                            }
                            else {
                                console.log('DEBUG: infinite scroll component asked for a page twice');
                            }
                        }
                        else {
                            $scope.showError(data, 'Invalid query');
                        }
                    })
                        .error($scope.handleHttpError);
                },
                // TODO: Do we need model here?  Can we not infer it from scope?
                deleteRecord: function deleteRecord(model, id, $scope, ctrlState) {
                    SubmissionsService.deleteRecord(model, id)
                        .success(function () {
                        if (typeof $scope.dataEventFunctions.onAfterDelete === 'function') {
                            $scope.dataEventFunctions.onAfterDelete(ctrlState.master);
                        }
                        routingService.redirectTo()('list', $scope, $location);
                    });
                },
                updateDocument: function updateDocument(dataToSave, options, $scope, ctrlState) {
                    $scope.phase = 'updating';
                    SubmissionsService.updateRecord($scope.modelName, $scope.id, dataToSave)
                        .success(function (data) {
                        if (data.success !== false) {
                            if (typeof $scope.dataEventFunctions.onAfterUpdate === 'function') {
                                $scope.dataEventFunctions.onAfterUpdate(data, ctrlState.master);
                            }
                            if (options.redirect) {
                                if (options.allowChange) {
                                    ctrlState.allowLocationChange = true;
                                }
                                $window.location = options.redirect;
                            }
                            else {
                                processServerData(data, $scope, ctrlState);
                                $scope.setPristine(false);
                            }
                        }
                        else {
                            $scope.showError(data);
                        }
                    })
                        .error($scope.handleHttpError);
                },
                createNew: function createNew(dataToSave, options, $scope) {
                    SubmissionsService.createRecord($scope.modelName, dataToSave)
                        .success(function (data) {
                        if (data.success !== false) {
                            if (typeof $scope.dataEventFunctions.onAfterCreate === 'function') {
                                $scope.dataEventFunctions.onAfterCreate(data);
                            }
                            if (options.redirect) {
                                $window.location = options.redirect;
                            }
                            else {
                                routingService.redirectTo()('edit', $scope, $location, data._id);
                            }
                        }
                        else {
                            $scope.showError(data);
                        }
                    })
                        .error($scope.handleHttpError);
                },
                getListData: getListData,
                suffixCleanId: suffixCleanId,
                setData: setData,
                setUpSelectOptions: function setUpSelectOptions(lookupCollection, schemaElement, $scope, ctrlState, handleSchema) {
                    var optionsList = $scope[schemaElement.options] = [];
                    var idList = $scope[schemaElement.ids] = [];
                    SchemasService.getSchema(lookupCollection)
                        .success(function (data) {
                        var listInstructions = [];
                        handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false, $scope, ctrlState);
                        var dataRequest;
                        if (typeof schemaElement.filter !== 'undefined' && schemaElement.filter) {
                            console.log('filtering');
                            dataRequest = SubmissionsService.getPagedAndFilteredList(lookupCollection, schemaElement.filter);
                        }
                        else {
                            dataRequest = SubmissionsService.getAll(lookupCollection);
                        }
                        dataRequest
                            .success(function (data) {
                            if (data) {
                                for (var i = 0; i < data.length; i++) {
                                    var option = '';
                                    for (var j = 0; j < listInstructions.length; j++) {
                                        option += data[i][listInstructions[j].name] + ' ';
                                    }
                                    option = option.trim();
                                    var pos = _.sortedIndex(optionsList, option);
                                    // handle dupes (ideally people will use unique indexes to stop them but...)
                                    if (optionsList[pos] === option) {
                                        option = option + '    (' + data[i]._id + ')';
                                        pos = _.sortedIndex(optionsList, option);
                                    }
                                    optionsList.splice(pos, 0, option);
                                    idList.splice(pos, 0, data[i]._id);
                                }
                                updateRecordWithLookupValues(schemaElement, $scope, ctrlState);
                            }
                        });
                    });
                },
                preservePristine: preservePristine,
                // Reverse the process of convertToAngularModel
                convertToMongoModel: function convertToMongoModel(schema, anObject, prefixLength, $scope) {
                    function convertLookup(lookup, schemaElement) {
                        var retVal;
                        if ((schemaElement.select2 && schemaElement.select2.fngAjax) || ($scope.conversions[schemaElement.name] && $scope.conversions[schemaElement.name].fngajax)) {
                            if (lookup) {
                                retVal = lookup.id || lookup;
                            }
                        }
                        else if (lookup) {
                            retVal = lookup.text || (lookup.x ? lookup.x.text : lookup);
                        }
                        return retVal;
                    }
                    for (var i = 0; i < schema.length; i++) {
                        var fieldname = schema[i].name.slice(prefixLength);
                        var thisField = getListData(anObject, fieldname, $scope.select2List);
                        if (schema[i].schema) {
                            if (thisField) {
                                for (var j = 0; j < thisField.length; j++) {
                                    thisField[j] = convertToMongoModel(schema[i].schema, thisField[j], prefixLength + 1 + fieldname.length, $scope);
                                }
                            }
                        }
                        else {
                            // Convert {array:[{x:'item 1'}]} to {array:['item 1']}
                            if (schema[i].array && simpleArrayNeedsX(schema[i]) && thisField) {
                                for (var k = 0; k < thisField.length; k++) {
                                    thisField[k] = thisField[k].x;
                                }
                            }
                            // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
                            var idList = $scope[suffixCleanId(schema[i], '_ids')];
                            if (idList && idList.length > 0) {
                                updateObject(fieldname, anObject, function (value) {
                                    return convertToForeignKeys(schema[i], value, $scope[suffixCleanId(schema[i], 'Options')], idList);
                                });
                            }
                            else if ($scope.conversions[schema[i].name]) {
                                var lookup = getData(anObject, fieldname, null);
                                var newVal;
                                if (schema[i].array) {
                                    newVal = [];
                                    if (lookup) {
                                        for (var n = 0; n < lookup.length; n++) {
                                            newVal[n] = convertLookup(lookup[n], schema[i]);
                                        }
                                    }
                                }
                                else {
                                    newVal = convertLookup(lookup, schema[i]);
                                }
                                setData(anObject, fieldname, null, newVal);
                            }
                        }
                    }
                    return anObject;
                },
                convertIdToListValue: convertIdToListValue,
                handleError: handleError,
                decorateScope: function decorateScope($scope, $uibModal, recordHandlerInstance, ctrlState) {
                    $scope.handleHttpError = handleError($scope);
                    $scope.cancel = function () {
                        angular.copy(ctrlState.master, $scope.record);
                        $scope.$broadcast('fngCancel', $scope);
                        // Let call backs etc resolve in case they dirty form, then clean it
                        $timeout($scope.setPristine);
                    };
                    //listener for any child scopes to display messages
                    // pass like this:
                    //    scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
                    // or
                    //    scope.$broadcast('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
                    $scope.$on('showErrorMessage', function (event, args) {
                        $scope.showError(args.body, args.title);
                    });
                    $scope.showError = function (errString, alertTitle) {
                        $scope.alertTitle = alertTitle ? alertTitle : 'Error!';
                        $scope.errorMessage = errString;
                    };
                    $scope.dismissError = function () {
                        delete $scope.errorMessage;
                        delete $scope.alertTitle;
                    };
                    $scope.save = function (options) {
                        options = options || {};
                        //Convert the lookup values into ids
                        var dataToSave = recordHandlerInstance.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
                        if ($scope.id) {
                            if (typeof $scope.dataEventFunctions.onBeforeUpdate === 'function') {
                                $scope.dataEventFunctions.onBeforeUpdate(dataToSave, ctrlState.master, function (err) {
                                    if (err) {
                                        $scope.showError(err);
                                    }
                                    else {
                                        recordHandlerInstance.updateDocument(dataToSave, options, $scope, ctrlState);
                                    }
                                });
                            }
                            else {
                                recordHandlerInstance.updateDocument(dataToSave, options, $scope, ctrlState);
                            }
                        }
                        else {
                            if (typeof $scope.dataEventFunctions.onBeforeCreate === 'function') {
                                $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
                                    if (err) {
                                        $scope.showError(err);
                                    }
                                    else {
                                        recordHandlerInstance.createNew(dataToSave, options, $scope);
                                    }
                                });
                            }
                            else {
                                recordHandlerInstance.createNew(dataToSave, options, $scope);
                            }
                        }
                    };
                    $scope.newClick = function () {
                        routingService.redirectTo()('new', $scope, $location);
                    };
                    $scope.$on('$locationChangeStart', function (event, next) {
                        if (!ctrlState.allowLocationChange && !$scope.isCancelDisabled()) {
                            event.preventDefault();
                            var modalInstance = $uibModal.open({
                                template: '<div class="modal-header">' +
                                    '   <h3>Record modified</h3>' +
                                    '</div>' +
                                    '<div class="modal-body">' +
                                    '   <p>Would you like to save your changes?</p>' +
                                    '</div>' +
                                    '<div class="modal-footer">' +
                                    '    <button class="btn btn-primary dlg-yes" ng-click="yes()">Yes</button>' +
                                    '    <button class="btn btn-warning dlg-no" ng-click="no()">No</button>' +
                                    '    <button class="btn dlg-cancel" ng-click="cancel()">Cancel</button>' +
                                    '</div>',
                                controller: 'SaveChangesModalCtrl',
                                backdrop: 'static'
                            });
                            modalInstance.result.then(function (result) {
                                if (result) {
                                    $scope.save({ redirect: next, allowChange: true }); // save changes
                                }
                                else {
                                    ctrlState.allowLocationChange = true;
                                    $window.location = next;
                                }
                            });
                        }
                    });
                    $scope.deleteClick = function () {
                        if ($scope.record._id) {
                            var modalInstance = $uibModal.open({
                                template: '<div class="modal-header">' +
                                    '   <h3>Delete Item</h3>' +
                                    '</div>' +
                                    '<div class="modal-body">' +
                                    '   <p>Are you sure you want to delete this record?</p>' +
                                    '</div>' +
                                    '<div class="modal-footer">' +
                                    '    <button class="btn btn-primary dlg-no" ng-click="cancel()">No</button>' +
                                    '    <button class="btn btn-warning dlg-yes" ng-click="yes()">Yes</button>' +
                                    '</div>',
                                controller: 'SaveChangesModalCtrl',
                                backdrop: 'static'
                            });
                            modalInstance.result.then(function (result) {
                                if (result) {
                                    if (typeof $scope.dataEventFunctions.onBeforeDelete === 'function') {
                                        $scope.dataEventFunctions.onBeforeDelete(ctrlState.master, function (err) {
                                            if (err) {
                                                $scope.showError(err);
                                            }
                                            else {
                                                recordHandlerInstance.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
                                            }
                                        });
                                    }
                                    else {
                                        recordHandlerInstance.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
                                    }
                                }
                            });
                        }
                    };
                    $scope.isCancelDisabled = function () {
                        if (typeof $scope.disableFunctions.isCancelDisabled === 'function') {
                            return $scope.disableFunctions.isCancelDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
                        }
                        else {
                            return $scope[$scope.topLevelFormName] && $scope[$scope.topLevelFormName].$pristine;
                        }
                    };
                    $scope.isSaveDisabled = function () {
                        if (typeof $scope.disableFunctions.isSaveDisabled === 'function') {
                            return $scope.disableFunctions.isSaveDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
                        }
                        else {
                            return ($scope[$scope.topLevelFormName] && ($scope[$scope.topLevelFormName].$invalid || $scope[$scope.topLevelFormName].$pristine));
                        }
                    };
                    $scope.isDeleteDisabled = function () {
                        if (typeof $scope.disableFunctions.isDeleteDisabled === 'function') {
                            return $scope.disableFunctions.isDeleteDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
                        }
                        else {
                            return (!$scope.id);
                        }
                    };
                    $scope.isNewDisabled = function () {
                        if (typeof $scope.disableFunctions.isNewDisabled === 'function') {
                            return $scope.disableFunctions.isNewDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
                        }
                        else {
                            return false;
                        }
                    };
                    $scope.disabledText = function (localStyling) {
                        var text = '';
                        if ($scope.isSaveDisabled) {
                            text = 'This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. ' + localStyling;
                        }
                        return text;
                    };
                    $scope.getVal = function (expression, index) {
                        if (expression.indexOf('$index') === -1 || typeof index !== 'undefined') {
                            expression = expression.replace(/\$index/g, index);
                            return $scope.$eval('record.' + expression);
                        }
                        //else {
                        // Used to show error here, but angular seems to call before record is populated sometimes
                        //      throw new Error('Invalid expression in getVal(): ' + expression);
                        //}
                    };
                },
                fillFormFromBackendCustomSchema: fillFormFromBackendCustomSchema,
                fillFormWithBackendSchema: function fillFormWithBackendSchema($scope, formGeneratorInstance, recordHandlerInstance, ctrlState) {
                    SchemasService.getSchema($scope.modelName, $scope.formName)
                        .success(function (schema) {
                        fillFormFromBackendCustomSchema(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState);
                    })
                        .error($scope.handleHttpError);
                }
            };
        }
        services.recordHandler = recordHandler;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        SchemasService.$inject = ["$http"];
        function SchemasService($http) {
            return {
                getSchema: function (modelName, formName) {
                    return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), { cache: true });
                }
            };
        }
        services.SchemasService = SchemasService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        SubmissionsService.$inject = ["$http", "$cacheFactory"];
        function SubmissionsService($http, $cacheFactory) {
            /*
             generate a query string for a filtered and paginated query for submissions.
             options consists of the following:
             {
             aggregate - whether or not to aggregate results (http://docs.mongodb.org/manual/aggregation/)
             find - find parameter
             limit - limit results to this number of records
             skip - skip this number of records before returning results
             order - sort order
             }
             */
            var generateListQuery = function (options) {
                var queryString = '';
                var addParameter = function (param, value) {
                    if (value && value !== '' || typeof (value) == 'number') {
                        if (typeof value === 'object') {
                            value = JSON.stringify(value);
                        }
                        if (queryString === '') {
                            queryString = '?';
                        }
                        else {
                            queryString += '&';
                        }
                        queryString += param + '=' + value;
                    }
                };
                addParameter('l', options.limit);
                addParameter('f', options.find);
                addParameter('a', options.aggregate);
                addParameter('o', options.order);
                addParameter('s', options.skip);
                return queryString;
            };
            return {
                getListAttributes: function (ref, id) {
                    return $http.get('/api/' + ref + '/' + id + '/list');
                },
                readRecord: function (modelName, id) {
                    return $http.get('/api/' + modelName + '/' + id);
                },
                getAll: function (modelName, _options) {
                    var options = angular.extend({
                        cache: true
                    }, _options);
                    return $http.get('/api/' + modelName, options);
                },
                getPagedAndFilteredList: function (modelName, options) {
                    return $http.get('/api/' + modelName + generateListQuery(options));
                },
                deleteRecord: function (model, id) {
                    return $http.delete('/api/' + model + '/' + id);
                },
                updateRecord: function (modelName, id, dataToSave) {
                    $cacheFactory.get('$http').remove('/api/' + modelName);
                    return $http.post('/api/' + modelName + '/' + id, dataToSave);
                },
                createRecord: function (modelName, dataToSave) {
                    $cacheFactory.get('$http').remove('/api/' + modelName);
                    return $http.post('/api/' + modelName, dataToSave);
                }
            };
        }
        services.SubmissionsService = SubmissionsService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="controllers/base.ts" />
/// <reference path="controllers/saveChangesModal.ts" />
/// <reference path="controllers/model.ts" />
/// <reference path="controllers/nav.ts" />
/// <reference path="controllers/search-ctrl.ts" />
/// <reference path="directives/dropdown.ts" />
/// <reference path="directives/error-display.ts" />
/// <reference path="directives/fng-link.ts" />
/// <reference path="directives/form.ts" />
/// <reference path="directives/form-buttons.ts" />
/// <reference path="directives/search.ts" />
/// <reference path="filters/camelcase.ts" />
/// <reference path="filters/titlecase.ts" />
/// <reference path="services/add-all.ts" />
/// <reference path="services/css-framework.ts" />
/// <reference path="services/data.ts" />
/// <reference path="services/fng-routes.ts" />
/// <reference path="services/form-generator.ts" />
/// <reference path="services/form-markup-helper.ts" />
/// <reference path="services/input-size-helper.ts" />
/// <reference path="services/plugin-helper.ts" />
/// <reference path="services/record-handler.ts" />
/// <reference path="services/schemas.ts" />
/// <reference path="services/submissions.ts" />
var fng;
(function (fng) {
    fng.formsAngular = angular.module('formsAngular', [
        'ngSanitize',
        'ngMessages',
        'ui.bootstrap',
        'infinite-scroll',
        'monospaced.elastic'
    ])
        .controller('BaseCtrl', fng.controllers.BaseCtrl)
        .controller('SaveChangesModalCtrl', fng.controllers.SaveChangesModalCtrl)
        .controller('ModelCtrl', fng.controllers.ModelCtrl)
        .controller('NavCtrl', fng.controllers.NavCtrl)
        .directive('modelControllerDropdown', fng.directives.modelControllerDropdown)
        .directive('errorDisplay', fng.directives.errorDisplay)
        .directive('fngLink', fng.directives.fngLink)
        .directive('formInput', fng.directives.formInput)
        .directive('formButtons', fng.directives.formButtons)
        .directive('globalSearch', fng.directives.globalSearch)
        .filter('camelCase', fng.filters.camelCase)
        .filter('titleCase', fng.filters.titleCase)
        .service('addAllService', fng.services.addAllService)
        .provider('cssFrameworkService', fng.services.cssFrameworkService)
        .provider('routingService', fng.services.routingService)
        .factory('$data', fng.services.$data)
        .factory('formGenerator', fng.services.formGenerator)
        .factory('formMarkupHelper', fng.services.formMarkupHelper)
        .factory('inputSizeHelper', fng.services.inputSizeHelper)
        .factory('pluginHelper', fng.services.pluginHelper)
        .factory('recordHandler', fng.services.recordHandler)
        .factory('SchemasService', fng.services.SchemasService)
        .factory('SubmissionsService', fng.services.SubmissionsService);
})(fng || (fng = {}));
// expose the library
var formsAngular = fng.formsAngular;

var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i,s,l){var c=o,u={master:{},fngInvalidRequired:"fng-invalid-required",allowLocationChange:!0};angular.extend(e,i.parsePathFunc()(n.$$path)),e.modelNameDisplay=c.modelNameDisplay||r("titleCase")(e.modelName),t.$broadcast("fngFormLoadStart",e),s.decorateScope(e,s,l,c),l.decorateScope(e,a,l,u),l.fillFormWithBackendSchema(e,s,l,u);for(var d=0;d<c.modelControllers.length;d++)c.modelControllers[d].onBaseCtrlReady&&c.modelControllers[d].onBaseCtrlReady(e)}t.$inject=["$scope","$rootScope","$location","$filter","$uibModal","$data","routingService","formGenerator","recordHandler"],e.BaseCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){e.yes=function(){t.close(!0)},e.no=function(){t.close(!1)},e.cancel=function(){t.dismiss("cancel")}}t.$inject=["$scope","$uibModalInstance"],e.SaveChangesModalCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r){e.models=[],t.get("/api/models").success(function(t){e.models=t}).error(function(){n.path("/404")}),e.newUrl=function(e){return r.buildUrl(e+"/new")},e.listUrl=function(e){return r.buildUrl(e)}}t.$inject=["$scope","$http","$location","routingService"],e.ModelCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i){function s(n,r,o){var i,s={};n+="Ctrl",s.$scope=t.modelControllers[r]=e.$new();try{a(n,s),i=e.routing.newRecord?"creating":e.routing.id?"editing":"listing",angular.isObject(s.$scope.contextMenu)&&angular.forEach(s.$scope.contextMenu,function(t){t.divider?o=!0:t[i]&&(o&&(o=!1,e.items.push({divider:!0})),e.items.push(t))})}catch(l){/is not a function, got undefined/.test(l.message)||console.log("Unable to instantiate "+n+" - "+l.message)}}e.items=[],e.isCollapsed=!0,e.showShortcuts=!1,e.shortcuts=[{key:"?",act:"Show shortcuts"},{key:"/",act:"Jump to search"},{key:"Ctrl+Shift+S",act:"Save the current record"},{key:"Ctrl+Shift+Esc",act:"Cancel changes on the current record"},{key:"Ctrl+Shift+Ins",act:"Create a new record"},{key:"Ctrl+Shift+X",act:"Delete the current record"}],e.markupShortcut=function(e){return'<span class="key">'+e.split("+").join('</span> + <span class="key">')+"</span>"},e.globalShortcuts=function(t){function n(e){var n=document.getElementById(e);n&&(n.disabled||setTimeout(function(){n.click()}),t.preventDefault())}function r(e){var t=(e.target||e.srcElement).tagName;return!("INPUT"==t||"SELECT"==t||"TEXTAREA"==t)}if(191!==t.keyCode||!r(t)&&(t.altKey||t.metaKey))83===t.keyCode&&t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("saveButton"):27===t.keyCode&&(t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey||e.showShortcuts)?t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("cancelButton"):e.showShortcuts=!1:45===t.keyCode&&t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("newButton"):88===t.keyCode&&t.ctrlKey&&t.shiftKey&&t.altKey&&!t.metaKey&&n("deleteButton");else if(t.ctrlKey||!t.shiftKey){var a=document.getElementById("searchinput");a&&(a.focus(),t.preventDefault())}else e.showShortcuts=!0},e.css=function(e,t){var n;return n="function"==typeof i[e]?i[e](t):"error text-error"},e.$on("$locationChangeSuccess",function(){if(e.routing=o.parsePathFunc()(n.$$path),e.items=[],e.routing.analyse)e.contextMenu="Report",e.items=[{broadcast:"exportToPDF",text:"PDF"},{broadcast:"exportToCSV",text:"CSV"}];else if(e.routing.modelName){angular.forEach(t.modelControllers,function(e){e.$destroy()}),t.modelControllers=[],t.record={},t.disableFunctions={},t.dataEventFunctions={},delete t.dropDownDisplay,delete t.modelNameDisplay;var a=r("titleCase")(e.routing.modelName,!0),i=!1;s(a,0,i),e.routing.formName&&s(a+r("titleCase")(e.routing.formName,!0),1,i),e.contextMenu=t.dropDownDisplay||t.modelNameDisplay||r("titleCase")(e.routing.modelName,!1)}}),e.doClick=function(t,n){var r=angular.element(n.target),a=e.items[t];if(a.divider||r.parent().hasClass("disabled"))n.preventDefault();else if(a.broadcast)e.$broadcast(a.broadcast);else{var o=a.args||[],i=a.fn;switch(o.length){case 0:i();break;case 1:i(o[0]);break;case 2:i(o[0],o[1]);break;case 3:i(o[0],o[1],o[2]);break;case 4:i(o[0],o[1],o[2],o[3])}}},e.isHidden=function(t){return e.items[t].isHidden?e.items[t].isHidden():!1},e.isDisabled=function(t){return e.items[t].isDisabled?e.items[t].isDisabled():!1},e.buildUrl=function(e){return o.buildUrl(e)},e.dropdownClass=function(t){var n=e.items[t],r="";return n.divider?r="divider":e.isDisabled(t)&&(r="disabled"),r}}t.$inject=["$scope","$data","$location","$filter","$controller","routingService","cssFrameworkService"],e.NavCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r){var a,o="";a=function(){var e=!1;return function(t){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4)))&&(e=!0)}(navigator.userAgent||navigator.vendor||window.opera),!e}(),e.searchPlaceholder=a?"Ctrl + / to Search":"Search",e.handleKey=function(t){if(27===t.keyCode&&e.searchTarget&&e.searchTarget.length>0)e.searchTarget="";else if(e.results.length>0)switch(t.keyCode){case 38:e.focus>0&&e.setFocus(e.focus-1),"function"==typeof t.preventDefault&&t.preventDefault();break;case 40:e.results.length>e.focus+1&&e.setFocus(e.focus+1),"function"==typeof t.preventDefault&&t.preventDefault();break;case 13:null!=e.focus&&e.selectResult(e.focus)}},e.setFocus=function(t){null!==e.focus&&delete e.results[e.focus].focussed,e.results[t].focussed=!0,e.focus=t},e.selectResult=function(t){var a=e.results[t],o=r.prefix()+"/"+a.resource+"/"+a.id+"/edit";a.resourceTab&&(o+="/"+a.resourceTab),n.url(o)},e.resultClass=function(t){var n="search-result";return e.results&&e.results[t].focussed&&(n+=" focus"),n};var i=function(){e.moreCount=0,e.errorClass="",e.results=[],e.focus=null};e.$watch("searchTarget",function(n){n&&n.length>0?(o=n,t.get("/api/search?q="+n).success(function(t){o===n&&(e.searchTarget.length>0?(e.results=t.results,e.moreCount=t.moreCount,t.results.length>0&&(e.errorClass="",e.setFocus(0)),e.errorClass=0===e.results.length?"error has-error":""):i())}).error(function(e,t){console.log("Error in searchbox.js : "+e+" (status="+t+")")})):i()},!0),e.$on("$routeChangeStart",function(){e.searchTarget=""})}t.$inject=["$scope","$http","$location","routingService"],e.SearchCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return{restrict:"AE",replace:!0,template:'<li ng-show="items.length > 0" class="mcdd" uib-dropdown> <a uib-dropdown-toggle>  {{contextMenu}} <b class="caret"></b> </a> <ul class="uib-dropdown-menu dropdown-menu">  <li ng-repeat="choice in items" ng-hide="isHidden($index)" ng-class="dropdownClass($index)">   <a ng-show="choice.text" class="dropdown-option" ng-href="{{choice.url}}" ng-click="doClick($index, $event)">    {{choice.text}}   </a>  </li> </ul></li>'}}e.modelControllerDropdown=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return{restrict:"E",template:'<div id="display-error" ng-show="errorMessage" ng-class="css(\'rowFluid\')">  <div class="alert alert-error col-lg-offset-3 offset3 col-lg-6 col-xs-12 span6 alert-warning alert-dismissable">    <button type="button" class="close" ng-click="dismissError()">×</button>    <h4>{{alertTitle}}</h4>    <div ng-bind-html="errorMessage"></div>  </div></div>'}}e.errorDisplay=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){return{restrict:"E",scope:{dataSrc:"&model"},link:function(n,r,a){var o=a.ref,i=a.form;n.readonly=a.readonly,i=i?i+"/":"",a.text&&a.text.length>0&&(n.text=a.text);var s=n.$parent.$index;n.$watch("dataSrc()",function(r){r&&("undefined"!=typeof s&&angular.isArray(r)&&(r=r[s]),n.link=e.buildUrl(o+"/"+i+r+"/edit"),n.text||t.getListAttributes(o,r).success(function(e){e.success===!1?n.text=e.err:n.text=e.list}).error(function(e,t){n.text="Error "+e+": "+t}))},!0)},template:function(e,t){return t.readonly?'<span class="fng-link">{{text}}</span>':'<a href="{{ link }}" class="fng-link">{{text}}</a>'}}}t.$inject=["routingService","SubmissionsService"],e.fngLink=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,r,a,o,i,s,l){return{restrict:"EA",link:function(c,u,d){var f=[],m=n.N,p=function(e,t,n,r,a){function o(){var t;if(angular.isArray(c[e.options]))t={repeat:e.options,value:"option"};else{if(!c[e.options]||!angular.isArray(c[e.options].values))throw new Error("Invalid enumeration setup in field "+e.name);t=angular.isArray(c[e.options].labels)?{repeat:e.options+".values",value:e.options+".values[$index]",label:e.options+".labels[$index]"}:{repeat:e.options+".values",value:e.options+".values[$index]"}}return t}var s;if(!t){var u=(a.model||"record")+".";if(t=u,a.subschema&&-1!==e.name.indexOf(".")){var d=e.name,f=a.subschemaroot,m=d.slice(f.length+1);a.index?(t+=f+"["+a.index+"]."+m,r="f_"+t.slice(u.length).replace(/(\.|\[|\]\.)/g,"-")):(t+=f,a.subkey?(r=t.slice(u.length).replace(/\./g,"-")+"-subkey"+a.subkeyno+"-"+m,t+="[$_arrayOffset_"+f.replace(/\./g,"_")+"_"+a.subkeyno+"]."+m):(t+="[$index]."+m,r=null,s=d.replace(/\./g,"-")))}else t+=e.name}var p,v,g=l.allInputsVars(c,e,a,t,r,s),h=g.common,b=n||e.required?" required":"";switch(e.type){case"select":e.select2?(h+='class="fng-select2'+g.formControl+g.compactClass+g.sizeClassBS2+'"',h+=e.readonly?" readonly":"",h+=e.required?' ng-required="true"':"",h+=e.add?" "+e.add+" ":"",e.select2.fngAjax?"bs2"===i.framework()?(p='<div class="input-append">',p+='<input ui-select2="'+e.select2.fngAjax+'" '+h+">",p+='<button class="btn" type="button" data-select2-open="'+r+'" ng-click="openSelect2($event)"><i class="icon-search"></i></button>',p+="</div>"):(p='<div class="input-group">',p+='<input ui-select2="'+e.select2.fngAjax+'" '+h+">",p+='<span class="input-group-addon'+g.compactClass+'" data-select2-open="'+r+'" ',p+='    ng-click="openSelect2($event)"><i class="glyphicon glyphicon-search"></i></span>',p+="</div>"):e.select2&&(p='<input ui-select2="'+e.select2.s2query+'" '+h+">")):(h+=e.readonly?"disabled ":"",h+=e.add?" "+e.add+" ":"",p="<select "+h+'class="'+g.formControl.trim()+g.compactClass+g.sizeClassBS2+'" '+b+">",n||(p+="<option></option>"),angular.isArray(e.options)?angular.forEach(e.options,function(e){p+=_.isObject(e)?'<option value="'+(e.val||e.id)+'">'+(e.label||e.text)+"</option>":"<option>"+e+"</option>"}):(v=o(),p+='<option ng-repeat="option in '+v.repeat+'"',p+=v.label?' value="{{'+v.value+'}}"> {{ '+v.label+" }} </option> ":">{{"+v.value+"}}</option> "),p+="</select>");break;case"link":p='<fng-link model="'+t+'" ref="'+e.ref+'"',e.form&&(p+=' form="'+e.form+'"'),e.linkText&&(p+=' text="'+e.linkText+'"'),e.readonly&&(p+=' readonly="true"'),p+="></fng-link>";break;case"radio":p="",h+=b+(e.readonly?" disabled ":" ");var y="vertical"===a.formstyle||"inline"!==a.formstyle&&!e.inlineRadio;if(angular.isArray(e.options))a.subschema&&(h=h.replace('name="','name="{{$index}}-')),angular.forEach(e.options,function(e){p+="<input "+h+'type="radio"',p+=' value="'+e+'">'+e,y&&(p+="<br />")});else{var w=y?"div":"span";a.subschema&&(h=h.replace("$index","$parent.$index").replace('name="','name="{{$parent.$index}}-')),v=o(),p+="<"+w+' ng-repeat="option in '+v.repeat+'"><input '+h+' type="radio" value="{{'+v.value+'}}"> {{',p+=v.label||v.value,p+=" }} </"+w+"> "}break;case"checkbox":h+=b+(e.readonly?" disabled ":" "),p="bs3"===i.framework()?'<div class="checkbox"><input '+h+'type="checkbox"></div>':l.generateSimpleInput(h,e,a);break;default:h+=l.addTextInputMarkup(g,e,b),"textarea"===e.type?(e.rows&&(h+="auto"===e.rows?'msd-elastic="\n" class="ng-animate" ':'rows = "'+e.rows+'" '),"ckEditor"===e.editor&&(h+='ckeditor = "" ',"bs3"===i.framework()&&(g.sizeClassBS3="col-xs-12")),p="<textarea "+h+" />"):p=l.generateSimpleInput(h,e,a)}return l.inputChrome(p,e,a,g)},v=function(e){var t;switch(e){case"horizontal":t="form-horizontal";break;case"vertical":t="";break;case"inline":t="form-inline";break;case"horizontalCompact":t="form-horizontal compact";break;default:t="form-horizontal compact"}return t},g=function(e){var t={before:"",after:""};if("function"==typeof e.containerType)t=e.containerType(e);else switch(e.containerType){case"tab":for(var n=-1,r=0;r<c.tabs.length;r++)if(c.tabs[r].title===e.title){n=r;break}n>=0?(t.before="<uib-tab select=\"updateQueryForTab('"+e.title+'\')" heading="'+e.title+'"',n>0&&(t.before+='active="tabs['+n+'].active"'),t.before+=">",t.after="</uib-tab>"):(t.before="<p>Error!  Tab "+e.title+" not found in tab list</p>",t.after="");break;case"tabset":t.before="<uib-tabset>",t.after="</uib-tabset>";break;case"well":t.before='<div class="well">',e.title&&(t.before+="<h4>"+e.title+"</h4>"),t.after="</div>";break;case"well-large":t.before='<div class="well well-lg well-large">',t.after="</div>";break;case"well-small":t.before='<div class="well well-sm well-small">',t.after="</div>";break;case"fieldset":t.before="<fieldset>",e.title&&(t.before+="<legend>"+e.title+"</legend>"),t.after="</fieldset>";break;case void 0:break;case null:break;case"":break;default:if(t.before='<div class="'+e.containerType+'">',e.title){var a=e.titleTagOrClass||"h4";a.match(/h[1-6]/)?t.before+="<"+a+">"+e.title+"</"+a+">":t.before+='<p class="'+a+'">'+e.title+"</p>"}t.after="</div>"}return t},h=function(e,t){var n=l.fieldChrome(c,e,t),r=n.template;if(e.schema){var a=e.name.replace(/\./g,"_"),o="$_schema_"+a;if(c[o]=e.schema,e.schema)if(e.subkey){e.subkey.path=e.name,c[o+"_subkey"]=e.subkey;for(var s=angular.isArray(e.subkey)?e.subkey:[e.subkey],u=0;u<s.length;u++){var d=g(s[u]);r+=d.before,r+=y(e.schema,null,{subschema:"true",formstyle:t.formstyle,subkey:o+"_subkey",subkeyno:u,subschemaroot:e.name}),r+=d.after}f.push(e)}else t.subschema?console.log("Attempts at supporting deep nesting have been removed - will hopefully be re-introduced at a later date"):(r+='<div class="schema-head">'+e.label,e.unshift&&(r+='<button id="unshift_'+e.id+'_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="unshift(\''+e.name+'\',$event)"><i class="'+l.glyphClass()+'-plus"></i> Add</button>'),r+='</div><div ng-form class="'+("bs2"===i.framework()?"row-fluid ":"")+v(e.formStyle)+'" name="form_'+a+'{{$index}}" class="sub-doc well" id="'+e.id+'List_{{$index}}"  ng-repeat="subDoc in '+(t.model||"record")+"."+e.name+' track by $index">   <div class="'+("bs2"===i.framework()?"row-fluid":"row")+' sub-doc">',(!e.noRemove||e.customSubDoc)&&(r+='   <div class="sub-doc-btns">',e.customSubDoc&&(r+=e.customSubDoc),e.noRemove||(r+='<button name="remove_'+e.id+'_btn" class="remove-btn btn btn-mini btn-default btn-xs form-btn" ng-click="remove(\''+e.name+'\',$index,$event)"><i class="'+l.glyphClass()+'-minus"></i> Remove</button>'),r+="  </div> "),r+=y(e.schema,!1,{subschema:"true",formstyle:e.formStyle,model:t.model,subschemaroot:e.name}),r+="   </div></div>",(!e.noAdd||e.customFooter)&&(r+='<div class = "schema-foot">',e.customFooter&&(r+=e.customFooter),e.noAdd||(r+='<button id="add_'+e.id+'_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="add(\''+e.name+'\',$event)"><i class="'+l.glyphClass()+'-plus"></i> Add</button>'),r+="</div>"))}else{var m=l.controlDivClasses(t);if(e.array){if(m.push("fng-array"),"inline"===t.formstyle)throw new Error("Cannot use arrays in an inline form");r+=l.label(c,e,"link"!==e.type,t),r+=l.handleArrayInputAndControlDiv(p(e,"link"===e.type?null:"arrayItem.x",!0,e.id+"_{{$index}}",t),m,e,t)}else r+=l.label(c,e,null,t),t.required&&console.log("*********  Options required - found it ********"),r+=l.handleInputAndControlDiv(p(e,null,t.required,e.id,t),m)}return r+=n.closeTag},b=function(e){e.type=e.type||"text",e.id?("number"==typeof e.id||e.id[0]>=0&&e.id<="9")&&(e.id="_"+e.id):e.id="f_"+e.name.replace(/\./g,"_"),e.label=void 0!==e.label?null===e.label?"":e.label:r("titleCase")(e.name.split(".").slice(-1)[0])},y=function(e,t,a){var o="";if(e)for(var i=0;i<e.length;i++){var s=e[i];0===i&&t&&!a.schema.match(/$_schema_/)&&"object"!=typeof s.add&&(s.add=s.add?" "+s.add+" ":"",-1!==s.add.indexOf("ui-date")||a.noautofocus||s.containerType||(s.add=s.add+"autofocus "));var l=!0;if(s.directive){var d=s.directive,f="<"+d+' model="'+(a.model||"record")+'"',p=u[0];b(s);for(var v=0;v<p.attributes.length;v++){var w=p.attributes[v];switch(w.nodeName){case"class":var k=w.value.replace("ng-scope","");k.length>0&&(f+=' class="'+k+'"');break;case"schema":var x=("bespoke_"+s.name).replace(/\./g,"_");c[x]=angular.copy(s),delete c[x].directive,f+=' schema="'+x+'"';break;default:f+=" "+w.nodeName+'="'+w.value+'"'}}f+=" ";var C=r("camelCase")(s.directive);for(var $ in s)if(s.hasOwnProperty($))switch($){case"directive":break;case"schema":break;case"add":switch(typeof s.add){case"string":f+=" "+s.add;break;case"object":for(var S in s.add)f+=" "+S+'="'+s.add[S].toString().replace(/"/g,"&quot;")+'"';break;default:throw new Error("Invalid add property of type "+typeof s.add+" in directive "+s.name)}break;case C:for(var D in s[$])f+=s.directive+"-"+D+'="'+s[$][D]+'"';break;default:f+=" fng-fld-"+$+'="'+s[$].toString().replace(/"/g,"&quot;")+'"'}for($ in a)a.hasOwnProperty($)&&"$"!==$[0]&&"undefined"!=typeof a[$]&&(f+=" fng-opt-"+$+'="'+a[$].toString().replace(/"/g,"&quot;")+'"');f+='ng-model="'+s.name+'"></'+d+">",o+=f,l=!1}else if(s.containerType){var F=g(s);switch(s.containerType){case"tab":m===n.N&&(m=n.Forced,o+="<uib-tabset>"),o+=F.before,o+=y(s.content,null,a),o+=F.after;break;case"tabset":m=n.Y,o+=F.before,o+=y(s.content,null,a),o+=F.after;break;default:o+=F.before,o+=y(s.content,null,a),o+=F.after}l=!1}else if(a.subkey){var E=angular.isArray(c[a.subkey])?c[a.subkey][0].keyList:c[a.subkey].keyList;_.find(E,function(e,t){return c[a.subkey].path+"."+t===s.name})&&(l=!1)}l&&(b(s),o+=h(s,a))}else console.log("Empty array passed to processInstructions"),o="";return o},w=c.$watch(d.schema,function(r){if(r&&(r=angular.isArray(r)?r:[r],r.length>0)){w();var i="",l=d.model||"record",p=c[l];if(p=p||{},!d.subschema&&!d.model||d.forceform){c.topLevelFormName=d.name||"myForm";var g="";for(var h in d)d.hasOwnProperty(h)&&"$"!==h[0]&&-1===["name","formstyle","schema","subschema","model"].indexOf(h)&&(g+=" "+d.$attr[h]+'="'+d[h]+'"');i='<form name="'+c.topLevelFormName+'" class="'+v(d.formstyle)+' novalidate"'+g+">"}else i="";if(p===c.topLevelFormName)throw new Error("Model and Name must be distinct - they are both "+p);if(i+=y(r,!0,d),m===n.Forced&&(i+="</uib-tabset>"),i+=d.subschema?"":"</form>",u.replaceWith(e(i)(c)),f.length>0||a.modelControllers.length>0)var b=c.$watch("phase",function(e){if("ready"===e){b();for(var t=0;t<a.modelControllers.length;t++)a.modelControllers[t].onAllReady&&a.modelControllers[t].onAllReady(c);for(var n=0;n<f.length;n++){for(var r,i,s=f[n],l=angular.isArray(s.subkey)?s.subkey:[s.subkey],u=s.name.split("."),d=p;u.length>1;)d=d[u.shift()]||{};d=d[u[0]]=d[u[0]]||[];for(var m=0;m<l.length;m++){if(l[m].selectFunc){if(!c[l[m].selectFunc]||"function"!=typeof c[l[m].selectFunc])throw new Error("Subkey function "+l[m].selectFunc+" is not properly set up");r=c[l[m].selectFunc](p,s)}else{if(!l[m].keyList)throw new Error("Invalid subkey setup for "+s.name);var v=l[m].keyList;for(r=0;r<d.length;r++){i=!0;for(var g in v)if(v.hasOwnProperty(g)&&d[r][g]!==v[g]&&("undefined"==typeof d[r][g]||!d[r][g].text||d[r][g].text!==v[g])){i=!1;break}if(i)break}if(!i)switch(l[m].onNotFound){case"error":var h="Cannot find matching "+(l[m].title||l[m].path);o(function(){c.showError(h,"Unable to set up form correctly")}),r=-1;break;case"create":default:r=p[s.name].push(v)-1}}c["$_arrayOffset_"+s.name.replace(/\./g,"_")+"_"+m]=r}}}});t.$broadcast("formInputDone"),s.updateDataDependentDisplay&&p&&Object.keys(p).length>0&&s.updateDataDependentDisplay(p,null,!0,c)}},!0)}}}t.$inject=["$compile","$rootScope","$filter","$data","$timeout","cssFrameworkService","formGenerator","formMarkupHelper"];var n;!function(e){e[e.Y=0]="Y",e[e.N=1]="N",e[e.Forced=2]="Forced"}(n||(n={})),e.formInput=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{restrict:"A",templateUrl:"form-button-"+e.framework()+".html"}}t.$inject=["cssFrameworkService"],e.formButtons=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(t){function n(t){return{restrict:"AE",templateUrl:"search-"+t.framework()+".html",controller:e.controllers.SearchCtrl}}n.$inject=["cssFrameworkService"],t.globalSearch=n}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return function(e){var t=/([\:\-\_]+(.))/g;return e.replace(t,function(e,t,n,r){return r?n.toUpperCase():n})}}e.camelCase=t}(t=e.filters||(e.filters={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return function(e,t){return e&&(e=e.replace(/(_|\.)/g," ").replace(/[A-Z]/g," $&").trim().replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()}),e=t?e.replace(/\s/g,""):e.replace(/\s{2,}/g," ")),e}}e.titleCase=t}(t=e.filters||(e.filters={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){function e(e,t,n,r){function a(e){for(var t in e)t===n&&l.push(e[t]),"$parent"===t&&a(e[t])}var o,i,s,l=[],c=[];if(n="addAll"+n,"string"==typeof r)for(o=r.split(" "),i=0;i<o.length;i++)c.push(o[i]);if(a(e),void 0!==t[n]&&"string"==typeof t[n])for(o=t[n].split(" "),i=0;i<o.length;i++)0===o[i].indexOf("class=")?c.push(o[i].substring(6,o[i].length)):l.push(o[i]);return r=c.length>0?' class="'+c.join(" ")+'" ':" ",s=l.length>0?l.join(" ")+" ":"",r+s}this.getAddAllGroupOptions=function(t,n,r){return e(t,n,"Group",r)},this.getAddAllFieldOptions=function(t,n,r){return e(t,n,"Field",r)},this.getAddAllLabelOptions=function(t,n,r){return e(t,n,"Label",r)},this.addAll=function(e,t,n,r){var a="getAddAll"+t+"Options";return this[a](e,r,n)||[]}}e.addAllService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e={framework:"bs2"};return{setOptions:function(t){angular.extend(e,t)},$get:function(){return{framework:function(){return e.framework},setFrameworkForDemoWebsite:function(t){e.framework=t},span:function(t){var n;switch(e.framework){case"bs2":n="span"+t;break;case"bs3":n="col-xs-"+t}return n},offset:function(t){var n;switch(e.framework){case"bs2":n="offset"+t;break;case"bs3":n="col-lg-offset-"+t}return n},rowFluid:function(){var t;switch(e.framework){case"bs2":t="row-fluid";break;case"bs3":t="row"}return t}}}}}e.cssFrameworkService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e={record:{},disableFunctions:{},dataEventFunctions:{},modelControllers:[]};return e}e.$data=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){function n(e,t,n){void 0===t&&(t=""),t=t||"",angular.forEach(e,function(e){o.when(t+e.route,angular.extend(e.options||{templateUrl:e.templateUrl},n))}),s.variantsForDemoWebsite&&angular.forEach(s.variantsForDemoWebsite,function(r){angular.forEach(e,function(e){o.when(t+r+e.route,angular.extend(e.options||{templateUrl:e.templateUrl},n))})})}function r(e,t,n){void 0===t&&(t=""),t=t||"",angular.forEach(e,function(e){i.state(e.state,angular.extend(e.options||{url:t+e.route,templateUrl:e.templateUrl},n))})}function a(e,t,n,r,a,o){var i,s=r?"/"+r:"",l=e+"/"+n,c=o?"/"+o:"";switch(t){case"list":i=l+s;break;case"edit":i=l+s+"/"+a+"/edit"+c;break;case"new":i=l+s+"/new"+c}return i}var o,i,s={hashPrefix:"",html5Mode:!1,routing:"ngroute",prefix:""},l=[{route:"/analyse/:model/:reportSchemaName",state:"analyse::model::report",templateUrl:"partials/base-analysis.html"},{route:"/analyse/:model",state:"analyse::model",templateUrl:"partials/base-analysis.html"},{route:"/:model/:id/edit",state:"model::edit",templateUrl:"partials/base-edit.html"},{route:"/:model/:id/edit/:tab",state:"model::edit::tab",templateUrl:"partials/base-edit.html"},{route:"/:model/new",state:"model::new",templateUrl:"partials/base-edit.html"},{route:"/:model",state:"model::list",templateUrl:"partials/base-list.html"},{route:"/:model/:form/:id/edit",state:"model::form::edit",templateUrl:"partials/base-edit.html"},{route:"/:model/:form/:id/edit/:tab",state:"model::form::edit::tab",templateUrl:"partials/base-edit.html"},{route:"/:model/:form/new",state:"model::form::new",templateUrl:"partials/base-edit.html"},{route:"/:model/:form",state:"model::form::list",templateUrl:"partials/base-list.html"}],c=null,u={};return{start:function(a){switch(angular.extend(s,a),s.prefix[0]&&"/"!==s.prefix[0]&&(s.prefix="/"+s.prefix),t.html5Mode(s.html5Mode),""!==s.hashPrefix&&t.hashPrefix(s.hashPrefix),s.routing){case"ngroute":o=e.get("$routeProvider"),s.fixedRoutes&&n(s.fixedRoutes),n(l,s.prefix,a.add2fngRoutes);break;case"uirouter":i=e.get("$stateProvider"),s.fixedRoutes&&r(s.fixedRoutes),setTimeout(function(){r(l,s.prefix,a.add2fngRoutes)})}},$get:function(){return{router:function(){return s.routing},prefix:function(){return s.prefix},parsePathFunc:function(){return function(e){if(e!==c){c=e,u={newRecord:!1},s.prefix.length>0&&0===e.indexOf(s.prefix)&&(e=e.slice(s.prefix.length));var t=e.split("/");s.variants&&-1!==s.variants.indexOf(t[1])&&(u.variant=t[1],t.shift());var n=t.length;if("analyse"===t[1])u.analyse=!0,u.modelName=t[2],u.reportSchemaName=n>=4?t[3]:null;else{u.modelName=t[1];var r,a=[t[n-1],t[n-2]],o=a.indexOf("new");-1===o?(r=a.indexOf("edit"),-1!==r&&(n-=2+r,u.id=t[n])):(u.newRecord=!0,n-=1+o),(1===r||1===o)&&(u.tab=a[0]),n>2&&(u.formName=t[2])}}return u}},buildUrl:function(e){var t=s.html5Mode?"":"#";return t+=s.hashPrefix,t+=s.prefix,t[0]&&(t+="/"),t+="/"===e[0]?e.slice(1):e},buildOperationUrl:function(e,t,n,r,o){return a(s.prefix,e,t,n,r,o)},redirectTo:function(){return function(e,t,n,r,o){n.search()&&n.url(n.path());var i=a(s.prefix,e,t.modelName,t.formName,r,o);n.path(i)}}}}}}t.$inject=["$injector","$locationProvider"],e.routingService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o){function i(e,t,n,r,a,o,l,c){function m(e,t){var n=angular.copy(e),r=_.find(l.tabs,function(e){return e.title===n});if(!r){if(0===l.tabs.length&&l.formSchema.length>0){l.tabs.push({title:"Main",content:[],active:"Main"===l.tab||!l.tab}),r=l.tabs[0];for(var a=0;a<l.formSchema.length;a++)r.content.push(l.formSchema[a])}r=l.tabs[l.tabs.push({title:n,containerType:"tab",content:[],active:n===l.tab})-1]}r.content.push(t)}for(var v in t)if("_id"!==v&&t.hasOwnProperty(v)){var g=t[v],h=g.options||{},b=h.form||{};if(g.schema&&!b.hidden){if(o&&n){var y=[];i("Nested "+v,g.schema,y,null,v+".",!0,l,c);var w=u(v,b,a);w.schema=y,b.tab&&m(b.tab,w),void 0!==b.order?n.splice(b.order,0,w):n.push(w)}}else{if(n&&!b.hidden){var k=u(v,b,a);if(p(k.showIf,k.name,l)&&"options"!==v){var x=s(k,g,h,l,c);x.tab&&m(x.tab,x),void 0!==b.order?n.splice(b.order,0,x):n.push(x)}}r&&h.list&&d(r,h.list,v)}}r&&0===r.length&&f(e,r,n,t)}function s(a,s,c,u,d){var f;if(s.caster&&(a.array=!0,s=s.caster,angular.extend(c,s.options),s.options&&s.options.form&&angular.extend(a,s.options.form)),"String"===s.instance)c["enum"]?(a.type=a.type||"select",a.select2?(u.conversions[a.name]=a.select2,c.required&&(u.$watch("record."+a.name,function(e){l(e,a.id,a.select2,d)},!0),setTimeout(function(){l(u.record[a.name],a.id,a.select2,d)},0)),a.select2===!0&&(a.select2={}),a.select2.s2query="select2"+a.name.replace(/\./g,"_"),u[a.select2.s2query]={allowClear:!c.required,initSelection:function(e,n){function r(){function i(t,n,r){if(n)if(0===t.length)r(n);else{if(angular.isArray(n)){var a=e.context.getAttribute("ng-model"),o=a.indexOf("."+t[0]);a=a.slice(0,o),o=a.lastIndexOf("."),a=a.slice(o+1),a=/.+\[(.+)\]/.exec(a),n=n[u[a[1]]]}n=n[t.shift()],i(t,n,r)}}var s=u.record;if(s){var c=a.name.split(".");i(c,s,function(t){if(setTimeout(l(t,a.id,a.select2,d)),t)if(a.array){var r=parseInt(e.context.id.match("_[0-9].*$")[0].slice(1));t[r].x&&o.preservePristine(e,function(){n(t[r].x)})}else o.preservePristine(e,function(){n(t)})})}else t(r)}t(r)},query:function(e){for(var t={results:[]},n=e.term.toUpperCase(),r=0;r<c["enum"].length;r++)-1!==c["enum"][r].toUpperCase().indexOf(n)&&t.results.push({id:r,text:c["enum"][r]});e.callback(t)}},_.extend(u[a.select2.s2query],a.select2),a.select2===!0&&(a.select2={}),u.select2List.push(a.name)):(a.options=o.suffixCleanId(a,"Options"),u[a.options]=c["enum"])):(a.type||(a.type=-1!==a.name.toLowerCase().indexOf("password")?"password":"text"),c.match&&(a.add='pattern="'+c.match+'" '+(a.add||"")));else if("ObjectID"===s.instance)a.ref=c.ref,a.link&&a.link.linkOnly?(a.type="link",a.linkText=a.link.text,a.form=a.link.form,delete a.link):(a.type="select",a.select2||c.form&&c.form.select2?(a.select2||(a.select2=c.form.select2),a.select2===!0&&(a.select2={}),u.select2List.push(a.name),u.conversions[a.name]=a.select2,a.select2.fngAjax?(f="ajax"+a.name.replace(/\./g,""),c.required||a.placeHolder||(a.placeHolder="Select..."),u[f]={allowClear:!c.required,minimumInputLength:2,initSelection:function(t,n){var a=t.val();a&&""!==a&&r.getListAttributes(c.ref,a).success(function(r){r.success===!1&&e.path("/404");var i={id:a,text:r.list};o.preservePristine(t,function(){n(i)})}).error(u.handleHttpError)},ajax:{url:"/api/search/"+c.ref,data:function(e,t){var n,r={q:e,pageLimit:10,page:t};return"object"==typeof c.form.searchQuery?n=c.form.searchQuery:"function"==typeof c.form.searchQuery&&(n=c.form.searchQuery(u,c)),n&&_.extend(r,n),r},results:function(e){return{results:e.results,more:e.moreCount>0}}}},_.extend(u[f],a.select2),a.select2.fngAjax=f):(a.select2===!0&&(a.select2={}),a.select2.s2query="select2"+a.name.replace(/\./g,"_"),u["select2"+a.select2.s2query]={allowClear:!c.required,initSelection:function(e,t){var n=e.val();if(""!==n&&u[a.ids].length>0){var r=o.convertIdToListValue(n,u[a.ids],u[a.options],a.name),i={
id:n,text:r};t(i)}},query:function(e){for(var t={results:[]},n=e.term.toUpperCase(),r=0;r<u[a.options].length;r++)-1!==u[a.options][r].toUpperCase().indexOf(n)&&t.results.push({id:u[a.ids][r],text:u[a.options][r]});e.callback(t)}},_.extend(u[a.select2.s2query],a.select2),a.options=o.suffixCleanId(a,"Options"),a.ids=o.suffixCleanId(a,"_ids"),o.setUpSelectOptions(c.ref,a,u,d,i))):a.directive&&a[n("camelCase")(a.directive)]&&a[n("camelCase")(a.directive)].fngAjax||(a.options=o.suffixCleanId(a,"Options"),a.ids=o.suffixCleanId(a,"_ids"),o.setUpSelectOptions(c.ref,a,u,d,i)));else if("Date"===s.instance)a.type||(a.readonly?a.type="text":(a.type="text",a.add="ui-date ui-date-format datepicker-popup-fix "));else if("boolean"===s.instance.toLowerCase())a.type="checkbox";else{if("Number"!==s.instance)throw new Error("Field "+a.name+" is of unsupported type "+s.instance);a.type="number",c.min&&(a.add='min="'+c.min+'" '+(a.add||"")),c.max&&(a.add='max="'+c.max+'" '+(a.add||"")),a.step&&(a.add='step="'+a.step+'" '+(a.add||""))}return c.required&&(a.required=!0),c.readonly&&(a.readonly=!0),a}function l(e,t,n,r){var a="#"+(n?"cg_":"")+t,o=angular.element(document.querySelector(a));e?o.removeClass(r.fngInvalidRequired):o.addClass(r.fngInvalidRequired)}function c(e,t){for(var n=e.split("."),r=t.record,a=0,o=n.length;o>a;a++)r[n[a]]||(a===o-1?r[n[a]]=[]:r[n[a]]={}),r=r[n[a]];return r}var u=function(e,t,n){return t.name=n+e,t},d=function(e,t,n){"object"==typeof t?(t.name=n,e.push(t)):e.push({name:n})},f=function(e,t,n,r){if(n){for(var a=0,o=n.length;o>a;a++)if("text"===n[a].type){t.push({name:n[a].name});break}0===t.length&&0!==n.length&&t.push({name:n[0].name})}if(0===t.length){for(var i in r)if("_id"!==i&&r.hasOwnProperty(i)){t.push({name:i});break}if(0===t.length)throw new Error("Unable to generate a title for "+e)}},m=function(e,t,n){function r(e){var r=e;if("string"==typeof e&&"$"===e.slice(0,1)){var a=e.split(".");switch(a.length){case 1:r=o.getListData(t,e.slice(1),n);break;case 2:r=o.getListData(t,a[1],n);break;default:throw new Error("Unsupported showIf format")}}return r}var a,i=r(e.lhs),s=r(e.rhs);switch(e.comp){case"eq":a=i===s;break;case"ne":a=i!==s;break;default:throw new Error("Unsupported comparator "+e.comp)}return a},p=function(e,t,n){function r(e){if("string"==typeof e&&"$"===e.slice(0,1)){var r=e.slice(1),o=n.dataDependencies[r]||[];o.push(t),n.dataDependencies[r]=o,a+=1}}var a=0,o=!0;return e&&(r(e.lhs),r(e.rhs),0!==a||m(e,void 0,n.select2List)||(o=!1)),o};return{generateEditUrl:function(e,t){return a.buildUrl(t.modelName+"/"+(t.formName?t.formName+"/":"")+e._id+"/edit")},generateNewUrl:function(e){return a.buildUrl(e.modelName+"/"+(e.formName?e.formName+"/":"")+"new")},handleFieldType:s,handleSchema:i,updateDataDependentDisplay:function(e,t,n,r){var a,o,i,s,l,c;for(var u in r.dataDependencies)if(r.dataDependencies.hasOwnProperty(u)){var d=u.split(".");if(1===d.length){if(n||!t||e[u]!==t[u])for(a=r.dataDependencies[u],o=0;o<a.length;o+=1){var f=a[o];for(i=0;i<r.formSchema.length;i+=1)r.formSchema[i].name===f&&(l=angular.element(document.querySelector("#cg_"+r.formSchema[i].id)),m(r.formSchema[i].showIf,e,r.select2List)?l.removeClass("ng-hide"):l.addClass("ng-hide"))}}else{if(2!==d.length)throw new Error("You can only go down one level of subdocument with showIf");if(void 0===c&&(c=!0),e[d[0]])for(s=0;s<e[d[0]].length;s++)if(n||!t||!t[d[0]]||!t[d[0]][s]||e[d[0]][s][d[1]]!==t[d[0]][s][d[1]])for(a=r.dataDependencies[u],o=0;o<a.length;o+=1){var p=a[o].split(".");if(2!==p.length)throw new Error("Conditional display must control dependent fields at same level ");for(i=0;i<r.formSchema.length;i+=1)if(r.formSchema[i].name===p[0])for(var v=r.formSchema[i].schema,g=0;g<v.length;g++)v[g].name===a[o]&&(l=angular.element(document.querySelector("#f_"+p[0]+"List_"+s+" #cg_f_"+a[o].replace(".","_"))),0===l.length?l=angular.element(document.querySelector("#f_elements-"+s+"-"+p[1])):c=!1,l.length>0&&(m(r.formSchema[i].schema[g].showIf,e[d[0]][s],r.select2List)?l.show():l.hide()))}}}return c},add:function(e,t,n){var r=c(e,n);r.push({}),n.setFormDirty(t)},unshift:function(e,t,n){var r=c(e,n);r.unshift({}),n.setFormDirty(t)},remove:function(e,t,n,r){for(var a=e.split("."),o=r.record,i=0,s=a.length;s>i;i++)o=o[a[i]];o.splice(t,1),r.setFormDirty(n)},hasError:function(e,t,n,r){var a=!1;if(r){var o=r[r.topLevelFormName];if("null"!==e&&(o=o[e.replace("$index",n)]),o){var i=o[t];i&&i.$invalid&&(i.$dirty?a=!0:angular.forEach(i.$validators,function(e,t){"required"!==t&&i.$error[t]&&(a=!0)}))}}else console.log("hasError called with no scope! ",e,t,n);return a},decorateScope:function(e,t,n,r){e.record=r.record,e.phase="init",e.disableFunctions=r.disableFunctions,e.dataEventFunctions=r.dataEventFunctions,e.topLevelFormName=void 0,e.formSchema=[],e.tabs=[],e.listSchema=[],e.recordList=[],e.dataDependencies={},e.select2List=[],e.conversions={},e.pageSize=60,e.pagesLoaded=0,r.baseScope=e,e.generateEditUrl=function(n){return t.generateEditUrl(n,e)},e.generateNewUrl=function(){return t.generateNewUrl(e)},e.scrollTheList=function(){return n.scrollTheList(e)},e.getListData=function(t,r){return n.getListData(t,r,e.select2List)},e.setPristine=function(t){t&&e.dismissError(),e[e.topLevelFormName]&&e[e.topLevelFormName].$setPristine()},e.skipCols=function(e){return e>0?"col-md-offset-3":""},e.setFormDirty=function(e){if(e){var t=angular.element(e.target).inheritedData("$formController");t.$setDirty()}else console.log("setFormDirty called without an event (fine in a unit test)")},e.add=function(n,r){return t.add(n,r,e)},e.hasError=function(n,r,a){return t.hasError(n,r,a,e)},e.unshift=function(n,r){return t.unshift(n,r,e)},e.remove=function(n,r,a){return t.remove(n,r,a,e)},e.openSelect2=function(e){$("#"+$(e.currentTarget).data("select2-open")).select2("open")},e.toJSON=function(e){return"The toJSON function is deprecated - use the json filter instead\n\n"+JSON.stringify(e,null,2)+"\n\n*** The toJSON function is deprecated - use the json filter instead ***"},e.baseSchema=function(){return e.tabs.length?e.tabs:e.formSchema}}}}e.formGenerator=t,t.$inject=["$location","$timeout","$filter","SubmissionsService","routingService","recordHandler"]}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n){function r(e,t){function n(e){var n=e;if("string"==typeof e)if("$"===e.slice(0,1)){n=(t||"record")+".";var r=e.slice(1).split(".");if(r.length>1){var a=r.pop();n+=r.join(".")+"[$index]."+a}else n+=e.slice(1)}else n="'"+e+"'";return n}var r=["eq","ne","gt","gte","lt","lte"],a=["===","!==",">",">=","<","<="],o=r.indexOf(e.comp);if(-1===o)throw new Error("Invalid comparison in showWhen");return n(e.lhs)+a[o]+n(e.rhs)}function a(){return"bs2"===e.framework()?"icon":"glyphicon glyphicon"}var o=function(e){return!e||"undefined"===e||-1===["vertical","inline"].indexOf(e)};return{isHorizontalStyle:o,fieldChrome:function(a,i,s){var l="",c="",u="",d="";if(i.showWhen=i.showWhen||i.showwhen,i.showWhen&&(d+="string"==typeof i.showWhen?'ng-show="'+i.showWhen+'"':'ng-show="'+r(i.showWhen,s.model)+'"'),d+=' id="cg_'+i.id.replace(/\./g,"-")+'"',"bs3"===e.framework()){l="form-group","vertical"===s.formstyle&&"block-level"!==i.size&&(c+='<div class="row">',l+=" col-sm-"+t.sizeAsNumber(i.size),u+="</div>");var f,m=null,p=i.name.split(".");s&&"undefined"!=typeof s.subkeyno?f=s.subschemaroot.replace(/\./g,"-")+"-subkey"+s.subkeyno+"-"+p[p.length-1]:s.subschema?(m="form_"+p.slice(0,-1).join("_")+"$index",f=i.name.replace(/\./g,"-")):f="f_"+i.name.replace(/\./g,"_"),c+="<div"+n.addAll(a,"Group",l,s)+" ng-class=\"{'has-error': hasError('"+m+"','"+f+"', $index)}\"",u+="</div>"}else o(s.formstyle)?(c+="<div"+n.addAll(a,"Group","control-group",s),u="</div>"):(c+="<span ",u="</span>");return c+=(d||"")+">",{template:c,closeTag:u}},label:function(t,r,i,s){var l="";if("bs3"===e.framework()||"inline"!==s.formstyle&&""!==r.label||i){l="<label";var c="control-label";o(s.formstyle)?(l+=' for="'+r.id+'"',"undefined"!=typeof r.labelDefaultClass?c+=" "+r.labelDefaultClass:"bs3"===e.framework()&&(c+=" col-sm-3")):"inline"===s.formstyle&&(l+=' for="'+r.id+'"',c+=" sr-only"),l+=n.addAll(t,"Label",null,s)+' class="'+c+'">'+r.label,i&&(l+=' <i id="add_'+r.id+'" ng-click="add(\''+r.name+'\',$event)" class="'+a()+'-plus-sign"></i>'),l+="</label>"}return l},glyphClass:a,allInputsVars:function(r,a,o,i,s,l){var c,u=a.placeHolder,d="",f="",m="",p="";return"bs3"===e.framework()?(d=-1===["horizontal","vertical","inline"].indexOf(o.formstyle)?" input-sm":"",f="col-sm-"+t.sizeAsNumber(a.size),p=" form-control"):m=a.size?" input-"+a.size:"","inline"===o.formstyle&&(u=u||a.label),c='ng-model="'+i+'"'+(s?' id="'+s+'" name="'+s+'" ':' name="'+l+'" '),c+=u?'placeholder="'+u+'" ':"",a.popup&&(c+='title="'+a.popup+'" '),c+=n.addAll(r,"Field",null,o),{common:c,sizeClassBS3:f,sizeClassBS2:m,compactClass:d,formControl:p}},inputChrome:function(t,n,r,a){return"bs3"===e.framework()&&o(r.formstyle)&&"checkbox"!==n.type&&(t='<div class="bs3-input '+a.sizeClassBS3+'">'+t+"</div>"),n.helpInline&&(t+='<span class="'+("bs2"===e.framework()?"help-inline":"help-block")+'">'+n.helpInline+"</span>"),t+='<div ng-if="'+(r.name||"myForm")+"."+n.id+'.$dirty" class="help-block"> <div ng-messages="'+(r.name||"myForm")+"."+n.id+'.$error">  <div ng-messages-include="error-messages.html">  </div> </div></div>',n.help&&(t+='<span class="help-block">'+n.help+"</span>"),t},generateSimpleInput:function(t,n,r){var a="<input "+t+'type="'+n.type+'"';return"inline"!==r.formstyle||"bs2"!==e.framework()||n.size||(a+='class="input-small"'),a+=" />"},controlDivClasses:function(t){var n=[];return o(t.formstyle)&&n.push("bs2"===e.framework()?"controls":"col-sm-9"),n},handleInputAndControlDiv:function(e,t){return t.length>0&&(e='<div class="'+t.join(" ")+'">'+e+"</div>"),e},handleArrayInputAndControlDiv:function(t,n,r,o){var i="<div ";return"bs3"===e.framework()&&(i+='ng-class="skipCols($index)" '),i+='class="'+n.join(" ")+'" id="'+r.id+'List" ',i+='ng-repeat="arrayItem in '+(o.model||"record")+"."+r.name+' track by $index">',i+=t,"link"!==r.type&&(i+="<i ng-click=\"remove('"+r.name+'\',$index,$event)" id="remove_'+r.id+'_{{$index}}" class="'+a()+'-minus-sign"></i>'),i+="</div>"},addTextInputMarkup:function(e,t,n){var r="",a=e.formControl.trim()+e.compactClass+e.sizeClassBS2+(t["class"]?" "+t["class"]:"");return 0!==a.length&&(r+='class="'+a+'"'),t.add&&(r+=" "+t.add+" "),r+=n+(t.readonly?" readonly":"")+" "}}}t.$inject=["cssFrameworkService","inputSizeHelper","addAllService"],e.formMarkupHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e=[1,2,4,6,8,10,12],t=["mini","small","medium","large","xlarge","xxlarge","block-level"],n=2;return{sizeMapping:e,sizeDescriptions:t,defaultSizeOffset:n,sizeAsNumber:function(r){return e[r?t.indexOf(r):n]}}}e.inputSizeHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{extractFromAttr:function(e,t){function n(e){var t=e.replace(/&quot;/g,'"');return"true"===t?t=!0:"false"===t?t=!1:!isNaN(parseFloat(t))&&isFinite(t)&&(t=parseFloat(t)),t}var r={},a={formStyle:e.formstyle},o={},i=t?t.length:0;for(var s in e)e.hasOwnProperty(s)&&("fngFld"===s.slice(0,6)?r[s.slice(6).toLowerCase()]=n(e[s]):"fngOpt"===s.slice(0,6)?a[s.slice(6).toLowerCase()]=n(e[s]):t&&s.slice(0,i)===t&&(o[s.slice(i).toLowerCase()]=n(e[s])));return{info:r,options:a,directiveOptions:o}},buildInputMarkup:function(t,n,r,a,o,i,s){var l,c,u,d=e.fieldChrome(t,r,a,' id="cg_'+r.id+'"'),f=e.controlDivClasses(a),m=d.template+e.label(t,r,o,a);if(o?(l="arrayItem"+(i?".x":""),c=r.id+"_{{$index}}",u=r.name+"_{{$index}}"):(l=n+"."+r.name,c=r.id,u=r.name),a.subschema&&-1!==r.name.indexOf(".")){var p=n+".",v=r.name,g=a.subschemaroot,h=v.slice(g.length+1);l=p,a.index?(l+=g+"["+a.index+"]."+h,c="f_"+l.slice(p.length).replace(/(\.|\[|\]\.)/g,"-")):(l+=g,a.subkey?(c=l.slice(p.length).replace(/\./g,"-")+"-subkey"+a.subkeyno+"-"+h,l+="[$_arrayOffset_"+g.replace(/\./g,"_")+"_"+a.subkeyno+"]."+h):(l+="[$index]."+h,c=null,u=v.replace(/\./g,"-")))}var b=e.allInputsVars(t,r,a,l,c,u);return m+=e["handle"+(o?"Array":"")+"InputAndControlDiv"](e.inputChrome(s(b),r,a,b),f,r,a),m+=d.closeTag},findIdInSchemaAndFlagNeedX:function t(e,n){for(var r=!1,a=0;a<e.length;a++){var o=e[a];if(o.id===n){o.needsX=!0,r=!0;break}if(o.schema&&t(o.schema,n)){r=!0;break}}return r}}}t.$inject=["formMarkupHelper"],e.pluginHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i){function s(e){var t=e.split("."),n=[t[0]];return t.length>1&&n.push(t.slice(1).join(".")),n}function l(e,t,n){var r=s(e);if(r.length>1)c(r[1],t[r[0]],n);else if(t[r[0]]){var a=t[r[0]];if(angular.isArray(a))for(var o=a.length-1;o>=0;o--){var i=typeof a[o];("undefined"===i||"object"===i&&0===Object.keys(a[o]).length)&&a.splice(o,1)}t[r[0]]=n(a)}}function c(e,t,n){if(void 0!==t)if(angular.isArray(t))for(var r=0;r<t.length;r++)l(e,t[r],n);else l(e,t,n)}function u(e,t,n,r){if(e.array){for(var a=[],o=!e.directive||w(e),i=0;i<t.length;i++){var s=t[i];s&&s.x&&(s=s.x);var l=$(s,r,n,e.name);o&&(l={x:l}),a.push(l)}return a}return e.select2?{id:t,text:$(t,r,n,e.name)}:$(t,r,n,e.name)}function d(e,t,n,r){if(e.array){for(var a=[],o=0;o<t.length;o++)a.push(x(t[o],n,r,e.name));return a}return x(t,n,r,e.name)}function f(e,t,n,r,a){var o=!t.id&&!t.newRecord;if(n.handleSchema("Main "+t.modelName,e,o?null:t.formSchema,t.listSchema,"",!0,t,a),o)a.allowLocationChange=!0;else{var i=!0;t.$watch("record",function(e,r){e!==r&&(i=n.updateDataDependentDisplay(e,r,i,t))},!0),t.id?"function"==typeof t.dataEventFunctions.onBeforeRead?t.dataEventFunctions.onBeforeRead(t.id,function(e){e?t.showError(e):r.readRecord(t,a)}):r.readRecord(t,a):(a.master={},t.phase="ready",t.cancel())}}function m(e){return function(t,r){if(-1!==[200,400].indexOf(r)){var a="";for(var o in t.errors)if(t.errors.hasOwnProperty(o)){switch(a+="<li><b>"+n("titleCase")(o)+": </b> ",t.errors[o].type){case"enum":a+="You need to select from the list of values";break;default:a+=t.errors[o].message}a+="</li>"}a=a.length>0?t.message+"<br /><ul>"+a+"</ul>":t.message||"Error!  Sorry - No further details available.",e.showError(a)}else e.showError(r+" "+JSON.stringify(t))}}var p=function(e,t){return(e.id||"f_"+e.name).replace(/\./g,"_")+t},v=function(e,t,n){for(var r=t.split("."),a=r.length-1,o=e,i=0;a>i&&(o=angular.isArray(o)?_.map(o,function(e){return e[r[i]]}):o[r[i]],angular.isArray(o)&&n&&n.scope&&"function"==typeof n.scope&&(o=o[n.scope().$index]),o);i++);return{lastObject:o,key:o?r[a]:void 0}},g=function(e,t,n,r){var a=v(e,t,n);if(a.lastObject&&a.key)if(angular.isArray(a.lastObject))for(var o=0;o<a.lastObject.length;o++)a.lastObject[o][a.key]=r[o];else a.lastObject[a.key]=r},h=function(e,t,n){var r,a=v(e,t,n);return a.lastObject&&a.key&&(r=angular.isArray(a.lastObject)?_.map(a.lastObject,function(e){return e[a.key]}):a.lastObject[a.key]),r},b=function(e,t,n){if(!t.topLevelFormName||t[t.topLevelFormName].$pristine){l(e.name,n.master,function(n){return u(e,n,t[p(e,"Options")],t[p(e,"_ids")])});var r=h(n.master,e.name);r&&g(t.record,e.name,void 0,r)}},y=function(e,t,n){for(var r=t.split("."),a=0;a<r.length;a++)void 0!==e&&null!==e&&(e=e[r[a]]);return e&&-1!==n.indexOf(r[a-1])&&(e=e.text||e),void 0===e&&(e=""),e},w=function(e){var t=!1;return"text"===e.type?t=!0:(e.needsX||"select"===e.type&&!e.ids&&!e.directive)&&(t=!0),t},k=function(e,t,n,r,a){a=a||t;for(var o=0;o<e.length;o++){var i=e[o],s=i.name.slice(n),l=h(t,s);if(i.schema){if(l)for(var c=0;c<l.length;c++)l[c]=k(i.schema,l[c],n+1+s.length,r,a)}else{var d=y(t,s,r.select2List);if(i.array&&w(i)&&d)for(var f=0;f<d.length;f++)d[f]={x:d[f]};var m=r[p(i,"_ids")];if(l&&m&&m.length>0){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 332");t[s]=u(i,l,r[p(i,"Options")],m)}else if(i.select2&&!i.select2.fngAjax){if(l)if(i.array)for(var v=0;v<l.length;v++)r[i.select2.s2query].query({term:l[v].x.text||l[v].text||l[v].x||l[v],callback:function(e){if(e.results.length>0)if(l[v].x){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 342");t[s][v].x=e.results[0]}else{if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 345");t[s][v]=e.results[0]}}});else r[i.select2.s2query].query({term:l,callback:function(e){if(e.results.length>0){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 357");t[s]=e.results[0]}}})}else if(i.select2)void i.select2;else if(l&&r.conversions[i.name]&&r.conversions[i.name].fngajax&&!r.conversions[i.name].noconvert){var b=i;r.conversions[b.name].fngajax(l,b,function(e,t){g(a,e.name,void 0,t),C(angular.element("#"+e.id),function(){g(r.record,e.name,void 0,t)})})}}}return t},x=function(e,t,n,r){var a=_.isObject(e)?e.x||e.text:e;if(a&&a.match(/^[0-9a-f]{24}$/))return a;var o=t.indexOf(a);if(-1===o)throw new Error("convertListValueToId: Invalid data - value "+a+" not found in "+t+" processing "+r);return n[o]},C=function(e,t){var n=e.inheritedData("$ngModelController"),r=n&&n.$pristine;r&&(n.$pristine=!1),t(),r&&(n.$pristine=!0)},$=function(e,t,n,r){var a=t.indexOf(e);if(-1===a)throw new Error("convertIdToListValue: Invalid data - id "+e+" not found in "+t+" processing "+r);return n[a]},S=function(e,t,n){n.master=k(t.formSchema,e,0,t),t.phase="ready",t.cancel()};return{readRecord:function(t,n){o.readRecord(t.modelName,t.id).success(function(r){r.success===!1&&e.path("/404"),n.allowLocationChange=!1,t.phase="reading","function"==typeof t.dataEventFunctions.onAfterRead&&t.dataEventFunctions.onAfterRead(r),S(r,t,n)}).error(t.handleHttpError)},scrollTheList:function(t){var n=t.pagesLoaded;o.getPagedAndFilteredList(t.modelName,{aggregate:e.$$search.a,find:e.$$search.f,limit:t.pageSize,skip:n*t.pageSize,order:e.$$search.o}).success(function(e){angular.isArray(e)?n===t.pagesLoaded?(t.pagesLoaded++,t.recordList=t.recordList.concat(e)):console.log("DEBUG: infinite scroll component asked for a page twice"):t.showError(e,"Invalid query")}).error(t.handleHttpError)},deleteRecord:function(t,n,r,i){o.deleteRecord(t,n).success(function(){"function"==typeof r.dataEventFunctions.onAfterDelete&&r.dataEventFunctions.onAfterDelete(i.master),a.redirectTo()("list",r,e)})},updateDocument:function(e,n,r,a){r.phase="updating",o.updateRecord(r.modelName,r.id,e).success(function(e){e.success!==!1?("function"==typeof r.dataEventFunctions.onAfterUpdate&&r.dataEventFunctions.onAfterUpdate(e,a.master),n.redirect?(n.allowChange&&(a.allowLocationChange=!0),t.location=n.redirect):(S(e,r,a),r.setPristine(!1))):r.showError(e)}).error(r.handleHttpError)},createNew:function(n,r,i){o.createRecord(i.modelName,n).success(function(n){n.success!==!1?("function"==typeof i.dataEventFunctions.onAfterCreate&&i.dataEventFunctions.onAfterCreate(n),r.redirect?t.location=r.redirect:a.redirectTo()("edit",i,e,n._id)):i.showError(n)}).error(i.handleHttpError)},getListData:y,suffixCleanId:p,setData:g,setUpSelectOptions:function(e,t,n,r,a){var s=n[t.options]=[],l=n[t.ids]=[];i.getSchema(e).success(function(i){var c=[];a("Lookup "+e,i,null,c,"",!1,n,r);var u;"undefined"!=typeof t.filter&&t.filter?(console.log("filtering"),u=o.getPagedAndFilteredList(e,t.filter)):u=o.getAll(e),u.success(function(e){if(e){for(var a=0;a<e.length;a++){for(var o="",i=0;i<c.length;i++)o+=e[a][c[i].name]+" ";o=o.trim();var u=_.sortedIndex(s,o);s[u]===o&&(o=o+"    ("+e[a]._id+")",u=_.sortedIndex(s,o)),s.splice(u,0,o),l.splice(u,0,e[a]._id)}b(t,n,r)}})})},preservePristine:C,convertToMongoModel:function D(e,t,n,r){function a(e,t){var n;return t.select2&&t.select2.fngAjax||r.conversions[t.name]&&r.conversions[t.name].fngajax?e&&(n=e.id||e):e&&(n=e.text||(e.x?e.x.text:e)),n}for(var o=0;o<e.length;o++){var i=e[o].name.slice(n),s=y(t,i,r.select2List);if(e[o].schema){if(s)for(var c=0;c<s.length;c++)s[c]=D(e[o].schema,s[c],n+1+i.length,r)}else{if(e[o].array&&w(e[o])&&s)for(var u=0;u<s.length;u++)s[u]=s[u].x;var f=r[p(e[o],"_ids")];if(f&&f.length>0)l(i,t,function(t){return d(e[o],t,r[p(e[o],"Options")],f)});else if(r.conversions[e[o].name]){var m,v=h(t,i,null);if(e[o].array){if(m=[],v)for(var b=0;b<v.length;b++)m[b]=a(v[b],e[o])}else m=a(v,e[o]);g(t,i,null,m)}}}return t},convertIdToListValue:$,handleError:m,decorateScope:function(n,o,i,s){n.handleHttpError=m(n),n.cancel=function(){angular.copy(s.master,n.record),n.$broadcast("fngCancel",n),r(n.setPristine)},n.$on("showErrorMessage",function(e,t){n.showError(t.body,t.title)}),n.showError=function(e,t){n.alertTitle=t?t:"Error!",n.errorMessage=e},n.dismissError=function(){delete n.errorMessage,delete n.alertTitle},n.save=function(e){e=e||{};var t=i.convertToMongoModel(n.formSchema,angular.copy(n.record),0,n);n.id?"function"==typeof n.dataEventFunctions.onBeforeUpdate?n.dataEventFunctions.onBeforeUpdate(t,s.master,function(r){r?n.showError(r):i.updateDocument(t,e,n,s)}):i.updateDocument(t,e,n,s):"function"==typeof n.dataEventFunctions.onBeforeCreate?n.dataEventFunctions.onBeforeCreate(t,function(r){r?n.showError(r):i.createNew(t,e,n)}):i.createNew(t,e,n)},n.newClick=function(){a.redirectTo()("new",n,e)},n.$on("$locationChangeStart",function(e,r){if(!s.allowLocationChange&&!n.isCancelDisabled()){e.preventDefault();var a=o.open({template:'<div class="modal-header">   <h3>Record modified</h3></div><div class="modal-body">   <p>Would you like to save your changes?</p></div><div class="modal-footer">    <button class="btn btn-primary dlg-yes" ng-click="yes()">Yes</button>    <button class="btn btn-warning dlg-no" ng-click="no()">No</button>    <button class="btn dlg-cancel" ng-click="cancel()">Cancel</button></div>',controller:"SaveChangesModalCtrl",backdrop:"static"});a.result.then(function(e){e?n.save({redirect:r,allowChange:!0}):(s.allowLocationChange=!0,t.location=r)})}}),n.deleteClick=function(){if(n.record._id){var e=o.open({template:'<div class="modal-header">   <h3>Delete Item</h3></div><div class="modal-body">   <p>Are you sure you want to delete this record?</p></div><div class="modal-footer">    <button class="btn btn-primary dlg-no" ng-click="cancel()">No</button>    <button class="btn btn-warning dlg-yes" ng-click="yes()">Yes</button></div>',controller:"SaveChangesModalCtrl",backdrop:"static"});e.result.then(function(e){e&&("function"==typeof n.dataEventFunctions.onBeforeDelete?n.dataEventFunctions.onBeforeDelete(s.master,function(e){e?n.showError(e):i.deleteRecord(n.modelName,n.id,n,s)}):i.deleteRecord(n.modelName,n.id,n,s))})}},n.isCancelDisabled=function(){return"function"==typeof n.disableFunctions.isCancelDisabled?n.disableFunctions.isCancelDisabled(n.record,s.master,n[n.topLevelFormName]):n[n.topLevelFormName]&&n[n.topLevelFormName].$pristine},n.isSaveDisabled=function(){return"function"==typeof n.disableFunctions.isSaveDisabled?n.disableFunctions.isSaveDisabled(n.record,s.master,n[n.topLevelFormName]):n[n.topLevelFormName]&&(n[n.topLevelFormName].$invalid||n[n.topLevelFormName].$pristine)},n.isDeleteDisabled=function(){return"function"==typeof n.disableFunctions.isDeleteDisabled?n.disableFunctions.isDeleteDisabled(n.record,s.master,n[n.topLevelFormName]):!n.id},n.isNewDisabled=function(){return"function"==typeof n.disableFunctions.isNewDisabled?n.disableFunctions.isNewDisabled(n.record,s.master,n[n.topLevelFormName]):!1},n.disabledText=function(e){var t="";return n.isSaveDisabled&&(t="This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. "+e),t},n.getVal=function(e,t){return-1===e.indexOf("$index")||"undefined"!=typeof t?(e=e.replace(/\$index/g,t),n.$eval("record."+e)):void 0}},fillFormFromBackendCustomSchema:f,fillFormWithBackendSchema:function(e,t,n,r){i.getSchema(e.modelName,e.formName).success(function(a){f(a,e,t,n,r)}).error(e.handleHttpError)}}}t.$inject=["$location","$window","$filter","$timeout","routingService","SubmissionsService","SchemasService"],e.recordHandler=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{getSchema:function(t,n){return e.get("/api/schema/"+t+(n?"/"+n:""),{cache:!0})}}}t.$inject=["$http"],e.SchemasService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){var n=function(e){var t="",n=function(e,n){(n&&""!==n||"number"==typeof n)&&("object"==typeof n&&(n=JSON.stringify(n)),""===t?t="?":t+="&",t+=e+"="+n)};return n("l",e.limit),n("f",e.find),n("a",e.aggregate),n("o",e.order),n("s",e.skip),t};return{getListAttributes:function(t,n){return e.get("/api/"+t+"/"+n+"/list")},readRecord:function(t,n){return e.get("/api/"+t+"/"+n)},getAll:function(t,n){var r=angular.extend({cache:!0},n);return e.get("/api/"+t,r)},getPagedAndFilteredList:function(t,r){return e.get("/api/"+t+n(r))},deleteRecord:function(t,n){return e["delete"]("/api/"+t+"/"+n)},updateRecord:function(n,r,a){return t.get("$http").remove("/api/"+n),e.post("/api/"+n+"/"+r,a)},createRecord:function(n,r){return t.get("$http").remove("/api/"+n),e.post("/api/"+n,r)}}}t.$inject=["$http","$cacheFactory"],e.SubmissionsService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){e.formsAngular=angular.module("formsAngular",["ngSanitize","ngMessages","ui.bootstrap","infinite-scroll","monospaced.elastic"]).controller("BaseCtrl",e.controllers.BaseCtrl).controller("SaveChangesModalCtrl",e.controllers.SaveChangesModalCtrl).controller("ModelCtrl",e.controllers.ModelCtrl).controller("NavCtrl",e.controllers.NavCtrl).directive("modelControllerDropdown",e.directives.modelControllerDropdown).directive("errorDisplay",e.directives.errorDisplay).directive("fngLink",e.directives.fngLink).directive("formInput",e.directives.formInput).directive("formButtons",e.directives.formButtons).directive("globalSearch",e.directives.globalSearch).filter("camelCase",e.filters.camelCase).filter("titleCase",e.filters.titleCase).service("addAllService",e.services.addAllService).provider("cssFrameworkService",e.services.cssFrameworkService).provider("routingService",e.services.routingService).factory("$data",e.services.$data).factory("formGenerator",e.services.formGenerator).factory("formMarkupHelper",e.services.formMarkupHelper).factory("inputSizeHelper",e.services.inputSizeHelper).factory("pluginHelper",e.services.pluginHelper).factory("recordHandler",e.services.recordHandler).factory("SchemasService",e.services.SchemasService).factory("SubmissionsService",e.services.SubmissionsService)}(fng||(fng={}));var formsAngular=fng.formsAngular,fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i,s,l){var c=o,u={master:{},fngInvalidRequired:"fng-invalid-required",allowLocationChange:!0};angular.extend(e,i.parsePathFunc()(n.$$path)),e.modelNameDisplay=c.modelNameDisplay||r("titleCase")(e.modelName),t.$broadcast("fngFormLoadStart",e),s.decorateScope(e,s,l,c),l.decorateScope(e,a,l,u),l.fillFormWithBackendSchema(e,s,l,u);for(var d=0;d<c.modelControllers.length;d++)c.modelControllers[d].onBaseCtrlReady&&c.modelControllers[d].onBaseCtrlReady(e)}t.$inject=["$scope","$rootScope","$location","$filter","$uibModal","$data","routingService","formGenerator","recordHandler"],e.BaseCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){e.yes=function(){t.close(!0)},e.no=function(){t.close(!1)},e.cancel=function(){t.dismiss("cancel")}}t.$inject=["$scope","$uibModalInstance"],e.SaveChangesModalCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r){e.models=[],t.get("/api/models").success(function(t){e.models=t}).error(function(){n.path("/404")}),e.newUrl=function(e){return r.buildUrl(e+"/new")},e.listUrl=function(e){return r.buildUrl(e)}}t.$inject=["$scope","$http","$location","routingService"],e.ModelCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i){function s(n,r,o){var i,s={};n+="Ctrl",s.$scope=t.modelControllers[r]=e.$new();try{a(n,s),i=e.routing.newRecord?"creating":e.routing.id?"editing":"listing",angular.isObject(s.$scope.contextMenu)&&angular.forEach(s.$scope.contextMenu,function(t){t.divider?o=!0:t[i]&&(o&&(o=!1,e.items.push({divider:!0})),e.items.push(t))})}catch(l){/is not a function, got undefined/.test(l.message)||console.log("Unable to instantiate "+n+" - "+l.message)}}e.items=[],e.isCollapsed=!0,e.showShortcuts=!1,e.shortcuts=[{key:"?",act:"Show shortcuts"},{key:"/",act:"Jump to search"},{key:"Ctrl+Shift+S",act:"Save the current record"},{key:"Ctrl+Shift+Esc",act:"Cancel changes on the current record"},{key:"Ctrl+Shift+Ins",act:"Create a new record"},{key:"Ctrl+Shift+X",act:"Delete the current record"}],e.markupShortcut=function(e){return'<span class="key">'+e.split("+").join('</span> + <span class="key">')+"</span>"},e.globalShortcuts=function(t){function n(e){var n=document.getElementById(e);n&&(n.disabled||setTimeout(function(){n.click()}),t.preventDefault())}function r(e){var t=(e.target||e.srcElement).tagName;return!("INPUT"==t||"SELECT"==t||"TEXTAREA"==t)}if(191!==t.keyCode||!r(t)&&(t.altKey||t.metaKey))83===t.keyCode&&t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("saveButton"):27===t.keyCode&&(t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey||e.showShortcuts)?t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("cancelButton"):e.showShortcuts=!1:45===t.keyCode&&t.ctrlKey&&t.shiftKey&&!t.altKey&&!t.metaKey?n("newButton"):88===t.keyCode&&t.ctrlKey&&t.shiftKey&&t.altKey&&!t.metaKey&&n("deleteButton");else if(t.ctrlKey||!t.shiftKey){var a=document.getElementById("searchinput");a&&(a.focus(),t.preventDefault())}else e.showShortcuts=!0},e.css=function(e,t){var n;return n="function"==typeof i[e]?i[e](t):"error text-error"},e.$on("$locationChangeSuccess",function(){if(e.routing=o.parsePathFunc()(n.$$path),e.items=[],e.routing.analyse)e.contextMenu="Report",e.items=[{broadcast:"exportToPDF",text:"PDF"},{broadcast:"exportToCSV",text:"CSV"}];else if(e.routing.modelName){angular.forEach(t.modelControllers,function(e){e.$destroy()}),t.modelControllers=[],t.record={},t.disableFunctions={},t.dataEventFunctions={},delete t.dropDownDisplay,delete t.modelNameDisplay;var a=r("titleCase")(e.routing.modelName,!0),i=!1;s(a,0,i),e.routing.formName&&s(a+r("titleCase")(e.routing.formName,!0),1,i),e.contextMenu=t.dropDownDisplay||t.modelNameDisplay||r("titleCase")(e.routing.modelName,!1)}}),e.doClick=function(t,n){var r=angular.element(n.target),a=e.items[t];if(a.divider||r.parent().hasClass("disabled"))n.preventDefault();else if(a.broadcast)e.$broadcast(a.broadcast);else{var o=a.args||[],i=a.fn;switch(o.length){case 0:i();break;case 1:i(o[0]);break;case 2:i(o[0],o[1]);break;case 3:i(o[0],o[1],o[2]);break;case 4:i(o[0],o[1],o[2],o[3])}}},e.isHidden=function(t){return e.items[t].isHidden?e.items[t].isHidden():!1},e.isDisabled=function(t){return e.items[t].isDisabled?e.items[t].isDisabled():!1},e.buildUrl=function(e){return o.buildUrl(e)},e.dropdownClass=function(t){var n=e.items[t],r="";return n.divider?r="divider":e.isDisabled(t)&&(r="disabled"),r}}t.$inject=["$scope","$data","$location","$filter","$controller","routingService","cssFrameworkService"],e.NavCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r){var a,o="";a=function(){var e=!1;return function(t){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4)))&&(e=!0);
}(navigator.userAgent||navigator.vendor||window.opera),!e}(),e.searchPlaceholder=a?"Ctrl + / to Search":"Search",e.handleKey=function(t){if(27===t.keyCode&&e.searchTarget&&e.searchTarget.length>0)e.searchTarget="";else if(e.results.length>0)switch(t.keyCode){case 38:e.focus>0&&e.setFocus(e.focus-1),"function"==typeof t.preventDefault&&t.preventDefault();break;case 40:e.results.length>e.focus+1&&e.setFocus(e.focus+1),"function"==typeof t.preventDefault&&t.preventDefault();break;case 13:null!=e.focus&&e.selectResult(e.focus)}},e.setFocus=function(t){null!==e.focus&&delete e.results[e.focus].focussed,e.results[t].focussed=!0,e.focus=t},e.selectResult=function(t){var a=e.results[t],o=r.prefix()+"/"+a.resource+"/"+a.id+"/edit";a.resourceTab&&(o+="/"+a.resourceTab),n.url(o)},e.resultClass=function(t){var n="search-result";return e.results&&e.results[t].focussed&&(n+=" focus"),n};var i=function(){e.moreCount=0,e.errorClass="",e.results=[],e.focus=null};e.$watch("searchTarget",function(n){n&&n.length>0?(o=n,t.get("/api/search?q="+n).success(function(t){o===n&&(e.searchTarget.length>0?(e.results=t.results,e.moreCount=t.moreCount,t.results.length>0&&(e.errorClass="",e.setFocus(0)),e.errorClass=0===e.results.length?"error has-error":""):i())}).error(function(e,t){console.log("Error in searchbox.js : "+e+" (status="+t+")")})):i()},!0),e.$on("$routeChangeStart",function(){e.searchTarget=""})}t.$inject=["$scope","$http","$location","routingService"],e.SearchCtrl=t}(t=e.controllers||(e.controllers={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return{restrict:"AE",replace:!0,template:'<li ng-show="items.length > 0" class="mcdd" uib-dropdown> <a uib-dropdown-toggle>  {{contextMenu}} <b class="caret"></b> </a> <ul class="uib-dropdown-menu dropdown-menu">  <li ng-repeat="choice in items" ng-hide="isHidden($index)" ng-class="dropdownClass($index)">   <a ng-show="choice.text" class="dropdown-option" ng-href="{{choice.url}}" ng-click="doClick($index, $event)">    {{choice.text}}   </a>  </li> </ul></li>'}}e.modelControllerDropdown=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return{restrict:"E",template:'<div id="display-error" ng-show="errorMessage" ng-class="css(\'rowFluid\')">  <div class="alert alert-error col-lg-offset-3 offset3 col-lg-6 col-xs-12 span6 alert-warning alert-dismissable">    <button type="button" class="close" ng-click="dismissError()">×</button>    <h4>{{alertTitle}}</h4>    <div ng-bind-html="errorMessage"></div>  </div></div>'}}e.errorDisplay=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){return{restrict:"E",scope:{dataSrc:"&model"},link:function(n,r,a){var o=a.ref,i=a.form;n.readonly=a.readonly,i=i?i+"/":"",a.text&&a.text.length>0&&(n.text=a.text);var s=n.$parent.$index;n.$watch("dataSrc()",function(r){r&&("undefined"!=typeof s&&angular.isArray(r)&&(r=r[s]),n.link=e.buildUrl(o+"/"+i+r+"/edit"),n.text||t.getListAttributes(o,r).success(function(e){e.success===!1?n.text=e.err:n.text=e.list}).error(function(e,t){n.text="Error "+e+": "+t}))},!0)},template:function(e,t){return t.readonly?'<span class="fng-link">{{text}}</span>':'<a href="{{ link }}" class="fng-link">{{text}}</a>'}}}t.$inject=["routingService","SubmissionsService"],e.fngLink=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,r,a,o,i,s,l){return{restrict:"EA",link:function(c,u,d){var f=[],m=n.N,p=function(e,t,n,r,a){function o(){var t;if(angular.isArray(c[e.options]))t={repeat:e.options,value:"option"};else{if(!c[e.options]||!angular.isArray(c[e.options].values))throw new Error("Invalid enumeration setup in field "+e.name);t=angular.isArray(c[e.options].labels)?{repeat:e.options+".values",value:e.options+".values[$index]",label:e.options+".labels[$index]"}:{repeat:e.options+".values",value:e.options+".values[$index]"}}return t}var s;if(!t){var u=(a.model||"record")+".";if(t=u,a.subschema&&-1!==e.name.indexOf(".")){var d=e.name,f=a.subschemaroot,m=d.slice(f.length+1);a.index?(t+=f+"["+a.index+"]."+m,r="f_"+t.slice(u.length).replace(/(\.|\[|\]\.)/g,"-")):(t+=f,a.subkey?(r=t.slice(u.length).replace(/\./g,"-")+"-subkey"+a.subkeyno+"-"+m,t+="[$_arrayOffset_"+f.replace(/\./g,"_")+"_"+a.subkeyno+"]."+m):(t+="[$index]."+m,r=null,s=d.replace(/\./g,"-")))}else t+=e.name}var p,v,g=l.allInputsVars(c,e,a,t,r,s),h=g.common,b=n||e.required?" required":"";switch(e.type){case"select":e.select2?(h+='class="fng-select2'+g.formControl+g.compactClass+g.sizeClassBS2+'"',h+=e.readonly?" readonly":"",h+=e.required?' ng-required="true"':"",h+=e.add?" "+e.add+" ":"",e.select2.fngAjax?"bs2"===i.framework()?(p='<div class="input-append">',p+='<input ui-select2="'+e.select2.fngAjax+'" '+h+">",p+='<button class="btn" type="button" data-select2-open="'+r+'" ng-click="openSelect2($event)"><i class="icon-search"></i></button>',p+="</div>"):(p='<div class="input-group">',p+='<input ui-select2="'+e.select2.fngAjax+'" '+h+">",p+='<span class="input-group-addon'+g.compactClass+'" data-select2-open="'+r+'" ',p+='    ng-click="openSelect2($event)"><i class="glyphicon glyphicon-search"></i></span>',p+="</div>"):e.select2&&(p='<input ui-select2="'+e.select2.s2query+'" '+h+">")):(h+=e.readonly?"disabled ":"",h+=e.add?" "+e.add+" ":"",p="<select "+h+'class="'+g.formControl.trim()+g.compactClass+g.sizeClassBS2+'" '+b+">",n||(p+="<option></option>"),angular.isArray(e.options)?angular.forEach(e.options,function(e){p+=_.isObject(e)?'<option value="'+(e.val||e.id)+'">'+(e.label||e.text)+"</option>":"<option>"+e+"</option>"}):(v=o(),p+='<option ng-repeat="option in '+v.repeat+'"',p+=v.label?' value="{{'+v.value+'}}"> {{ '+v.label+" }} </option> ":">{{"+v.value+"}}</option> "),p+="</select>");break;case"link":p='<fng-link model="'+t+'" ref="'+e.ref+'"',e.form&&(p+=' form="'+e.form+'"'),e.linkText&&(p+=' text="'+e.linkText+'"'),e.readonly&&(p+=' readonly="true"'),p+="></fng-link>";break;case"radio":p="",h+=b+(e.readonly?" disabled ":" ");var y="vertical"===a.formstyle||"inline"!==a.formstyle&&!e.inlineRadio;if(angular.isArray(e.options))a.subschema&&(h=h.replace('name="','name="{{$index}}-')),angular.forEach(e.options,function(e){p+="<input "+h+'type="radio"',p+=' value="'+e+'">'+e,y&&(p+="<br />")});else{var w=y?"div":"span";a.subschema&&(h=h.replace("$index","$parent.$index").replace('name="','name="{{$parent.$index}}-')),v=o(),p+="<"+w+' ng-repeat="option in '+v.repeat+'"><input '+h+' type="radio" value="{{'+v.value+'}}"> {{',p+=v.label||v.value,p+=" }} </"+w+"> "}break;case"checkbox":h+=b+(e.readonly?" disabled ":" "),p="bs3"===i.framework()?'<div class="checkbox"><input '+h+'type="checkbox"></div>':l.generateSimpleInput(h,e,a);break;default:h+=l.addTextInputMarkup(g,e,b),"textarea"===e.type?(e.rows&&(h+="auto"===e.rows?'msd-elastic="\n" class="ng-animate" ':'rows = "'+e.rows+'" '),"ckEditor"===e.editor&&(h+='ckeditor = "" ',"bs3"===i.framework()&&(g.sizeClassBS3="col-xs-12")),p="<textarea "+h+" />"):p=l.generateSimpleInput(h,e,a)}return l.inputChrome(p,e,a,g)},v=function(e){var t;switch(e){case"horizontal":t="form-horizontal";break;case"vertical":t="";break;case"inline":t="form-inline";break;case"horizontalCompact":t="form-horizontal compact";break;default:t="form-horizontal compact"}return t},g=function(e){var t={before:"",after:""};if("function"==typeof e.containerType)t=e.containerType(e);else switch(e.containerType){case"tab":for(var n=-1,r=0;r<c.tabs.length;r++)if(c.tabs[r].title===e.title){n=r;break}n>=0?(t.before="<uib-tab select=\"updateQueryForTab('"+e.title+'\')" heading="'+e.title+'"',n>0&&(t.before+='active="tabs['+n+'].active"'),t.before+=">",t.after="</uib-tab>"):(t.before="<p>Error!  Tab "+e.title+" not found in tab list</p>",t.after="");break;case"tabset":t.before="<uib-tabset>",t.after="</uib-tabset>";break;case"well":t.before='<div class="well">',e.title&&(t.before+="<h4>"+e.title+"</h4>"),t.after="</div>";break;case"well-large":t.before='<div class="well well-lg well-large">',t.after="</div>";break;case"well-small":t.before='<div class="well well-sm well-small">',t.after="</div>";break;case"fieldset":t.before="<fieldset>",e.title&&(t.before+="<legend>"+e.title+"</legend>"),t.after="</fieldset>";break;case void 0:break;case null:break;case"":break;default:if(t.before='<div class="'+e.containerType+'">',e.title){var a=e.titleTagOrClass||"h4";a.match(/h[1-6]/)?t.before+="<"+a+">"+e.title+"</"+a+">":t.before+='<p class="'+a+'">'+e.title+"</p>"}t.after="</div>"}return t},h=function(e,t){var n=l.fieldChrome(c,e,t),r=n.template;if(e.schema){var a=e.name.replace(/\./g,"_"),o="$_schema_"+a;if(c[o]=e.schema,e.schema)if(e.subkey){e.subkey.path=e.name,c[o+"_subkey"]=e.subkey;for(var s=angular.isArray(e.subkey)?e.subkey:[e.subkey],u=0;u<s.length;u++){var d=g(s[u]);r+=d.before,r+=y(e.schema,null,{subschema:"true",formstyle:t.formstyle,subkey:o+"_subkey",subkeyno:u,subschemaroot:e.name}),r+=d.after}f.push(e)}else t.subschema?console.log("Attempts at supporting deep nesting have been removed - will hopefully be re-introduced at a later date"):(r+='<div class="schema-head">'+e.label,e.unshift&&(r+='<button id="unshift_'+e.id+'_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="unshift(\''+e.name+'\',$event)"><i class="'+l.glyphClass()+'-plus"></i> Add</button>'),r+='</div><div ng-form class="'+("bs2"===i.framework()?"row-fluid ":"")+v(e.formStyle)+'" name="form_'+a+'{{$index}}" class="sub-doc well" id="'+e.id+'List_{{$index}}"  ng-repeat="subDoc in '+(t.model||"record")+"."+e.name+' track by $index">   <div class="'+("bs2"===i.framework()?"row-fluid":"row")+' sub-doc">',(!e.noRemove||e.customSubDoc)&&(r+='   <div class="sub-doc-btns">',e.customSubDoc&&(r+=e.customSubDoc),e.noRemove||(r+='<button name="remove_'+e.id+'_btn" class="remove-btn btn btn-mini btn-default btn-xs form-btn" ng-click="remove(\''+e.name+'\',$index,$event)"><i class="'+l.glyphClass()+'-minus"></i> Remove</button>'),r+="  </div> "),r+=y(e.schema,!1,{subschema:"true",formstyle:e.formStyle,model:t.model,subschemaroot:e.name}),r+="   </div></div>",(!e.noAdd||e.customFooter)&&(r+='<div class = "schema-foot">',e.customFooter&&(r+=e.customFooter),e.noAdd||(r+='<button id="add_'+e.id+'_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="add(\''+e.name+'\',$event)"><i class="'+l.glyphClass()+'-plus"></i> Add</button>'),r+="</div>"))}else{var m=l.controlDivClasses(t);if(e.array){if(m.push("fng-array"),"inline"===t.formstyle)throw new Error("Cannot use arrays in an inline form");r+=l.label(c,e,"link"!==e.type,t),r+=l.handleArrayInputAndControlDiv(p(e,"link"===e.type?null:"arrayItem.x",!0,e.id+"_{{$index}}",t),m,e,t)}else r+=l.label(c,e,null,t),t.required&&console.log("*********  Options required - found it ********"),r+=l.handleInputAndControlDiv(p(e,null,t.required,e.id,t),m)}return r+=n.closeTag},b=function(e){e.type=e.type||"text",e.id?("number"==typeof e.id||e.id[0]>=0&&e.id<="9")&&(e.id="_"+e.id):e.id="f_"+e.name.replace(/\./g,"_"),e.label=void 0!==e.label?null===e.label?"":e.label:r("titleCase")(e.name.split(".").slice(-1)[0])},y=function(e,t,a){var o="";if(e)for(var i=0;i<e.length;i++){var s=e[i];0===i&&t&&!a.schema.match(/$_schema_/)&&"object"!=typeof s.add&&(s.add=s.add?" "+s.add+" ":"",-1!==s.add.indexOf("ui-date")||a.noautofocus||s.containerType||(s.add=s.add+"autofocus "));var l=!0;if(s.directive){var d=s.directive,f="<"+d+' model="'+(a.model||"record")+'"',p=u[0];b(s);for(var v=0;v<p.attributes.length;v++){var w=p.attributes[v];switch(w.nodeName){case"class":var k=w.value.replace("ng-scope","");k.length>0&&(f+=' class="'+k+'"');break;case"schema":var x=("bespoke_"+s.name).replace(/\./g,"_");c[x]=angular.copy(s),delete c[x].directive,f+=' schema="'+x+'"';break;default:f+=" "+w.nodeName+'="'+w.value+'"'}}f+=" ";var C=r("camelCase")(s.directive);for(var $ in s)if(s.hasOwnProperty($))switch($){case"directive":break;case"schema":break;case"add":switch(typeof s.add){case"string":f+=" "+s.add;break;case"object":for(var S in s.add)f+=" "+S+'="'+s.add[S].toString().replace(/"/g,"&quot;")+'"';break;default:throw new Error("Invalid add property of type "+typeof s.add+" in directive "+s.name)}break;case C:for(var D in s[$])f+=s.directive+"-"+D+'="'+s[$][D]+'"';break;default:f+=" fng-fld-"+$+'="'+s[$].toString().replace(/"/g,"&quot;")+'"'}for($ in a)a.hasOwnProperty($)&&"$"!==$[0]&&"undefined"!=typeof a[$]&&(f+=" fng-opt-"+$+'="'+a[$].toString().replace(/"/g,"&quot;")+'"');f+='ng-model="'+s.name+'"></'+d+">",o+=f,l=!1}else if(s.containerType){var F=g(s);switch(s.containerType){case"tab":m===n.N&&(m=n.Forced,o+="<uib-tabset>"),o+=F.before,o+=y(s.content,null,a),o+=F.after;break;case"tabset":m=n.Y,o+=F.before,o+=y(s.content,null,a),o+=F.after;break;default:o+=F.before,o+=y(s.content,null,a),o+=F.after}l=!1}else if(a.subkey){var E=angular.isArray(c[a.subkey])?c[a.subkey][0].keyList:c[a.subkey].keyList;_.find(E,function(e,t){return c[a.subkey].path+"."+t===s.name})&&(l=!1)}l&&(b(s),o+=h(s,a))}else console.log("Empty array passed to processInstructions"),o="";return o},w=c.$watch(d.schema,function(r){if(r&&(r=angular.isArray(r)?r:[r],r.length>0)){w();var i="",l=d.model||"record",p=c[l];if(p=p||{},!d.subschema&&!d.model||d.forceform){c.topLevelFormName=d.name||"myForm";var g="";for(var h in d)d.hasOwnProperty(h)&&"$"!==h[0]&&-1===["name","formstyle","schema","subschema","model"].indexOf(h)&&(g+=" "+d.$attr[h]+'="'+d[h]+'"');i='<form name="'+c.topLevelFormName+'" class="'+v(d.formstyle)+' novalidate"'+g+">"}else i="";if(p===c.topLevelFormName)throw new Error("Model and Name must be distinct - they are both "+p);if(i+=y(r,!0,d),m===n.Forced&&(i+="</uib-tabset>"),i+=d.subschema?"":"</form>",u.replaceWith(e(i)(c)),f.length>0||a.modelControllers.length>0)var b=c.$watch("phase",function(e){if("ready"===e){b();for(var t=0;t<a.modelControllers.length;t++)a.modelControllers[t].onAllReady&&a.modelControllers[t].onAllReady(c);for(var n=0;n<f.length;n++){for(var r,i,s=f[n],l=angular.isArray(s.subkey)?s.subkey:[s.subkey],u=s.name.split("."),d=p;u.length>1;)d=d[u.shift()]||{};d=d[u[0]]=d[u[0]]||[];for(var m=0;m<l.length;m++){if(l[m].selectFunc){if(!c[l[m].selectFunc]||"function"!=typeof c[l[m].selectFunc])throw new Error("Subkey function "+l[m].selectFunc+" is not properly set up");r=c[l[m].selectFunc](p,s)}else{if(!l[m].keyList)throw new Error("Invalid subkey setup for "+s.name);var v=l[m].keyList;for(r=0;r<d.length;r++){i=!0;for(var g in v)if(v.hasOwnProperty(g)&&d[r][g]!==v[g]&&("undefined"==typeof d[r][g]||!d[r][g].text||d[r][g].text!==v[g])){i=!1;break}if(i)break}if(!i)switch(l[m].onNotFound){case"error":var h="Cannot find matching "+(l[m].title||l[m].path);o(function(){c.showError(h,"Unable to set up form correctly")}),r=-1;break;case"create":default:r=p[s.name].push(v)-1}}c["$_arrayOffset_"+s.name.replace(/\./g,"_")+"_"+m]=r}}}});t.$broadcast("formInputDone"),s.updateDataDependentDisplay&&p&&Object.keys(p).length>0&&s.updateDataDependentDisplay(p,null,!0,c)}},!0)}}}var n;!function(e){e[e.Y=0]="Y",e[e.N=1]="N",e[e.Forced=2]="Forced"}(n||(n={})),t.$inject=["$compile","$rootScope","$filter","$data","$timeout","cssFrameworkService","formGenerator","formMarkupHelper"],e.formInput=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{restrict:"A",templateUrl:"form-button-"+e.framework()+".html"}}t.$inject=["cssFrameworkService"],e.formButtons=t}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(t){function n(t){return{restrict:"AE",templateUrl:"search-"+t.framework()+".html",controller:e.controllers.SearchCtrl}}n.$inject=["cssFrameworkService"],t.globalSearch=n}(t=e.directives||(e.directives={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return function(e){var t=/([\:\-\_]+(.))/g;return e.replace(t,function(e,t,n,r){return r?n.toUpperCase():n})}}e.camelCase=t}(t=e.filters||(e.filters={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){return function(e,t){return e&&(e=e.replace(/(_|\.)/g," ").replace(/[A-Z]/g," $&").trim().replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()}),e=t?e.replace(/\s/g,""):e.replace(/\s{2,}/g," ")),e}}e.titleCase=t}(t=e.filters||(e.filters={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){function e(e,t,n,r){function a(e){for(var t in e)t===n&&l.push(e[t]),"$parent"===t&&a(e[t])}var o,i,s,l=[],c=[];if(n="addAll"+n,"string"==typeof r)for(o=r.split(" "),i=0;i<o.length;i++)c.push(o[i]);if(a(e),void 0!==t[n]&&"string"==typeof t[n])for(o=t[n].split(" "),i=0;i<o.length;i++)0===o[i].indexOf("class=")?c.push(o[i].substring(6,o[i].length)):l.push(o[i]);return r=c.length>0?' class="'+c.join(" ")+'" ':" ",s=l.length>0?l.join(" ")+" ":"",r+s}this.getAddAllGroupOptions=function(t,n,r){return e(t,n,"Group",r)},this.getAddAllFieldOptions=function(t,n,r){return e(t,n,"Field",r)},this.getAddAllLabelOptions=function(t,n,r){return e(t,n,"Label",r)},this.addAll=function(e,t,n,r){var a="getAddAll"+t+"Options";return this[a](e,r,n)||[]}}e.addAllService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e={framework:"bs2"};return{setOptions:function(t){angular.extend(e,t)},$get:function(){return{framework:function(){return e.framework},setFrameworkForDemoWebsite:function(t){e.framework=t},span:function(t){var n;switch(e.framework){case"bs2":n="span"+t;break;case"bs3":n="col-xs-"+t}return n},offset:function(t){var n;switch(e.framework){case"bs2":n="offset"+t;break;case"bs3":n="col-lg-offset-"+t}return n},rowFluid:function(){var t;switch(e.framework){case"bs2":t="row-fluid";break;case"bs3":t="row"}return t}}}}}e.cssFrameworkService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e={record:{},disableFunctions:{},dataEventFunctions:{},modelControllers:[]};return e}e.$data=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){function n(e,t,n){void 0===t&&(t=""),t=t||"",angular.forEach(e,function(e){o.when(t+e.route,angular.extend(e.options||{templateUrl:e.templateUrl},n))}),s.variantsForDemoWebsite&&angular.forEach(s.variantsForDemoWebsite,function(r){angular.forEach(e,function(e){o.when(t+r+e.route,angular.extend(e.options||{templateUrl:e.templateUrl},n))})})}function r(e,t,n){void 0===t&&(t=""),t=t||"",angular.forEach(e,function(e){i.state(e.state,angular.extend(e.options||{url:t+e.route,templateUrl:e.templateUrl},n))})}function a(e,t,n,r,a,o){var i,s=r?"/"+r:"",l=e+"/"+n,c=o?"/"+o:"";switch(t){case"list":i=l+s;break;case"edit":i=l+s+"/"+a+"/edit"+c;break;case"new":i=l+s+"/new"+c}return i}var o,i,s={hashPrefix:"",html5Mode:!1,routing:"ngroute",prefix:""},l=[{route:"/analyse/:model/:reportSchemaName",state:"analyse::model::report",templateUrl:"partials/base-analysis.html"},{route:"/analyse/:model",state:"analyse::model",templateUrl:"partials/base-analysis.html"},{route:"/:model/:id/edit",state:"model::edit",templateUrl:"partials/base-edit.html"},{route:"/:model/:id/edit/:tab",state:"model::edit::tab",templateUrl:"partials/base-edit.html"},{route:"/:model/new",state:"model::new",templateUrl:"partials/base-edit.html"},{route:"/:model",state:"model::list",templateUrl:"partials/base-list.html"},{route:"/:model/:form/:id/edit",state:"model::form::edit",templateUrl:"partials/base-edit.html"},{route:"/:model/:form/:id/edit/:tab",state:"model::form::edit::tab",templateUrl:"partials/base-edit.html"},{route:"/:model/:form/new",state:"model::form::new",templateUrl:"partials/base-edit.html"},{route:"/:model/:form",state:"model::form::list",templateUrl:"partials/base-list.html"}],c=null,u={};return{start:function(a){switch(angular.extend(s,a),s.prefix[0]&&"/"!==s.prefix[0]&&(s.prefix="/"+s.prefix),t.html5Mode(s.html5Mode),""!==s.hashPrefix&&t.hashPrefix(s.hashPrefix),s.routing){case"ngroute":o=e.get("$routeProvider"),s.fixedRoutes&&n(s.fixedRoutes),n(l,s.prefix,a.add2fngRoutes);break;case"uirouter":i=e.get("$stateProvider"),s.fixedRoutes&&r(s.fixedRoutes),setTimeout(function(){r(l,s.prefix,a.add2fngRoutes)})}},$get:function(){return{router:function(){return s.routing},prefix:function(){return s.prefix},parsePathFunc:function(){return function(e){if(e!==c){c=e,u={newRecord:!1},s.prefix.length>0&&0===e.indexOf(s.prefix)&&(e=e.slice(s.prefix.length));var t=e.split("/");s.variants&&-1!==s.variants.indexOf(t[1])&&(u.variant=t[1],t.shift());var n=t.length;if("analyse"===t[1])u.analyse=!0,u.modelName=t[2],u.reportSchemaName=n>=4?t[3]:null;else{u.modelName=t[1];var r,a=[t[n-1],t[n-2]],o=a.indexOf("new");-1===o?(r=a.indexOf("edit"),-1!==r&&(n-=2+r,u.id=t[n])):(u.newRecord=!0,n-=1+o),(1===r||1===o)&&(u.tab=a[0]),n>2&&(u.formName=t[2])}}return u}},buildUrl:function(e){var t=s.html5Mode?"":"#";return t+=s.hashPrefix,t+=s.prefix,t[0]&&(t+="/"),t+="/"===e[0]?e.slice(1):e},buildOperationUrl:function(e,t,n,r,o){return a(s.prefix,e,t,n,r,o)},redirectTo:function(){return function(e,t,n,r,o){n.search()&&n.url(n.path());var i=a(s.prefix,e,t.modelName,t.formName,r,o);n.path(i)}}}}}}t.$inject=["$injector","$locationProvider"],e.routingService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o){function i(e,t,n,r,a,o,l,c){function m(e,t){var n=angular.copy(e),r=_.find(l.tabs,function(e){return e.title===n});if(!r){if(0===l.tabs.length&&l.formSchema.length>0){l.tabs.push({title:"Main",content:[],active:"Main"===l.tab||!l.tab}),r=l.tabs[0];for(var a=0;a<l.formSchema.length;a++)r.content.push(l.formSchema[a])}r=l.tabs[l.tabs.push({title:n,containerType:"tab",content:[],active:n===l.tab})-1]}r.content.push(t)}for(var v in t)if("_id"!==v&&t.hasOwnProperty(v)){var g=t[v],h=g.options||{},b=h.form||{};if(g.schema&&!b.hidden){if(o&&n){var y=[];i("Nested "+v,g.schema,y,null,v+".",!0,l,c);var w=u(v,b,a);w.schema=y,b.tab&&m(b.tab,w),void 0!==b.order?n.splice(b.order,0,w):n.push(w)}}else{if(n&&!b.hidden){var k=u(v,b,a);if(p(k.showIf,k.name,l)&&"options"!==v){var x=s(k,g,h,l,c);x.tab&&m(x.tab,x),void 0!==b.order?n.splice(b.order,0,x):n.push(x)}}r&&h.list&&d(r,h.list,v)}}r&&0===r.length&&f(e,r,n,t)}function s(a,s,c,u,d){var f;if(s.caster&&(a.array=!0,s=s.caster,angular.extend(c,s.options),s.options&&s.options.form&&angular.extend(a,s.options.form)),"String"===s.instance)c["enum"]?(a.type=a.type||"select",a.select2?(u.conversions[a.name]=a.select2,c.required&&(u.$watch("record."+a.name,function(e){l(e,a.id,a.select2,d)},!0),setTimeout(function(){l(u.record[a.name],a.id,a.select2,d)},0)),a.select2===!0&&(a.select2={}),a.select2.s2query="select2"+a.name.replace(/\./g,"_"),u[a.select2.s2query]={allowClear:!c.required,initSelection:function(e,n){function r(){function i(t,n,r){if(n)if(0===t.length)r(n);else{if(angular.isArray(n)){var a=e.context.getAttribute("ng-model"),o=a.indexOf("."+t[0]);a=a.slice(0,o),o=a.lastIndexOf("."),a=a.slice(o+1),a=/.+\[(.+)\]/.exec(a),n=n[u[a[1]]]}n=n[t.shift()],i(t,n,r)}}var s=u.record;if(s){var c=a.name.split(".");i(c,s,function(t){if(setTimeout(l(t,a.id,a.select2,d)),t)if(a.array){var r=parseInt(e.context.id.match("_[0-9].*$")[0].slice(1));t[r].x&&o.preservePristine(e,function(){n(t[r].x)})}else o.preservePristine(e,function(){n(t)})})}else t(r)}t(r)},query:function(e){for(var t={results:[]},n=e.term.toUpperCase(),r=0;r<c["enum"].length;r++)-1!==c["enum"][r].toUpperCase().indexOf(n)&&t.results.push({id:r,text:c["enum"][r]});e.callback(t)}},_.extend(u[a.select2.s2query],a.select2),a.select2===!0&&(a.select2={}),u.select2List.push(a.name)):(a.options=o.suffixCleanId(a,"Options"),u[a.options]=c["enum"])):(a.type||(a.type=-1!==a.name.toLowerCase().indexOf("password")?"password":"text"),c.match&&(a.add='pattern="'+c.match+'" '+(a.add||"")));else if("ObjectID"===s.instance)a.ref=c.ref,a.link&&a.link.linkOnly?(a.type="link",a.linkText=a.link.text,a.form=a.link.form,delete a.link):(a.type="select",a.select2||c.form&&c.form.select2?(a.select2||(a.select2=c.form.select2),a.select2===!0&&(a.select2={}),u.select2List.push(a.name),u.conversions[a.name]=a.select2,a.select2.fngAjax?(f="ajax"+a.name.replace(/\./g,""),c.required||a.placeHolder||(a.placeHolder="Select..."),u[f]={allowClear:!c.required,minimumInputLength:2,initSelection:function(t,n){var a=t.val();a&&""!==a&&r.getListAttributes(c.ref,a).success(function(r){r.success===!1&&e.path("/404");var i={id:a,text:r.list};o.preservePristine(t,function(){n(i)})}).error(u.handleHttpError)},ajax:{url:"/api/search/"+c.ref,data:function(e,t){var n,r={q:e,pageLimit:10,page:t};return"object"==typeof c.form.searchQuery?n=c.form.searchQuery:"function"==typeof c.form.searchQuery&&(n=c.form.searchQuery(u,c)),n&&_.extend(r,n),r},results:function(e){return{results:e.results,more:e.moreCount>0}}}},_.extend(u[f],a.select2),a.select2.fngAjax=f):(a.select2===!0&&(a.select2={}),a.select2.s2query="select2"+a.name.replace(/\./g,"_"),u["select2"+a.select2.s2query]={allowClear:!c.required,initSelection:function(e,t){var n=e.val();if(""!==n&&u[a.ids].length>0){var r=o.convertIdToListValue(n,u[a.ids],u[a.options],a.name),i={id:n,text:r};t(i)}},query:function(e){for(var t={results:[]},n=e.term.toUpperCase(),r=0;r<u[a.options].length;r++)-1!==u[a.options][r].toUpperCase().indexOf(n)&&t.results.push({id:u[a.ids][r],text:u[a.options][r]});e.callback(t)}},_.extend(u[a.select2.s2query],a.select2),a.options=o.suffixCleanId(a,"Options"),a.ids=o.suffixCleanId(a,"_ids"),o.setUpSelectOptions(c.ref,a,u,d,i))):a.directive&&a[n("camelCase")(a.directive)]&&a[n("camelCase")(a.directive)].fngAjax||(a.options=o.suffixCleanId(a,"Options"),a.ids=o.suffixCleanId(a,"_ids"),o.setUpSelectOptions(c.ref,a,u,d,i)));else if("Date"===s.instance)a.type||(a.readonly?a.type="text":(a.type="text",a.add="ui-date ui-date-format datepicker-popup-fix "));else if("boolean"===s.instance.toLowerCase())a.type="checkbox";else{if("Number"!==s.instance)throw new Error("Field "+a.name+" is of unsupported type "+s.instance);a.type="number",c.min&&(a.add='min="'+c.min+'" '+(a.add||"")),c.max&&(a.add='max="'+c.max+'" '+(a.add||"")),a.step&&(a.add='step="'+a.step+'" '+(a.add||""))}return c.required&&(a.required=!0),c.readonly&&(a.readonly=!0),a}function l(e,t,n,r){var a="#"+(n?"cg_":"")+t,o=angular.element(document.querySelector(a));e?o.removeClass(r.fngInvalidRequired):o.addClass(r.fngInvalidRequired)}function c(e,t){for(var n=e.split("."),r=t.record,a=0,o=n.length;o>a;a++)r[n[a]]||(a===o-1?r[n[a]]=[]:r[n[a]]={}),r=r[n[a]];return r}var u=function(e,t,n){return t.name=n+e,t},d=function(e,t,n){"object"==typeof t?(t.name=n,e.push(t)):e.push({name:n})},f=function(e,t,n,r){if(n){for(var a=0,o=n.length;o>a;a++)if("text"===n[a].type){t.push({name:n[a].name});break}0===t.length&&0!==n.length&&t.push({name:n[0].name})}if(0===t.length){for(var i in r)if("_id"!==i&&r.hasOwnProperty(i)){t.push({name:i});break}if(0===t.length)throw new Error("Unable to generate a title for "+e)}},m=function(e,t,n){function r(e){var r=e;if("string"==typeof e&&"$"===e.slice(0,1)){var a=e.split(".");switch(a.length){case 1:r=o.getListData(t,e.slice(1),n);break;case 2:r=o.getListData(t,a[1],n);break;default:throw new Error("Unsupported showIf format")}}return r}var a,i=r(e.lhs),s=r(e.rhs);switch(e.comp){case"eq":a=i===s;break;case"ne":a=i!==s;break;default:throw new Error("Unsupported comparator "+e.comp)}return a},p=function(e,t,n){function r(e){if("string"==typeof e&&"$"===e.slice(0,1)){var r=e.slice(1),o=n.dataDependencies[r]||[];o.push(t),n.dataDependencies[r]=o,a+=1}}var a=0,o=!0;return e&&(r(e.lhs),r(e.rhs),0!==a||m(e,void 0,n.select2List)||(o=!1)),o};return{generateEditUrl:function(e,t){return a.buildUrl(t.modelName+"/"+(t.formName?t.formName+"/":"")+e._id+"/edit")},generateNewUrl:function(e){return a.buildUrl(e.modelName+"/"+(e.formName?e.formName+"/":"")+"new")},handleFieldType:s,handleSchema:i,updateDataDependentDisplay:function(e,t,n,r){var a,o,i,s,l,c;for(var u in r.dataDependencies)if(r.dataDependencies.hasOwnProperty(u)){var d=u.split(".");if(1===d.length){if(n||!t||e[u]!==t[u])for(a=r.dataDependencies[u],o=0;o<a.length;o+=1){var f=a[o];for(i=0;i<r.formSchema.length;i+=1)r.formSchema[i].name===f&&(l=angular.element(document.querySelector("#cg_"+r.formSchema[i].id)),m(r.formSchema[i].showIf,e,r.select2List)?l.removeClass("ng-hide"):l.addClass("ng-hide"))}}else{if(2!==d.length)throw new Error("You can only go down one level of subdocument with showIf");if(void 0===c&&(c=!0),e[d[0]])for(s=0;s<e[d[0]].length;s++)if(n||!t||!t[d[0]]||!t[d[0]][s]||e[d[0]][s][d[1]]!==t[d[0]][s][d[1]])for(a=r.dataDependencies[u],o=0;o<a.length;o+=1){var p=a[o].split(".");if(2!==p.length)throw new Error("Conditional display must control dependent fields at same level ");for(i=0;i<r.formSchema.length;i+=1)if(r.formSchema[i].name===p[0])for(var v=r.formSchema[i].schema,g=0;g<v.length;g++)v[g].name===a[o]&&(l=angular.element(document.querySelector("#f_"+p[0]+"List_"+s+" #cg_f_"+a[o].replace(".","_"))),0===l.length?l=angular.element(document.querySelector("#f_elements-"+s+"-"+p[1])):c=!1,l.length>0&&(m(r.formSchema[i].schema[g].showIf,e[d[0]][s],r.select2List)?l.show():l.hide()))}}}return c},add:function(e,t,n){var r=c(e,n);r.push({}),n.setFormDirty(t)},unshift:function(e,t,n){var r=c(e,n);r.unshift({}),n.setFormDirty(t)},remove:function(e,t,n,r){for(var a=e.split("."),o=r.record,i=0,s=a.length;s>i;i++)o=o[a[i]];o.splice(t,1),r.setFormDirty(n)},hasError:function(e,t,n,r){var a=!1;if(r){var o=r[r.topLevelFormName];if("null"!==e&&(o=o[e.replace("$index",n)]),o){var i=o[t];i&&i.$invalid&&(i.$dirty?a=!0:angular.forEach(i.$validators,function(e,t){"required"!==t&&i.$error[t]&&(a=!0)}))}}else console.log("hasError called with no scope! ",e,t,n);return a},decorateScope:function(e,t,n,r){e.record=r.record,e.phase="init",e.disableFunctions=r.disableFunctions,e.dataEventFunctions=r.dataEventFunctions,e.topLevelFormName=void 0,e.formSchema=[],e.tabs=[],e.listSchema=[],e.recordList=[],e.dataDependencies={},e.select2List=[],e.conversions={},e.pageSize=60,e.pagesLoaded=0,r.baseScope=e,e.generateEditUrl=function(n){return t.generateEditUrl(n,e)},e.generateNewUrl=function(){return t.generateNewUrl(e)},e.scrollTheList=function(){return n.scrollTheList(e)},e.getListData=function(t,r){return n.getListData(t,r,e.select2List)},e.setPristine=function(t){t&&e.dismissError(),e[e.topLevelFormName]&&e[e.topLevelFormName].$setPristine()},e.skipCols=function(e){return e>0?"col-md-offset-3":""},e.setFormDirty=function(e){if(e){var t=angular.element(e.target).inheritedData("$formController");t.$setDirty()}else console.log("setFormDirty called without an event (fine in a unit test)")},e.add=function(n,r){return t.add(n,r,e)},e.hasError=function(n,r,a){return t.hasError(n,r,a,e)},e.unshift=function(n,r){return t.unshift(n,r,e)},e.remove=function(n,r,a){return t.remove(n,r,a,e)},e.openSelect2=function(e){$("#"+$(e.currentTarget).data("select2-open")).select2("open")},e.toJSON=function(e){return"The toJSON function is deprecated - use the json filter instead\n\n"+JSON.stringify(e,null,2)+"\n\n*** The toJSON function is deprecated - use the json filter instead ***"},e.baseSchema=function(){return e.tabs.length?e.tabs:e.formSchema}}}}e.formGenerator=t,t.$inject=["$location","$timeout","$filter","SubmissionsService","routingService","recordHandler"]}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n){function r(e,t){function n(e){var n=e;if("string"==typeof e)if("$"===e.slice(0,1)){n=(t||"record")+".";var r=e.slice(1).split(".");if(r.length>1){var a=r.pop();n+=r.join(".")+"[$index]."+a}else n+=e.slice(1)}else n="'"+e+"'";return n}var r=["eq","ne","gt","gte","lt","lte"],a=["===","!==",">",">=","<","<="],o=r.indexOf(e.comp);if(-1===o)throw new Error("Invalid comparison in showWhen");return n(e.lhs)+a[o]+n(e.rhs)}function a(){return"bs2"===e.framework()?"icon":"glyphicon glyphicon";
}var o=function(e){return!e||"undefined"===e||-1===["vertical","inline"].indexOf(e)};return{isHorizontalStyle:o,fieldChrome:function(a,i,s){var l="",c="",u="",d="";if(i.showWhen=i.showWhen||i.showwhen,i.showWhen&&(d+="string"==typeof i.showWhen?'ng-show="'+i.showWhen+'"':'ng-show="'+r(i.showWhen,s.model)+'"'),d+=' id="cg_'+i.id.replace(/\./g,"-")+'"',"bs3"===e.framework()){l="form-group","vertical"===s.formstyle&&"block-level"!==i.size&&(c+='<div class="row">',l+=" col-sm-"+t.sizeAsNumber(i.size),u+="</div>");var f,m=null,p=i.name.split(".");s&&"undefined"!=typeof s.subkeyno?f=s.subschemaroot.replace(/\./g,"-")+"-subkey"+s.subkeyno+"-"+p[p.length-1]:s.subschema?(m="form_"+p.slice(0,-1).join("_")+"$index",f=i.name.replace(/\./g,"-")):f="f_"+i.name.replace(/\./g,"_"),c+="<div"+n.addAll(a,"Group",l,s)+" ng-class=\"{'has-error': hasError('"+m+"','"+f+"', $index)}\"",u+="</div>"}else o(s.formstyle)?(c+="<div"+n.addAll(a,"Group","control-group",s),u="</div>"):(c+="<span ",u="</span>");return c+=(d||"")+">",{template:c,closeTag:u}},label:function(t,r,i,s){var l="";if("bs3"===e.framework()||"inline"!==s.formstyle&&""!==r.label||i){l="<label";var c="control-label";o(s.formstyle)?(l+=' for="'+r.id+'"',"undefined"!=typeof r.labelDefaultClass?c+=" "+r.labelDefaultClass:"bs3"===e.framework()&&(c+=" col-sm-3")):"inline"===s.formstyle&&(l+=' for="'+r.id+'"',c+=" sr-only"),l+=n.addAll(t,"Label",null,s)+' class="'+c+'">'+r.label,i&&(l+=' <i id="add_'+r.id+'" ng-click="add(\''+r.name+'\',$event)" class="'+a()+'-plus-sign"></i>'),l+="</label>"}return l},glyphClass:a,allInputsVars:function(r,a,o,i,s,l){var c,u=a.placeHolder,d="",f="",m="",p="";return"bs3"===e.framework()?(d=-1===["horizontal","vertical","inline"].indexOf(o.formstyle)?" input-sm":"",f="col-sm-"+t.sizeAsNumber(a.size),p=" form-control"):m=a.size?" input-"+a.size:"","inline"===o.formstyle&&(u=u||a.label),c='ng-model="'+i+'"'+(s?' id="'+s+'" name="'+s+'" ':' name="'+l+'" '),c+=u?'placeholder="'+u+'" ':"",a.popup&&(c+='title="'+a.popup+'" '),c+=n.addAll(r,"Field",null,o),{common:c,sizeClassBS3:f,sizeClassBS2:m,compactClass:d,formControl:p}},inputChrome:function(t,n,r,a){return"bs3"===e.framework()&&o(r.formstyle)&&"checkbox"!==n.type&&(t='<div class="bs3-input '+a.sizeClassBS3+'">'+t+"</div>"),n.helpInline&&(t+='<span class="'+("bs2"===e.framework()?"help-inline":"help-block")+'">'+n.helpInline+"</span>"),t+='<div ng-if="'+(r.name||"myForm")+"."+n.id+'.$dirty" class="help-block"> <div ng-messages="'+(r.name||"myForm")+"."+n.id+'.$error">  <div ng-messages-include="error-messages.html">  </div> </div></div>',n.help&&(t+='<span class="help-block">'+n.help+"</span>"),t},generateSimpleInput:function(t,n,r){var a="<input "+t+'type="'+n.type+'"';return"inline"!==r.formstyle||"bs2"!==e.framework()||n.size||(a+='class="input-small"'),a+=" />"},controlDivClasses:function(t){var n=[];return o(t.formstyle)&&n.push("bs2"===e.framework()?"controls":"col-sm-9"),n},handleInputAndControlDiv:function(e,t){return t.length>0&&(e='<div class="'+t.join(" ")+'">'+e+"</div>"),e},handleArrayInputAndControlDiv:function(t,n,r,o){var i="<div ";return"bs3"===e.framework()&&(i+='ng-class="skipCols($index)" '),i+='class="'+n.join(" ")+'" id="'+r.id+'List" ',i+='ng-repeat="arrayItem in '+(o.model||"record")+"."+r.name+' track by $index">',i+=t,"link"!==r.type&&(i+="<i ng-click=\"remove('"+r.name+'\',$index,$event)" id="remove_'+r.id+'_{{$index}}" class="'+a()+'-minus-sign"></i>'),i+="</div>"},addTextInputMarkup:function(e,t,n){var r="",a=e.formControl.trim()+e.compactClass+e.sizeClassBS2+(t["class"]?" "+t["class"]:"");return 0!==a.length&&(r+='class="'+a+'"'),t.add&&(r+=" "+t.add+" "),r+=n+(t.readonly?" readonly":"")+" "}}}t.$inject=["cssFrameworkService","inputSizeHelper","addAllService"],e.formMarkupHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(){var e=[1,2,4,6,8,10,12],t=["mini","small","medium","large","xlarge","xxlarge","block-level"],n=2;return{sizeMapping:e,sizeDescriptions:t,defaultSizeOffset:n,sizeAsNumber:function(r){return e[r?t.indexOf(r):n]}}}e.inputSizeHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{extractFromAttr:function(e,t){function n(e){var t=e.replace(/&quot;/g,'"');return"true"===t?t=!0:"false"===t?t=!1:!isNaN(parseFloat(t))&&isFinite(t)&&(t=parseFloat(t)),t}var r={},a={formStyle:e.formstyle},o={},i=t?t.length:0;for(var s in e)e.hasOwnProperty(s)&&("fngFld"===s.slice(0,6)?r[s.slice(6).toLowerCase()]=n(e[s]):"fngOpt"===s.slice(0,6)?a[s.slice(6).toLowerCase()]=n(e[s]):t&&s.slice(0,i)===t&&(o[s.slice(i).toLowerCase()]=n(e[s])));return{info:r,options:a,directiveOptions:o}},buildInputMarkup:function(t,n,r,a,o,i,s){var l,c,u,d=e.fieldChrome(t,r,a,' id="cg_'+r.id+'"'),f=e.controlDivClasses(a),m=d.template+e.label(t,r,o,a);if(o?(l="arrayItem"+(i?".x":""),c=r.id+"_{{$index}}",u=r.name+"_{{$index}}"):(l=n+"."+r.name,c=r.id,u=r.name),a.subschema&&-1!==r.name.indexOf(".")){var p=n+".",v=r.name,g=a.subschemaroot,h=v.slice(g.length+1);l=p,a.index?(l+=g+"["+a.index+"]."+h,c="f_"+l.slice(p.length).replace(/(\.|\[|\]\.)/g,"-")):(l+=g,a.subkey?(c=l.slice(p.length).replace(/\./g,"-")+"-subkey"+a.subkeyno+"-"+h,l+="[$_arrayOffset_"+g.replace(/\./g,"_")+"_"+a.subkeyno+"]."+h):(l+="[$index]."+h,c=null,u=v.replace(/\./g,"-")))}var b=e.allInputsVars(t,r,a,l,c,u);return m+=e["handle"+(o?"Array":"")+"InputAndControlDiv"](e.inputChrome(s(b),r,a,b),f,r,a),m+=d.closeTag},findIdInSchemaAndFlagNeedX:function t(e,n){for(var r=!1,a=0;a<e.length;a++){var o=e[a];if(o.id===n){o.needsX=!0,r=!0;break}if(o.schema&&t(o.schema,n)){r=!0;break}}return r}}}t.$inject=["formMarkupHelper"],e.pluginHelper=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t,n,r,a,o,i){function s(e){var t=e.split("."),n=[t[0]];return t.length>1&&n.push(t.slice(1).join(".")),n}function l(e,t,n){var r=s(e);if(r.length>1)c(r[1],t[r[0]],n);else if(t[r[0]]){var a=t[r[0]];if(angular.isArray(a))for(var o=a.length-1;o>=0;o--){var i=typeof a[o];("undefined"===i||"object"===i&&0===Object.keys(a[o]).length)&&a.splice(o,1)}t[r[0]]=n(a)}}function c(e,t,n){if(void 0!==t)if(angular.isArray(t))for(var r=0;r<t.length;r++)l(e,t[r],n);else l(e,t,n)}function u(e,t,n,r){if(e.array){for(var a=[],o=!e.directive||w(e),i=0;i<t.length;i++){var s=t[i];s&&s.x&&(s=s.x);var l=$(s,r,n,e.name);o&&(l={x:l}),a.push(l)}return a}return e.select2?{id:t,text:$(t,r,n,e.name)}:$(t,r,n,e.name)}function d(e,t,n,r){if(e.array){for(var a=[],o=0;o<t.length;o++)a.push(x(t[o],n,r,e.name));return a}return x(t,n,r,e.name)}function f(e,t,n,r,a){var o=!t.id&&!t.newRecord;if(n.handleSchema("Main "+t.modelName,e,o?null:t.formSchema,t.listSchema,"",!0,t,a),o)a.allowLocationChange=!0;else{var i=!0;t.$watch("record",function(e,r){e!==r&&(i=n.updateDataDependentDisplay(e,r,i,t))},!0),t.id?"function"==typeof t.dataEventFunctions.onBeforeRead?t.dataEventFunctions.onBeforeRead(t.id,function(e){e?t.showError(e):r.readRecord(t,a)}):r.readRecord(t,a):(a.master={},t.phase="ready",t.cancel())}}function m(e){return function(t,r){if(-1!==[200,400].indexOf(r)){var a="";for(var o in t.errors)if(t.errors.hasOwnProperty(o)){switch(a+="<li><b>"+n("titleCase")(o)+": </b> ",t.errors[o].type){case"enum":a+="You need to select from the list of values";break;default:a+=t.errors[o].message}a+="</li>"}a=a.length>0?t.message+"<br /><ul>"+a+"</ul>":t.message||"Error!  Sorry - No further details available.",e.showError(a)}else e.showError(r+" "+JSON.stringify(t))}}var p=function(e,t){return(e.id||"f_"+e.name).replace(/\./g,"_")+t},v=function(e,t,n){for(var r=t.split("."),a=r.length-1,o=e,i=0;a>i&&(o=angular.isArray(o)?_.map(o,function(e){return e[r[i]]}):o[r[i]],angular.isArray(o)&&n&&n.scope&&"function"==typeof n.scope&&(o=o[n.scope().$index]),o);i++);return{lastObject:o,key:o?r[a]:void 0}},g=function(e,t,n,r){var a=v(e,t,n);if(a.lastObject&&a.key)if(angular.isArray(a.lastObject))for(var o=0;o<a.lastObject.length;o++)a.lastObject[o][a.key]=r[o];else a.lastObject[a.key]=r},h=function(e,t,n){var r,a=v(e,t,n);return a.lastObject&&a.key&&(r=angular.isArray(a.lastObject)?_.map(a.lastObject,function(e){return e[a.key]}):a.lastObject[a.key]),r},b=function(e,t,n){if(!t.topLevelFormName||t[t.topLevelFormName].$pristine){l(e.name,n.master,function(n){return u(e,n,t[p(e,"Options")],t[p(e,"_ids")])});var r=h(n.master,e.name);r&&g(t.record,e.name,void 0,r)}},y=function(e,t,n){for(var r=t.split("."),a=0;a<r.length;a++)void 0!==e&&null!==e&&(e=e[r[a]]);return e&&-1!==n.indexOf(r[a-1])&&(e=e.text||e),void 0===e&&(e=""),e},w=function(e){var t=!1;return"text"===e.type?t=!0:(e.needsX||"select"===e.type&&!e.ids&&!e.directive)&&(t=!0),t},k=function(e,t,n,r,a){a=a||t;for(var o=0;o<e.length;o++){var i=e[o],s=i.name.slice(n),l=h(t,s);if(i.schema){if(l)for(var c=0;c<l.length;c++)l[c]=k(i.schema,l[c],n+1+s.length,r,a)}else{var d=y(t,s,r.select2List);if(i.array&&w(i)&&d)for(var f=0;f<d.length;f++)d[f]={x:d[f]};var m=r[p(i,"_ids")];if(l&&m&&m.length>0){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 332");t[s]=u(i,l,r[p(i,"Options")],m)}else if(i.select2&&!i.select2.fngAjax){if(l)if(i.array)for(var v=0;v<l.length;v++)r[i.select2.s2query].query({term:l[v].x.text||l[v].text||l[v].x||l[v],callback:function(e){if(e.results.length>0)if(l[v].x){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 342");t[s][v].x=e.results[0]}else{if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 345");t[s][v]=e.results[0]}}});else r[i.select2.s2query].query({term:l,callback:function(e){if(e.results.length>0){if(-1!==s.indexOf("."))throw new Error("Trying to directly assign to a nested field 357");t[s]=e.results[0]}}})}else if(i.select2)void i.select2;else if(l&&r.conversions[i.name]&&r.conversions[i.name].fngajax&&!r.conversions[i.name].noconvert){var b=i;r.conversions[b.name].fngajax(l,b,function(e,t){g(a,e.name,void 0,t),C(angular.element("#"+e.id),function(){g(r.record,e.name,void 0,t)})})}}}return t},x=function(e,t,n,r){var a=_.isObject(e)?e.x||e.text:e;if(a&&a.match(/^[0-9a-f]{24}$/))return a;var o=t.indexOf(a);if(-1===o)throw new Error("convertListValueToId: Invalid data - value "+a+" not found in "+t+" processing "+r);return n[o]},C=function(e,t){var n=e.inheritedData("$ngModelController"),r=n&&n.$pristine;r&&(n.$pristine=!1),t(),r&&(n.$pristine=!0)},$=function(e,t,n,r){var a=t.indexOf(e);if(-1===a)throw new Error("convertIdToListValue: Invalid data - id "+e+" not found in "+t+" processing "+r);return n[a]},S=function(e,t,n){n.master=k(t.formSchema,e,0,t),t.phase="ready",t.cancel()};return{readRecord:function(t,n){o.readRecord(t.modelName,t.id).success(function(r){r.success===!1&&e.path("/404"),n.allowLocationChange=!1,t.phase="reading","function"==typeof t.dataEventFunctions.onAfterRead&&t.dataEventFunctions.onAfterRead(r),S(r,t,n)}).error(t.handleHttpError)},scrollTheList:function(t){var n=t.pagesLoaded;o.getPagedAndFilteredList(t.modelName,{aggregate:e.$$search.a,find:e.$$search.f,limit:t.pageSize,skip:n*t.pageSize,order:e.$$search.o}).success(function(e){angular.isArray(e)?n===t.pagesLoaded?(t.pagesLoaded++,t.recordList=t.recordList.concat(e)):console.log("DEBUG: infinite scroll component asked for a page twice"):t.showError(e,"Invalid query")}).error(t.handleHttpError)},deleteRecord:function(t,n,r,i){o.deleteRecord(t,n).success(function(){"function"==typeof r.dataEventFunctions.onAfterDelete&&r.dataEventFunctions.onAfterDelete(i.master),a.redirectTo()("list",r,e)})},updateDocument:function(e,n,r,a){r.phase="updating",o.updateRecord(r.modelName,r.id,e).success(function(e){e.success!==!1?("function"==typeof r.dataEventFunctions.onAfterUpdate&&r.dataEventFunctions.onAfterUpdate(e,a.master),n.redirect?(n.allowChange&&(a.allowLocationChange=!0),t.location=n.redirect):(S(e,r,a),r.setPristine(!1))):r.showError(e)}).error(r.handleHttpError)},createNew:function(n,r,i){o.createRecord(i.modelName,n).success(function(n){n.success!==!1?("function"==typeof i.dataEventFunctions.onAfterCreate&&i.dataEventFunctions.onAfterCreate(n),r.redirect?t.location=r.redirect:a.redirectTo()("edit",i,e,n._id)):i.showError(n)}).error(i.handleHttpError)},getListData:y,suffixCleanId:p,setData:g,setUpSelectOptions:function(e,t,n,r,a){var s=n[t.options]=[],l=n[t.ids]=[];i.getSchema(e).success(function(i){var c=[];a("Lookup "+e,i,null,c,"",!1,n,r);var u;"undefined"!=typeof t.filter&&t.filter?(console.log("filtering"),u=o.getPagedAndFilteredList(e,t.filter)):u=o.getAll(e),u.success(function(e){if(e){for(var a=0;a<e.length;a++){for(var o="",i=0;i<c.length;i++)o+=e[a][c[i].name]+" ";o=o.trim();var u=_.sortedIndex(s,o);s[u]===o&&(o=o+"    ("+e[a]._id+")",u=_.sortedIndex(s,o)),s.splice(u,0,o),l.splice(u,0,e[a]._id)}b(t,n,r)}})})},preservePristine:C,convertToMongoModel:function D(e,t,n,r){function a(e,t){var n;return t.select2&&t.select2.fngAjax||r.conversions[t.name]&&r.conversions[t.name].fngajax?e&&(n=e.id||e):e&&(n=e.text||(e.x?e.x.text:e)),n}for(var o=0;o<e.length;o++){var i=e[o].name.slice(n),s=y(t,i,r.select2List);if(e[o].schema){if(s)for(var c=0;c<s.length;c++)s[c]=D(e[o].schema,s[c],n+1+i.length,r)}else{if(e[o].array&&w(e[o])&&s)for(var u=0;u<s.length;u++)s[u]=s[u].x;var f=r[p(e[o],"_ids")];if(f&&f.length>0)l(i,t,function(t){return d(e[o],t,r[p(e[o],"Options")],f)});else if(r.conversions[e[o].name]){var m,v=h(t,i,null);if(e[o].array){if(m=[],v)for(var b=0;b<v.length;b++)m[b]=a(v[b],e[o])}else m=a(v,e[o]);g(t,i,null,m)}}}return t},convertIdToListValue:$,handleError:m,decorateScope:function(n,o,i,s){n.handleHttpError=m(n),n.cancel=function(){angular.copy(s.master,n.record),n.$broadcast("fngCancel",n),r(n.setPristine)},n.$on("showErrorMessage",function(e,t){n.showError(t.body,t.title)}),n.showError=function(e,t){n.alertTitle=t?t:"Error!",n.errorMessage=e},n.dismissError=function(){delete n.errorMessage,delete n.alertTitle},n.save=function(e){e=e||{};var t=i.convertToMongoModel(n.formSchema,angular.copy(n.record),0,n);n.id?"function"==typeof n.dataEventFunctions.onBeforeUpdate?n.dataEventFunctions.onBeforeUpdate(t,s.master,function(r){r?n.showError(r):i.updateDocument(t,e,n,s)}):i.updateDocument(t,e,n,s):"function"==typeof n.dataEventFunctions.onBeforeCreate?n.dataEventFunctions.onBeforeCreate(t,function(r){r?n.showError(r):i.createNew(t,e,n)}):i.createNew(t,e,n)},n.newClick=function(){a.redirectTo()("new",n,e)},n.$on("$locationChangeStart",function(e,r){if(!s.allowLocationChange&&!n.isCancelDisabled()){e.preventDefault();var a=o.open({template:'<div class="modal-header">   <h3>Record modified</h3></div><div class="modal-body">   <p>Would you like to save your changes?</p></div><div class="modal-footer">    <button class="btn btn-primary dlg-yes" ng-click="yes()">Yes</button>    <button class="btn btn-warning dlg-no" ng-click="no()">No</button>    <button class="btn dlg-cancel" ng-click="cancel()">Cancel</button></div>',controller:"SaveChangesModalCtrl",backdrop:"static"});a.result.then(function(e){e?n.save({redirect:r,allowChange:!0}):(s.allowLocationChange=!0,t.location=r)})}}),n.deleteClick=function(){if(n.record._id){var e=o.open({template:'<div class="modal-header">   <h3>Delete Item</h3></div><div class="modal-body">   <p>Are you sure you want to delete this record?</p></div><div class="modal-footer">    <button class="btn btn-primary dlg-no" ng-click="cancel()">No</button>    <button class="btn btn-warning dlg-yes" ng-click="yes()">Yes</button></div>',controller:"SaveChangesModalCtrl",backdrop:"static"});e.result.then(function(e){e&&("function"==typeof n.dataEventFunctions.onBeforeDelete?n.dataEventFunctions.onBeforeDelete(s.master,function(e){e?n.showError(e):i.deleteRecord(n.modelName,n.id,n,s)}):i.deleteRecord(n.modelName,n.id,n,s))})}},n.isCancelDisabled=function(){return"function"==typeof n.disableFunctions.isCancelDisabled?n.disableFunctions.isCancelDisabled(n.record,s.master,n[n.topLevelFormName]):n[n.topLevelFormName]&&n[n.topLevelFormName].$pristine},n.isSaveDisabled=function(){return"function"==typeof n.disableFunctions.isSaveDisabled?n.disableFunctions.isSaveDisabled(n.record,s.master,n[n.topLevelFormName]):n[n.topLevelFormName]&&(n[n.topLevelFormName].$invalid||n[n.topLevelFormName].$pristine)},n.isDeleteDisabled=function(){return"function"==typeof n.disableFunctions.isDeleteDisabled?n.disableFunctions.isDeleteDisabled(n.record,s.master,n[n.topLevelFormName]):!n.id},n.isNewDisabled=function(){return"function"==typeof n.disableFunctions.isNewDisabled?n.disableFunctions.isNewDisabled(n.record,s.master,n[n.topLevelFormName]):!1},n.disabledText=function(e){var t="";return n.isSaveDisabled&&(t="This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. "+e),t},n.getVal=function(e,t){return-1===e.indexOf("$index")||"undefined"!=typeof t?(e=e.replace(/\$index/g,t),n.$eval("record."+e)):void 0}},fillFormFromBackendCustomSchema:f,fillFormWithBackendSchema:function(e,t,n,r){i.getSchema(e.modelName,e.formName).success(function(a){f(a,e,t,n,r)}).error(e.handleHttpError)}}}t.$inject=["$location","$window","$filter","$timeout","routingService","SubmissionsService","SchemasService"],e.recordHandler=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e){return{getSchema:function(t,n){return e.get("/api/schema/"+t+(n?"/"+n:""),{cache:!0})}}}t.$inject=["$http"],e.SchemasService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){var t;!function(e){function t(e,t){var n=function(e){var t="",n=function(e,n){n&&""!==n&&("object"==typeof n&&(n=JSON.stringify(n)),""===t?t="?":t+="&",t+=e+"="+n)};return n("l",e.limit),n("f",e.find),n("a",e.aggregate),n("o",e.order),n("s",e.skip),t};return{getListAttributes:function(t,n){return e.get("/api/"+t+"/"+n+"/list")},readRecord:function(t,n){return e.get("/api/"+t+"/"+n)},getAll:function(t,n){var r=angular.extend({cache:!0},n);return e.get("/api/"+t,r)},getPagedAndFilteredList:function(t,r){return e.get("/api/"+t+n(r))},deleteRecord:function(t,n){return e["delete"]("/api/"+t+"/"+n)},updateRecord:function(n,r,a){return t.get("$http").remove("/api/"+n),e.post("/api/"+n+"/"+r,a)},createRecord:function(n,r){return t.get("$http").remove("/api/"+n),e.post("/api/"+n,r)}}}t.$inject=["$http","$cacheFactory"],e.SubmissionsService=t}(t=e.services||(e.services={}))}(fng||(fng={}));var fng;!function(e){e.formsAngular=angular.module("formsAngular",["ngSanitize","ngMessages","ui.bootstrap","infinite-scroll","monospaced.elastic"]).controller("BaseCtrl",e.controllers.BaseCtrl).controller("SaveChangesModalCtrl",e.controllers.SaveChangesModalCtrl).controller("ModelCtrl",e.controllers.ModelCtrl).controller("NavCtrl",e.controllers.NavCtrl).directive("modelControllerDropdown",e.directives.modelControllerDropdown).directive("errorDisplay",e.directives.errorDisplay).directive("fngLink",e.directives.fngLink).directive("formInput",e.directives.formInput).directive("formButtons",e.directives.formButtons).directive("globalSearch",e.directives.globalSearch).filter("camelCase",e.filters.camelCase).filter("titleCase",e.filters.titleCase).service("addAllService",e.services.addAllService).provider("cssFrameworkService",e.services.cssFrameworkService).provider("routingService",e.services.routingService).factory("$data",e.services.$data).factory("formGenerator",e.services.formGenerator).factory("formMarkupHelper",e.services.formMarkupHelper).factory("inputSizeHelper",e.services.inputSizeHelper).factory("pluginHelper",e.services.pluginHelper).factory("recordHandler",e.services.recordHandler).factory("SchemasService",e.services.SchemasService).factory("SubmissionsService",e.services.SubmissionsService)}(fng||(fng={}));var formsAngular=fng.formsAngular;angular.module("formsAngular").run(["$templateCache",function(e){e.put("error-messages.html",'<div ng-message="required">A value is required for this field</div>\n<div ng-message="minlength">Too few characters entered</div>\n<div ng-message="maxlength">Too many characters entered</div>\n<div ng-message="min">That value is too small</div>\n<div ng-message="max">That value is too large</div>\n<div ng-message="email">You need to enter a valid email address</div>\n<div ng-message="pattern">This field does not match the expected pattern</div>\n'),e.put("form-button-bs2.html",'<div class="form-btn-grp">\n  <div class="btn-group pull-right">\n    <button id="saveButton" class="btn btn-mini btn-primary form-btn" ng-click="save()" ng-disabled="isSaveDisabled()"><i class="icon-ok"></i> Save</button>\n    <button id="cancelButton" class="btn btn-mini btn-warning form-btn" ng-click="cancel()" ng-disabled="isCancelDisabled()"><i class="icon-remove"></i> Cancel</button>\n  </div>\n  <div class="btn-group pull-right">\n    <button id="newButton" class="btn btn-mini btn-success form-btn" ng-click="newClick()" ng-disabled="isNewDisabled()"><i class="icon-plus"></i> New</button>\n    <button id="deleteButton" class="btn btn-mini btn-danger form-btn" ng-click="deleteClick()" ng-disabled="isDeleteDisabled()"><i class="icon-minus"></i> Delete</button>\n  </div>\n</div>\n'),e.put("form-button-bs3.html",'<div class="form-btn-grp">\n  <div class="btn-group pull-right">\n    <button id="saveButton" class="btn btn-primary form-btn btn-xs" ng-click="save()" ng-disabled="isSaveDisabled()"><i class="glyphicon glyphicon-ok"></i> Save</button>\n    <button id="cancelButton" class="btn btn-warning form-btn btn-xs" ng-click="cancel()" ng-disabled="isCancelDisabled()"><i class="glyphicon glyphicon-remove"></i> Cancel</button>\n  </div>\n  <div class="btn-group pull-right">\n    <button id="newButton" class="btn btn-success form-btn btn-xs" ng-click="newClick()" ng-disabled="isNewDisabled()"><i class="glyphicon glyphicon-plus"></i> New</button>\n    <button id="deleteButton" class="btn btn-danger form-btn btn-xs" ng-click="deleteClick()" ng-disabled="isDeleteDisabled()"><i class="glyphicon glyphicon-minus"></i> Delete</button>\n  </div>\n</div>\n'),e.put("search-bs2.html",'<form class="navbar-search pull-right">\n    <div id="search-cg" class="control-group" ng-class="errorClass">\n        <input type="text" autocomplete="off" id="searchinput" ng-model="searchTarget" ng-model-options="{debounce:250}" class="search-query" placeholder="{{searchPlaceholder}}" ng-keyup="handleKey($event)">\n    </div>\n</form>\n<div class="results-container" ng-show="results.length >= 1">\n    <div class="search-results">\n        <div ng-repeat="result in results">\n            <span ng-class="resultClass($index)" ng-click="selectResult($index)">{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show="moreCount > 0">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n'),e.put("search-bs3.html",'<form class="pull-right navbar-form">\n    <div id="search-cg" class="form-group" ng-class="errorClass">\n        <input type="text" autocomplete="off" id="searchinput" ng-model="searchTarget" ng-model-options="{debounce:250}" class="search-query form-control" placeholder="{{searchPlaceholder}}" ng-keyup="handleKey($event)">\n    </div>\n</form>\n<div class="results-container" ng-show="results.length >= 1">\n    <div class="search-results">\n        <div ng-repeat="result in results">\n            <span ng-class="resultClass($index)" ng-click="selectResult($index)" title={{result.additional}}>{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show="moreCount > 0">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n')}]),angular.module("formsAngular").run(["$templateCache",function(e){e.put("error-messages.html",'<div ng-message="required">A value is required for this field</div>\n<div ng-message="minlength">Too few characters entered</div>\n<div ng-message="maxlength">Too many characters entered</div>\n<div ng-message="min">That value is too small</div>\n<div ng-message="max">That value is too large</div>\n<div ng-message="email">You need to enter a valid email address</div>\n<div ng-message="pattern">This field does not match the expected pattern</div>\n'),e.put("form-button-bs2.html",'<div class="form-btn-grp">\n  <div class="btn-group pull-right">\n    <button id="saveButton" class="btn btn-mini btn-primary form-btn" ng-click="save()" ng-disabled="isSaveDisabled()"><i class="icon-ok"></i> Save</button>\n    <button id="cancelButton" class="btn btn-mini btn-warning form-btn" ng-click="cancel()" ng-disabled="isCancelDisabled()"><i class="icon-remove"></i> Cancel</button>\n  </div>\n  <div class="btn-group pull-right">\n    <button id="newButton" class="btn btn-mini btn-success form-btn" ng-click="newClick()" ng-disabled="isNewDisabled()"><i class="icon-plus"></i> New</button>\n    <button id="deleteButton" class="btn btn-mini btn-danger form-btn" ng-click="deleteClick()" ng-disabled="isDeleteDisabled()"><i class="icon-minus"></i> Delete</button>\n  </div>\n</div>\n'),e.put("form-button-bs3.html",'<div class="form-btn-grp">\n  <div class="btn-group pull-right">\n    <button id="saveButton" class="btn btn-primary form-btn btn-xs" ng-click="save()" ng-disabled="isSaveDisabled()"><i class="glyphicon glyphicon-ok"></i> Save</button>\n    <button id="cancelButton" class="btn btn-warning form-btn btn-xs" ng-click="cancel()" ng-disabled="isCancelDisabled()"><i class="glyphicon glyphicon-remove"></i> Cancel</button>\n  </div>\n  <div class="btn-group pull-right">\n    <button id="newButton" class="btn btn-success form-btn btn-xs" ng-click="newClick()" ng-disabled="isNewDisabled()"><i class="glyphicon glyphicon-plus"></i> New</button>\n    <button id="deleteButton" class="btn btn-danger form-btn btn-xs" ng-click="deleteClick()" ng-disabled="isDeleteDisabled()"><i class="glyphicon glyphicon-minus"></i> Delete</button>\n  </div>\n</div>\n'),e.put("search-bs2.html",'<form class="navbar-search pull-right">\n    <div id="search-cg" class="control-group" ng-class="errorClass">\n        <input type="text" autocomplete="off" id="searchinput" ng-model="searchTarget" ng-model-options="{debounce:250}" class="search-query" placeholder="{{searchPlaceholder}}" ng-keyup="handleKey($event)">\n    </div>\n</form>\n<div class="results-container" ng-show="results.length >= 1">\n    <div class="search-results">\n        <div ng-repeat="result in results">\n            <span ng-class="resultClass($index)" ng-click="selectResult($index)">{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show="moreCount > 0">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n'),e.put("search-bs3.html",'<form class="pull-right navbar-form">\n    <div id="search-cg" class="form-group" ng-class="errorClass">\n        <input type="text" autocomplete="off" id="searchinput" ng-model="searchTarget" ng-model-options="{debounce:250}" class="search-query form-control" placeholder="{{searchPlaceholder}}" ng-keyup="handleKey($event)">\n    </div>\n</form>\n<div class="results-container" ng-show="results.length >= 1">\n    <div class="search-results">\n        <div ng-repeat="result in results">\n            <span ng-class="resultClass($index)" ng-click="selectResult($index)" title={{result.additional}}>{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show="moreCount > 0">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n')}]);
//# sourceMappingURL=forms-angular.min.js.map
angular.module("formsAngular").run(["$templateCache", function($templateCache) {$templateCache.put("error-messages.html","<div ng-message=\"required\">A value is required for this field</div>\n<div ng-message=\"minlength\">Too few characters entered</div>\n<div ng-message=\"maxlength\">Too many characters entered</div>\n<div ng-message=\"min\">That value is too small</div>\n<div ng-message=\"max\">That value is too large</div>\n<div ng-message=\"email\">You need to enter a valid email address</div>\n<div ng-message=\"pattern\">This field does not match the expected pattern</div>\n");
$templateCache.put("form-button-bs2.html","<div class=\"form-btn-grp\">\n  <div class=\"btn-group pull-right\">\n    <button id=\"saveButton\" class=\"btn btn-mini btn-primary form-btn\" ng-click=\"save()\" ng-disabled=\"isSaveDisabled()\"><i class=\"icon-ok\"></i> Save</button>\n    <button id=\"cancelButton\" class=\"btn btn-mini btn-warning form-btn\" ng-click=\"cancel()\" ng-disabled=\"isCancelDisabled()\"><i class=\"icon-remove\"></i> Cancel</button>\n  </div>\n  <div class=\"btn-group pull-right\">\n    <button id=\"newButton\" class=\"btn btn-mini btn-success form-btn\" ng-click=\"newClick()\" ng-disabled=\"isNewDisabled()\"><i class=\"icon-plus\"></i> New</button>\n    <button id=\"deleteButton\" class=\"btn btn-mini btn-danger form-btn\" ng-click=\"deleteClick()\" ng-disabled=\"isDeleteDisabled()\"><i class=\"icon-minus\"></i> Delete</button>\n  </div>\n</div>\n");
$templateCache.put("form-button-bs3.html","<div class=\"form-btn-grp\">\n  <div class=\"btn-group pull-right\">\n    <button id=\"saveButton\" class=\"btn btn-primary form-btn btn-xs\" ng-click=\"save()\" ng-disabled=\"isSaveDisabled()\"><i class=\"glyphicon glyphicon-ok\"></i> Save</button>\n    <button id=\"cancelButton\" class=\"btn btn-warning form-btn btn-xs\" ng-click=\"cancel()\" ng-disabled=\"isCancelDisabled()\"><i class=\"glyphicon glyphicon-remove\"></i> Cancel</button>\n  </div>\n  <div class=\"btn-group pull-right\">\n    <button id=\"newButton\" class=\"btn btn-success form-btn btn-xs\" ng-click=\"newClick()\" ng-disabled=\"isNewDisabled()\"><i class=\"glyphicon glyphicon-plus\"></i> New</button>\n    <button id=\"deleteButton\" class=\"btn btn-danger form-btn btn-xs\" ng-click=\"deleteClick()\" ng-disabled=\"isDeleteDisabled()\"><i class=\"glyphicon glyphicon-minus\"></i> Delete</button>\n  </div>\n</div>\n");
$templateCache.put("search-bs2.html","<form class=\"navbar-search pull-right\">\n    <div id=\"search-cg\" class=\"control-group\" ng-class=\"errorClass\">\n        <input type=\"text\" autocomplete=\"off\" id=\"searchinput\" ng-model=\"searchTarget\" ng-model-options=\"{debounce:250}\" class=\"search-query\" placeholder=\"{{searchPlaceholder}}\" ng-keyup=\"handleKey($event)\">\n    </div>\n</form>\n<div class=\"results-container\" ng-show=\"results.length >= 1\">\n    <div class=\"search-results\">\n        <div ng-repeat=\"result in results\">\n            <span ng-class=\"resultClass($index)\" ng-click=\"selectResult($index)\">{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show=\"moreCount > 0\">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n");
$templateCache.put("search-bs3.html","<form class=\"pull-right navbar-form\">\n    <div id=\"search-cg\" class=\"form-group\" ng-class=\"errorClass\">\n        <input type=\"text\" autocomplete=\"off\" id=\"searchinput\" ng-model=\"searchTarget\" ng-model-options=\"{debounce:250}\" class=\"search-query form-control\" placeholder=\"{{searchPlaceholder}}\" ng-keyup=\"handleKey($event)\">\n    </div>\n</form>\n<div class=\"results-container\" ng-show=\"results.length >= 1\">\n    <div class=\"search-results\">\n        <div ng-repeat=\"result in results\">\n            <span ng-class=\"resultClass($index)\" ng-click=\"selectResult($index)\" title={{result.additional}}>{{result.resourceText}} {{result.text}}</span>\n        </div>\n        <div ng-show=\"moreCount > 0\">(plus more - continue typing to narrow down search...)\n        </div>\n    </div>\n</div>\n");}]);