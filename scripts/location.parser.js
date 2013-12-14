var fs = require('fs');
var _ = require('underscore');

var input = JSON.parse(fs.readFileSync('../data/example_request.json'));
var output = [];

_.map(input.AVL, function(v){
  var entry = {
    name : v.NAME
    , cap : Number(v.OPER)
    , type: v.TYPE
  }
  if(v.TYPE === 'ON'){
    entry.ID = v.BFID
    var coords = v.LOC.split(',')
    entry.loc = [
      {lon: Number(coords[0]), lat: Number(coords[1])},
      {lon: Number(coords[2]), lat: Number(coords[3])}
    ]
  }
  else{
    entry.ID = v.OSPID
    var coords = v.LOC.split(',')
    entry.loc = {lon: Number(coords[0]), lat: Number(coords[1])}  
  }
  output.push(entry);
})

fs.writeFileSync('../data/locs.json', JSON.stringify(output, null, 2))

//create locs_with_ids.csv
var res = {};
_.map(output, function(d){
  res[d.ID] = d;
})

fs.writeFile('../data/locs_with_ids.json', JSON.stringify(res), 'utf-8')

//create locs_with_names.csv
var names_obj = {};
_.map(output, function(d){
  names_obj[d.name] = d;
})

fs.writeFile('../data/locs_with_names.json', JSON.stringify(names_obj), 'utf-8')

