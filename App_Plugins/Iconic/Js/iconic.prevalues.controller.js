﻿
angular.module("umbraco").controller("Koben.Iconic.Prevalues.Packages", ['$scope', '$http', 'assetsService', function ($scope, $http, assetsService) {

    $scope.newItem = new Package();    

    $scope.data = {
        editPackage: false,
        analysing: "init",
        configType: "custom",
        selectedItem: null,
        selectedPreConfig: null,
        showNewItemForm: false
    }
    
    if (!angular.isArray($scope.model.value)) $scope.model.value = [];


    $scope.addNewItem = function (formValid) {

        if (formValid) {
            $scope.data.analysing = "busy";

            extractStyles($scope.newItem, function () {
                $scope.model.value.push(angular.copy($scope.newItem));

                //restart new item form model
                $scope.newItem = new Package();
                $scope.data.showNewItemForm = false;
                $scope.data.analysing = "success";
            }, function () {
                $scope.data.analysing = "error";
            });

        }

    }

    $scope.submitEditPackage = function (item, formIsValid) {
        if (formIsValid) {
            extractStyles(item, function () {
                $scope.data.analysing = "success";
                $scope.data.editPackage = false;
            }, function () {
                $scope.data.analysing = "error";
            });
        }
    }


    $scope.selectItem = function (item) {
        if ($scope.data.selectedItem === item)
            $scope.data.selectedItem = null;
        else
            $scope.data.selectedItem = item;
    }

    $scope.removeItem = function (index) {
        $scope.model.value.splice(index, 1);
    }



    $scope.selectPreConfig = function (config) {
        Object.assign($scope.newItem, config);
    }

  
    function loadPreconfigs() {
        $http.get("/App_Plugins/Iconic/preconfigs.json").success(function (data) {
            $scope.preconfig = data.preconfigs;
        }).error(function (response) {
            console.error("Preconfigs file couldn't be loaded.");   
            $scope.iconicError = "Error loading preconfigs file.";
        });
    }

    function extractStyles(item, successCallback, errorCallback) {

        if (!item.selector || item.selector.length <= 0) {
            errorCallback();
            $scope.iconicError = "Error with selector, please review it.";
        }

        if (!item.sourcefile) item.sourcefile = item.cssfile;

        $http.get(item.sourcefile).success(function (data) {
            item.extractedStyles = [];
            var pattern = new RegExp(item.selector, 'g');

            var match = pattern.exec(data);
            while (match !== null) {
                item.extractedStyles.push(match[1])
                match = pattern.exec(data);
            }

            if (item.extractedStyles.length > 0) {
                successCallback();
            } else {
                console.error("Extracted styles are 0");
                $scope.iconicError = "There is an error somewhere, the extracted rules are 0.";
                errorCallback();

            }

        }).error(function (response) {
            console.error("File couldn't be loaded.");
            $scope.iconicError = "Error loading the css file.";
            errorCallback();
        })

    }

    loadPreconfigs();

}]);