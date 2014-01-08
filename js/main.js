//=========PARAMETERS & HELPER FUNCTIONS===========
var maxR = 15,
  initZoom = 13,
  max = 800,
  time = moment("6:00 AM July 15, 2013"),
  duration = 150,
  timeMultiplier = 15,
  pause = false,
  stop = false,
  col,
  garageKey = {};

var xLine, bg
  , selectGarageName = "total"
  ,  selectGarage = "total"
  , selectOcc;

var st = false;

var sw, layers;

var marginGraph = { top: 5, right: 40, bottom: 20, left: 50 };
var widthGraph = 620 - marginGraph.left;
var heightGraph = 275 - marginGraph.top - marginGraph.bottom; 
var yMax = 0;
var y = d3.scale.linear().range([heightGraph, 0]);
var xLine = d3.time.scale().range([0, widthGraph]);

var format = d3.time.format("%I:%M %p");

var svgGraph = d3.select("#garageChart").append("svg")
  .attr("width", widthGraph + marginGraph.left + marginGraph.right)
  .attr("height", heightGraph + marginGraph.top + marginGraph.bottom)
  .append("g")
  .attr("transform", "translate(" + marginGraph.left + "," + marginGraph.top + ")");

var r = d3.scale.sqrt() //scale for garage circles
  .domain([0,max])
  .range([0,maxR]);

var th = d3.scale.linear() //scale for roads
  .domain([0,800])
  .range([1,10]);

var tooltip = d3.select("#tooltip");

var bisect = d3.bisector(function(d) { return d.time; }).left;

var stack = d3.layout.stack()
  .order("inside-out")
  .values(function(d) { return d.values; })
  .x(function(d) { return d.time; })
  .y(function(d) { return d.value; });

var area = d3.svg.area()
    .x(function(d) { return xLine(d.time); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.value + d.y0); });

function project(lat, lon) {
  var point = map.latLngToLayerPoint(new L.LatLng(lat, lon));
  return [point.x, point.y];
}

//=========CREATE THE MAP===========
var map = new L.Map("map", {
    center: new L.LatLng(37.77831314799669, -122.4),
    zoom: initZoom,
    maxZoom: 16,
    minZoom: 12,
});

var initScale = map.getZoomScale(initZoom);
var layer = new L.StamenTileLayer("toner-background");
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

  L.polyline(path85, {className: "I85W road in"}).addTo(map);
  L.polyline(path85, {className: "I85E road out"}).addTo(map);
  L.polyline(path101, {className: "H101N road in"}).addTo(map);
  L.polyline(path101, {className: "H101S road out"}).addTo(map);

  var I85W = d3.select(".I85W").attr("transform","translate(" + [-3,-3]  + ")" ),
    I85E = d3.select(".I85E").attr("transform","translate(" + [3,3]  + ")" ),
    H101N = d3.select(".H101N").attr("transform","translate(" + [4,0] + ")" ),
    H101S = d3.select(".H101S").attr("transform","translate(" + [-3,0] + ")" );

//=====CREATE SVG AND MAIN GROUP=========

var margin = { top: 20, right: 20, left: 20, bottom: 20};

var svgMap = d3.select(map.getPanes().overlayPane).append("svg","#pause"),
    g = svgMap.append("g").attr("class", "leaflet-zoom-hide");

//=====LOAD DATA=========

queue()
  .defer(d3.json, "data/locsrefined.json")
  .defer(d3.json, "data/occs.json")
  .defer(d3.csv, "data/flows.csv")
  .await(go);

//=========THE ACTION===========

var time, flows, circ, garage, occs, end, start;

