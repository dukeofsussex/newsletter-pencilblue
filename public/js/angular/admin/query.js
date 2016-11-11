angular.module('newsletterQuery', [])
.factory('newsletterQueryFactory', function($http) {
    return {
        get: get,
        delete: deleteObject
    };

    function get(APIUrl, options, cb) {
        var queryString = '';
        for(var key in options) {
            if(queryString.length) {
                queryString += '&';
            } else {
                queryString += '?';
            }
            queryString += key + '=' + options[key];
        }

        $http.get(APIUrl + queryString)
        .success(function(result) {
            cb(null, result.data, result.total);
        })
        .error(function(error) {
            cb(error);
        });
    };

    function deleteObject(APIUrl, id, cb) {
        $http.delete(APIUrl + id)
        .success(function(result) {
            cb(null, result);
        })
        .error(function(error) {
            cb(error);
        });
    };
});
