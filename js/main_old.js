// replace "toner" here with "terrain" or "watercolor"
var layer = new L.StamenTileLayer("toner");
var initZoom = 13;
var map = new L.Map("map", {
    center: new L.LatLng(37.77831314799669, -122.43644714355469),
    zoom: initZoom
});

map.addLayer(layer);

var margin = { top: 20, right: 20, left: 20, bottom: 20};

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

function project(lat, lon) {
  var point = map.latLngToLayerPoint(new L.LatLng(lat, lon));
  return [point.x, point.y];
}

queue()
  .defer(d3.json, "data/locs.json")
  .defer(d3.json, "data/occsForVis2.json")
  .await(go);

var maxR = 10,
  maxThick = 3.5,
	max = 0,
	time = new Date(1376352240000);

var r, startTime, endTime, th;

var initScale = map.getZoomScale(initZoom);

function go(err, locs, occs){

  var dataGarages = locs.filter(function(d){ return d.type == "OFF"; });

  occs.forEach(function(d){
  	max = d3.max([
  			d3.max(d3.values(d).slice(1))
  		, max])
  });


  var slider = d3.slider()
      .scale( d3.time.scale().domain([new Date(1374649303076), new Date(1374735403076)]))
      .axis( d3.svg.axis().tickFormat(d3.time.format("%H:%M %p")).ticks(12))
      .step(5 * 60 * 1000)
      .on("slide", slide)

  var s = d3.select("#slider")
        .call(slider);

  s.select("svg")
    .attr("height", "120px")
  .selectAll("text").style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform","rotate(-90)");

  function slide(event, t){
    
    time = t;
    garageCircle
      .attr("r", function(d){
        var g = +d.occupancy[t];
        return r(g); 
      });

  } //slide

  dataGarages.forEach(function(d){

    var thisOcc = occs.filter(function(v){
    	return v.ID == d.ID;
    })[0];

    d['occupancy'] = thisOcc;

  });

  r = d3.scale.sqrt()
    .domain([0,max])
    .range([0,maxR])
    .clamp(true);

  var topLeftLatLong = {
        lat: d3.max(locs.map(function(d){return  d.loc.lat; }) ),
        lon: d3.min(locs.map(function(d){return  d.loc.lon; }) )
    },
    bottomRightLatLong = {
        lat: d3.min( locs.map(function(d){return  d.loc.lat; }) ),
        lon: d3.max( locs.map(function(d){return  d.loc.lon; }) )
    };

  var topLeft = project( topLeftLatLong.lat, topLeftLatLong.lon  ),
    bottomRight = project( bottomRightLatLong.lat, bottomRightLatLong.lon  );

  var garageGroup = g.append("g").attr("class", "g-garageGroup");
    // streetsGroup = g.append("g").attr("class", "g-streetsGroup");

  var gGarage = garageGroup.selectAll("g-garage")
    .data(dataGarages)
    .enter()
    .append("g")
    .attr("class","g-garage")
    .attr("transform", function(d){
      // var t = map.latLngToLayerPoint(new L.LatLng(d.loc.lat, d.loc.lon));
      return "translate(" + project(d.loc.lat, d.loc.lon) + ")";
    });

  var garageCircle = gGarage.append("circle")
    .attr({
      class: "garage",
      r: function(d){
      	var g = +d.occupancy[time];
      	return r(g); 
      },
      fill: "crimson"
    });

  map.on("viewreset", repos);

  repos();

  // Reposition the SVG to cover the features.
  function repos() {

    var topLeft = project( topLeftLatLong.lat, topLeftLatLong.lon  ),
      bottomRight = project( bottomRightLatLong.lat, bottomRightLatLong.lon  );

    svg.attr("width", bottomRight[0] - topLeft[0] + margin.left + margin.right)
        .attr("height", bottomRight[1] - topLeft[1] + margin.top + margin.bottom)
        .style("left", topLeft[0] - margin.left + "px")
        .style("top", topLeft[1] - margin.top  + "px");

    g.attr("transform", "translate(" + (-topLeft[0] + margin.left) + "," + (-topLeft[1] + margin.top) + ")");

    gGarage.attr("transform", function(d){
      return "translate(" + project(d.loc.lat, d.loc.lon) + ")";
    });

    var w = map.getZoomScale(initZoom);

    r.range([0, maxR * Math.pow(initScale/w, 0.9) ]);
    // th.range([0, maxThick * Math.pow(initScale/w, 0.9) ]);


    garageCircle.attr("r", function(d){ return r(d.occupancy[time]);  })

  }

}