function go(err, locs, o, f){

  //============DATA PARSING==============
  
  flows = f;

  occs = o;

  flows.forEach(function(d){
    d.time = moment(+d.time);
  });

  occs.forEach(function(row){
    row.time = moment(+row.time);

    var s = _.initial(d3.values(row));

    var tot = s.reduce(function(a,b){return a + b; });

    yMax = d3.max([tot, yMax]);

  });

  locs.forEach(function(d){
    garageKey[d.ID] = d.name;
  });

  var startAndEnd = d3.extent(occs.map(function(d){return d.time; }));

  start = startAndEnd[0];
  end = startAndEnd[1];

  garageNames = d3.keys(occs[0]).filter(function(key){ return key!=="time" });

  I85W.datum({ID: "I85W"});
  I85E.datum({ID: "I85E"});
  H101N.datum({ID: "H101N"});
  H101S.datum({ID: "H101S"});

  var data = locs.filter(function(d){ return d.type == "OFF"; });

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

  //============PLOT GARAGES==============

  var garageGroup = g.append("g").attr("class", "g-garageGroup");

  var gGarage = garageGroup.selectAll("g-garage")
    .data(data)
    .enter()
    .append("g")
    .attr("class", function(d){ return "g-garage" + " g" + d.ID; })
    .attr("transform", function(d){
      return "translate(" + project(d.loc.lat, d.loc.lon) + ")";
    });

  col = d3.scale.category20c();

  col.domain(garageNames)

  garage = gGarage.append("circle")
    .attr({
      class: "garage",
      fill: function(d,i){ return col(d.ID); }
    });

  map.on("viewreset", repos);

  repos();

  garage.on("mouseover", function(d, i) {

      selectGarage = d.ID;

      var f = d3.selectAll(".layer, .g-garage")
        .filter(function(v, i){ 
          return d.ID !== ( v.key ? v.key : v.ID );
        })
        .transition()
        .duration(25)
        .attr("opacity", 0.2);

        d3.selectAll(".g" + d.ID)
          .attr("stroke","black");

        update();
      })
      .on("mouseout", function(d){

        selectGarage = "total";

         d3.selectAll(".layer, .g-garage")
          .transition()
          .duration(25)
          .attr("opacity", 1);

        d3.selectAll(".g" + d.ID)
          .attr("stroke","none");

        update();

      })


  //============REPOSITION SVG ON ZOOM==============
  function repos() {

    var topLeft = project( topLeftLatLong.lat, topLeftLatLong.lon  ),
      bottomRight = project( bottomRightLatLong.lat, bottomRightLatLong.lon  );

    svgMap.attr("width", bottomRight[0] - topLeft[0] + margin.left + margin.right)
        .attr("height", bottomRight[1] - topLeft[1] + margin.top + margin.bottom)
        .style("left", topLeft[0] - margin.left + "px")
        .style("top", topLeft[1] - margin.top  + "px");

    g.attr("transform", "translate(" + (-topLeft[0] + margin.left) + "," + (-topLeft[1] + margin.top) + ")");

    gGarage.attr("transform", function(d){
      return "translate(" + project(d.loc.lat, d.loc.lon) + ")";
    });

    var w = map.getZoomScale(initZoom);

    r.range([0, maxR * Math.pow(initScale/w, 0.9) ]);

  }

  //============STREAMGRAPH==============

  xLine.domain(d3.extent(occs, function(d) { return d.time; }));

  layers = garageNames.map(function(name){
    return {
      key: name,
      values: occs.map(function(d) { 
        return { time: d.time, value: +d[name], garage: name };
      })
    };
  });

  y.domain([0, yMax*1.1]);

  var xAxis = d3.svg.axis()
    .scale(xLine)
    .orient("bottom")
    .ticks(12);

  var yAxis = d3.svg.axis()
    .orient("right")
    .scale(y)
    .ticks(5);

  bg = svgGraph.append("rect")
    .attr({
      width: widthGraph,
      height: heightGraph,
      fill: "white"
    })

  var streams = svgGraph.selectAll(".layer")
    .data(stack(layers))
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", function(d) { return area(d.values); })
    .style("fill", function(d, i){ return col(d.key); });

  svgGraph.append("g")
    .attr("class", "y axis")
    .call(yAxis.orient("left"));

  svgGraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightGraph + ")")
    .call(xAxis);

  var pressed = false;

  svgGraph.selectAll(".layer")
      .attr("class", function(d) { return d3.select(this).attr("class") + " g" + d.key; })
      .on("mouseover", function(d, i) {

        selectGarage = d.key;

        d3.selectAll(".layer, .g-garage")
          .filter(function(v, i){ 
            return d.key !== ( v.key ? v.key : v.ID );
          })
          .transition()
          .duration(25)
          .attr("opacity", 0.2);

        d3.select(this).attr("stroke","black")

      })
      .on("mouseout", function(d){
         d3.selectAll(".layer, .g-garage")
          .transition()
          .duration(25)
          .attr("opacity", 1);

          selectGarage = "total";
          selectGarageName = "total";

          d3.select(this).attr("stroke","none")

      })

  var vertical = svgGraph.append("line")
    .attr({
      x1: 0,
      x2: 0,
      y1: 0,
      y2: heightGraph,
      class: "vertical",
      stroke: "white",
      // transform: "translate(4,0)"
    });

  svgGraph.on("mousemove", function(){  
         var mousex = d3.mouse(this)[0];
         if(Math.abs(d3.event.webkitMovementX) > 1) {
          time = moment(xLine.invert(mousex));
          if(pause) update();
        }
       });

  d3.timer(tick);

}


