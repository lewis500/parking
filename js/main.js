// replace "toner" here with "terrain" or "watercolor"
var layer = new L.StamenTileLayer("toner");
var initZoom = 13;
var map = new L.Map("map", {
    center: new L.LatLng(37.77831314799669, -122.43644714355469),
    zoom: initZoom,
    maxZoom: 15,
    minZoom: 12,
});

map.addLayer(layer);

//=============polylines

var f = [
  [ 37.787674400057654, -122.38915443420409],
  [ 37.808241246551695, -122.36725687980652],
  [ 37.81024167290316, -122.36515402793883],
  [ 37.81153005440276, -122.36279368400574],
  [ 37.813310018173176, -122.36101269721985],
  [ 37.8136829575257, -122.3606050014496],
  [ 37.819242920816606, -122.34317064285278],
  [ 37.821412548992235, -122.32995271682739],
  [ 37.824293987814805, -122.3107695579529]
];

L.polyline(f, {className: "I85W", dashArray: "12,24"}).addTo(map);
d3.select(".I85W").attr("transform","translate(" + [-2,-2]  + ")" );

// L.polyline(f.reverse(), {className: "eighty-five-E", dashArray: "12,24"}).addTo(map);
// d3.select(".eighty-five-E").attr("transform","translate(" + [2,2]  + ")" );

var tick = function(elapsed) {
  // if(pause) return false;
  //elapsed is how much time has elapsed in the timer
  t = elapsed / duration;
  //move our flow
  d3.select(".I85W")
    .style({
      "stroke-dashoffset": t * length * vel
    });
  // return stop; //if stop is true then the timer gets destroyed
}

var duration = 4000;
var w =12; //width of each flow symbol
var baseVel = .5;
var vel = baseVel;
var spacing = 2; //ratio of symbol width to spacing between each one

var velScale = d3.scale.linear().range([.25,1]);

var p = d3.select(".I85W").node(),
	length = p.getTotalLength(),

//positioning/layout
start  = p.getPointAtLength(0);
end = p.getPointAtLength(length);

d3.timer(tick);

var southWest = L.latLng(37.708269684354526,-122.5528335571289),
    northEast = L.latLng(37.883795951524995, -122.2235870361328),
    bounds = L.latLngBounds(southWest, northEast);
    
map.setMaxBounds(bounds);

var bisect = d3.bisector(function(d) { return d.time; }).left;

var margin = { top: 20, right: 20, left: 20, bottom: 20};

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

function project(lat, lon) {
  var point = map.latLngToLayerPoint(new L.LatLng(lat, lon));
  return [point.x, point.y];
}

//=====LOAD THE DATA=========

queue()
  .defer(d3.json, "data/locs.json")
  .defer(d3.json, "data/occs.json")
  .defer(d3.json, "data/flow.json")
  .await(go);

var maxR = 10,
  max = 800,
  time = new Date();

var initScale = map.getZoomScale(initZoom);

//=========THE ACTION CODE===========

function go(err, locs, occs, flows){

	flows.forEach(function(d){
		d.time = new Date(d.time);
	});

	velScale.domain([0,5000]);

  occs.forEach(function(d){
    d.time = new Date(+d.time);
  });

  var data = locs.filter(function(d){ return d.type == "OFF"; }),
    times = occs.map(function(d){ return new Date(d.time); });

  var topLeftLatLong = {
        lat: d3.max(data.map(function(d){return  d.loc.lat; }) ),
        lon: d3.min(data.map(function(d){return  d.loc.lon; }) )
    },
    bottomRightLatLong = {
        lat: d3.min( data.map(function(d){return  d.loc.lat; }) ),
        lon: d3.max( data.map(function(d){return  d.loc.lon; }) )
    };

  var topLeft = project( topLeftLatLong.lat, topLeftLatLong.lon  ),
    bottomRight = project( bottomRightLatLong.lat, bottomRightLatLong.lon  );

  //============SLIDER STUFF==============

  var slider = d3.slider()
      .scale( d3.time.scale().domain([times[0], times[times.length - 1]]))
      .axis( d3.svg.axis().tickFormat(d3.time.format("%H:%M %p")).ticks(12))
      .step(5 * 60 * 1000)
      .on("slide", slide);

  var s = d3.select("#slider").call(slider);

  s.select("svg")
    .attr("height", "120px")
  .selectAll("text").style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform","rotate(-90)");

  data.forEach(function(d){

    d['occupancy'] = occs.map(function(v){
      return { time: new Date(+v.time), occ: v[d.ID]}; 
    });

  });

  var r = d3.scale.sqrt()
    .domain([0,max])
    .range([0,maxR])

  var garageGroup = g.append("g").attr("class", "g-garageGroup");

  var gGarage = garageGroup.selectAll("g-garage")
    .data(data)
    .enter()
    .append("g")
    .attr("class","g-garage")
    .attr("transform", function(d){
      return "translate(" + project(d.loc.lat, d.loc.lon) + ")";
    });

  var garageCircle = gGarage.append("circle")
    .attr({
      class: "garage",
      r: function(d){
        var g = +d.occupancy[0].occ;
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

    garageCircle.attr("r", function(d){
        var o = d.occupancy,
          v = o[bisect(o, time, 0, o.length - 1)]
        return r(v.occ); 
      });

    var newFirst = 6 * initScale / w,
    	newSecond = 12 * initScale / w,
    	newStrokeWidth = Math.pow(3 * initScale / w,.8);

    var q = flows[bisect(flows, time, 0, flows.length - 1)].flow;

    vel = velScale(q) * initScale / w;

    d3.select(".I85W").style("stroke-dasharray", newFirst + "," + newSecond ).style("stroke-width",newStrokeWidth)

  }

  function slide(event, val){
    
    time = val;

    // var flowTime = flows[bisect(flows, time, 0, flows.length - 1)];

    // highways.each(function(highway){
    //   var w = map.getZoomScale(initZoom);
      
    //   var newFirst = 6 * initScale / w,
    //     newSecond = 12 * initScale / w;

    //   d3.select("." + highway)
    //     .style("stroke-dasharray", newFirst + "," + newSecond )

    // })

    var q = flows[bisect(flows, time, 0, flows.length - 1)].flow;

    vel = velScale(q) * initScale / map.getZoomScale(initZoom);

    garageCircle.attr("r", function(d){
        var o = d.occupancy,
          v = o[bisect(o, time, 0, o.length - 1)]
        return r(v.occ); 
      });

  } //slide;


}
