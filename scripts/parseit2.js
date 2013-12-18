var fs = require("fs");
var d3 = require("d3");
var Q = require('q');
var _ = require("underscore");
var moment = require('moment');
var queue = require("queue-async");
var csv = require('csv');

var readCSV = function(path){
	var d = Q.defer();
	fs.readFile(path, 'utf-8', function(error, res){
		if (error) throw error;
		return d.resolve(d3.csv.parse(res));
	})
	return d.promise;
}

var readJSON= function(path){
	var d = Q.defer();
	fs.readFile(path, 'utf-8', function(error, res){
		if (error) throw error;
		return d.resolve(JSON.parse(res));
	})
	return d.promise;
}

////////rename get the raw data, renamed the columns, only take every five minutes readings, create a d_occs file

var locs = JSON.parse(fs.readFileSync('../data/locs_with_ids.json'));

var headers = d3.keys(locs);

headers.unshift('time');

csv()
	.from('../data/raw_data.csv', {delimiter: ',', columns: true})
	.transform(function(row, i){
		if((i>0)&&((i-1)%5==0)) {
			_.each(row, function(val, key){
				if(key=='time') row.time = (new Date(row.time)).getTime();
				else row[key] = (val) ? +val : null;
			})
			return _.values(row);
		}else{
			return null;
		}
	})
	.to.path('../data/occs_parsed.csv', {delimiter: ',', columns: headers, header: true});


////////////////////create the occs_deltas file
/*
readCSV('../data/occs_parsed.csv')
.then(function(occs){
	var d_occs = occs; //I did this in case we wanted to do like d_occs[i] = occs[i+6] - occs[i-6]
	for (var i = d_occs.length - 1; i >= 0; i--) {
		_.each(d_occs[i], function(val, key){
			if (key!=='time'){
				var prev = occs[i-12]; //how has it changed in the last hour?
				d_occs[i][key] = (prev) ? Number(val) - Number(prev[key]) : 'NA';
			}
		})
	};

	return d_occs;
})
.then(function(d_occs){
	var output = JSON2CSV(d_occs);
	delete d_occs;
	fs.writeFileSync('../data/occs_deltas.csv', output);
})
*/


///turn the pems location json into a csv
/*
readJSON('../data/pems_station_locs_new.json')
.then(function(j){
	var midput = _.map(j, function(val, key){
		return {id: key, lat: val.lat, lon: val.lon};
	})
	console.log("LOG:",midput);
	var output = JSON2CSV(midput);
	fs.writeFile('../data/pems_station_locs_new.csv', output);
})
*/

//turn the detector locations into a csv
// readJSON('../data/locs_with_ids.json')
// .then(function(j){
// 	var midput = _.map(j, function(val, key){
// 		return {id: key, 
// 			name: val.name,
// 			lat: (!val.loc[0]) ? (val.loc.lat) : "NA", 
// 			lon:  (!val.loc[0]) ? (val.loc.lon) : "NA", 
// 			lat_0: (val.loc[0]) ? (val.loc[0].lat) : "NA", 
// 			lon_0: (val.loc[0]) ? (val.loc[0].lon) : "NA", 
// 			lat_1: (val.loc[0]) ? (val.loc[1].lat) : "NA", 
// 			lon_1: (val.loc[0]) ? (val.loc[1].lon) : "NA", 
// 			off_or_on_street: val.type,
// 			capacity: val.cap
// 		};
// 	})
// 	var output = JSON2CSV(midput);
// 	fs.writeFile('../data/detector_station_info.csv', output);
// })





function JSON2CSV(array) {
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