const ISO6391 = require('iso-639-1');

var app = angular.module('translate', ['ngCookies', 'pascalprecht.translate', ]);
var currentLang;

app.config(['$translateProvider', function ($translateProvider) {
    const langs = Object.keys(config.languages).map(function(key){
        return config.languages[key];
    })

    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/',
        suffix: '.json'
     })   
 
     .registerAvailableLanguageKeys(langs, config.languages)
 
     .determinePreferredLanguage()
 
     .fallbackLanguage('en')
    
     .useLocalStorage();

     langs.forEach(function (lang) {
        createDropdownElt('language-menus', ISO6391.getNativeName(lang), null, "", lang, "changeLanguage('"+lang+"')");
    });
}]);

app.controller('Ctrl', ['$translate', '$scope', function ($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
        currentLang = $translate.proposedLanguage() || $translate.use();
      };
    currentLang = $translate.proposedLanguage() || $translate.use();
}]);


