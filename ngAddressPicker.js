angular.module('ngAddressPicker', [])
.factory('googleService', ['$http', '$q',function($http, $q){
  var api_url = 'http://maps.googleapis.com/maps/api/geocode/json';
  return {
    cleanAddressResults: function(address){
      var results = [];
      var comp = ['country',
      'route',
      'street_number',
      'postal_code',
      'locality',
      'administrative_area_level_2',
      'administrative_area_level_1'];
      if (address && address.length > 0){
        address.forEach(function(item){
          var result = {};
          item.address_components.forEach(function(component){
            component.types.forEach(function(type){
              var i = comp.indexOf(type);
              if (i > -1) {
                result[comp[i]] = {
                  short_name:component.short_name,
                  long_name:component.long_name
                };
              }
            });
          });
          results.push(result);
        });
      }
      return results;
    },
    findByAddress:function(address, options){
      var url = api_url+'?address='+address;
      var promised = $q.defer();
      options = options || {};
      $http.get(url)
      .success(function(data){
        if(data && data.status == 'OK' &&
            data.results && data.results.length > 0){
              promised.resolve(data.results);
            }
          promised.reject('no data');
      })
      .error(function(err){
        promised.reject(err);
      });
      return promised.promise;
    }
  }
}])
.directive('findlocation', ['googleService',function(googleService){
  return {
    restrict:'A',
    link: function(scope,elem,attr,ctrl){
      elem.bind('keyup',function(){
        googleService.findByAddress(elem.val())
        .then(googleService.cleanAddressResults)
        .then(function(result){
          scope[attr.resultModel] = result;
        });
      })
    }
  };
}])
