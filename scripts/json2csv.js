var fs = require("fs");
var d3 = require("d3");
var Q = require('q');
var _ = require("underscore");
var moment = require('moment');
var queue = require("queue-async");
var csv = require('csv');

function JSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';
    var head = array[0];

    for (var index in array[0]) {
        line += index + ',';
    }

    line = line.slice(0, -1);
    str += line + '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i]) {
            line += array[i][index] + ',';
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
}

var readFile = function(path){
    var d = Q.defer();
    fs.readFile(path, 'utf-8', function(error, res){
        if (error) throw error;
        return d.resolve(res);
    })
    return d.promise;
}

readFile('../data/d_occs.json')
.then(function(d_occs){
    // console.log("LOG:",d_occs);
    var a =  JSON2CSV(JSON.parse(d_occs));
    console.log("LOG:",a);
    fs.writeFile('../data/d_occs2.csv', a, 'utf8');
})