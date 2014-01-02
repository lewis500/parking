//=========PARAMETERS===========
var maxR = 10,
  initZoom = 13,
  max = 800,
  time;

// var format = d3.time.format("%Y-%m-%d");
var format = d3.time.format("%I:%M %p")

var r = d3.scale.sqrt() //scale for garage circles
  .domain([0,max])
  .range([0,maxR]);

var th = d3.scale.linear()
  .domain([0,800])
  .range([1,5]);

var col = d3.scale.linear()
  .domain([0,800])
  .range(["#ecf0f1","#e74c3c"]);
  // .interpolate(d3.interpolateHcl); //how to fill the inbetween colors

var bisect = d3.bisector(function(d) { return d.time; }).left;

//=========CREATE THE MAP===========
var map = new L.Map("map", {
    center: new L.LatLng(37.77831314799669, -122.4),
    zoom: initZoom,
    maxZoom: 16,
    minZoom: 12,
});

var initScale = map.getZoomScale(initZoom);
var layer = new L.StamenTileLayer("toner");
map.addLayer(layer);

var southWest = L.latLng(37.708269684354526,-122.5528335571289),
    northEast = L.latLng(37.883795951524995, -122.2235870361328),
    bounds = L.latLngBounds(southWest, northEast);
    
map.setMaxBounds(bounds);

//=========POLYLINES===========

  var path85 = [
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

  var path101 = [
    [37.7661, -122.4049],
    [37.763760152595815, -122.40503311157225],
    [37.761487048570935, -122.40623474121092],
    [37.76016386630063, -122.40640640258788],
    [37.759010303470966, -122.40597724914551],
    [37.758162084031426, -122.40481853485107],
    [37.757042419479056, -122.40370273590086],
    [37.75616024759331, -122.40323066711426],
    [37.75256359181039, -122.40297317504881],
    [37.74923822620381, -122.40378856658934]
  ];

  L.polyline(path85, {className: "I85W road"}).addTo(map);
  L.polyline(path85, {className: "I85E road"}).addTo(map);
  L.polyline(path101, {className: "H101N road"}).addTo(map);
  L.polyline(path101, {className: "H101S road"}).addTo(map);

  var I85W = d3.select(".I85W").attr("transform","translate(" + [-2,-2]  + ")" ),
    I85E = d3.select(".I85E").attr("transform","translate(" + [2,2]  + ")" ),
    H101N = d3.select(".H101N").attr("transform","translate(" + [4,0] + ")" ),
    H101S = d3.select(".H101S").attr("transform","translate(" + [-3,0] + ")" );

  // L.polyline(f.reverse(), {className: "eighty-five-E", dashArray: "12,24"}).addTo(map);
  // d3.select(".eighty-five-E").attr("transform","translate(" + [2,2]  + ")" );

//=====CREATE SVG AND MAIN GROUP=========

var margin = { top: 20, right: 20, left: 20, bottom: 20};

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

//=====LOAD DATA=========

queue()
  .defer(d3.json, "data/locs.json")
  .defer(d3.csv, "data/occs.csv")
  .defer(d3.csv, "data/flows.csv")
  .await(go);

//=========THE ACTION===========

function go(err, locs, occs, flows){

  //============DATA PARSING==============
  
  flows.forEach(function(d){
    d.time = new Date(+d.time);
  });

  occs.forEach(function(d){
    d.time = new Date(+d.time);
  });

  I85W.datum(flows.map(function(d){return {time: d.time, flow: d.I85W}}));
  I85E.datum(flows.map(function(d){return {time: d.time, flow: d.I85E}}));
  H101N.datum(flows.map(function(d){return {time: d.time, flow: d.H101N}}));
  H101S.datum(flows.map(function(d){return {time: d.time, flow: d.H101S}}))

  var data = locs.filter(function(d){ return d.type == "OFF"; }),
    times = occs.map(function(d){ return new Date(d.time); });

  data.forEach(function(d){

    d.occupancy = occs.map(function(v){
      return { time: new Date(+v.time), occ: v[d.ID]}; 
    });

  });

  //============BOUNDS OF SVG==============

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
      .axis( d3.svg.axis().tickFormat(format).ticks(12))
      .step(5 * 60 * 1000)
      .on("slide", slide);

  var s = d3.select("#slider").call(slider);

  s.select("svg")
    .attr("height", "120px")
  .selectAll("text").style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform","rotate(-90)");

  //============PLOT GARAGES==============

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
        var z = +d.occupancy[0].occ;
        return r(z); 
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

    var q = flows[bisect(flows, time, 0, flows.length - 1)].flow;

    // d3.select(".I85W").style("stroke-dasharray", newFirst + "," + newSecond ).style("stroke-width",newStrokeWidth)

  }

  function slide(event, val){
    
    time = new Date(+val);

    d3.selectAll(".road")
      .attr("stroke", function(d){
        var q = d[bisect(d, time, 0, d.length - 1)].flow;
        return col(q);
      })
      .attr("stroke-width", function(d){
        var q = d[bisect(d, time, 0, d.length - 1)].flow;
        return th(q);
      });

    garageCircle.attr("r", function(d){
        var o = d.occupancy,
          v = o[bisect(o, time, 0, o.length - 1)]
        return r(v.occ); 
      });

    var j = fields(time);
    render(j);

  } //slide;

}

function project(lat, lon) {
  var point = map.latLngToLayerPoint(new L.LatLng(lat, lon));
  return [point.x, point.y];
}
