var fs = require("fs");
var d3 = require("d3");
var Q = require('q');
var _ = require("underscore");
var moment = require('moment');
var queue = require("queue-async");
var csv = require('csv');

var readFile = function(path){
	var d = Q.defer();
	fs.readFile(path, 'utf-8', function(error, res){
		if (error) throw error;
		return d.resolve(res);
	})
	return d.promise;
}

////////rename get the raw data, renamed the columns, only take every five minutes readings, create a d_occs file

queue()
.defer(fs.readFile, '../data/raw_data.csv', 'utf-8')
.defer(fs.readFile, '../data/locs_with_names.json', 'utf-8')
.await(go);

function go(error, occ_data, loc_data){
	var occs = d3.csv.parse(occ_data);
	delete occ_data;
	var loc_keys = JSON.parse(loc_data);
	delete loc_data;
	var occs_output = [];
	var d_occs_output = [];

	occs.forEach( function(row, i){ //loop over times
		if(i%5!== 0) return;
		var entryOcc = {};
		var entryDOcc = {};
		_.each(row, function(val, key){
			if(key=='time') {
				entryOcc['time'] = (new Date(val)).getTime();
				entryDOcc['time'] = (new Date(val)).getTime();
			}	else if (loc_keys[key]){
				var id = loc_keys[key].ID;
				entryOcc[id] = (val) ? +val : 'NA';
				var prev = occs[i-12]; //how has it changed in the last hour?
				entryDOcc[id] = (prev) ? Number(val) - Number(prev[key]) : 'NA';
			}
		})
		console.log("LOG:",i);
		occs_output.push(entryOcc);
		d_occs_output.push(entryDOcc);
	});


	fs.writeFileSync('../data/occs_parsed.csv', JSON2CSV(occs_output), 'utf8');

}


	// fs.writeFileSync('../data/occs_parsed_deltas.csv', JSON2CSV(d_occs_output), 'utf8');




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