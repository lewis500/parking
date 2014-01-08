var xLine, z, bg
  , selectGarageName = "total"
  ,  selectGarage = "total"
  , selectOcc;

var st = false;

var sw;

(function(){


var total = 0;
var margin = { top: 5, right: 40, bottom: 20, left: 50 };
var width = 620 - margin.left;
var height = 250 - margin.top - margin.bottom; 
var max = 0;

xLine = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

z = d3.scale.category20c();

var stack = d3.layout.stack().offset("zero")
  .order("inside-out")
  .values(function(d) { return d.values; })
  .x(function(d) { return d.time; })
  .y(function(d) { return d.value; });

var area = d3.svg.area().interpolate("cardinal")
    .x(function(d) { return xLine(d.time); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.value + d.y0); });

var svg = d3.select("#garageChart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = d3.json("data/occs.json", function(data) {

  data.forEach(function(d) {

    d.time = moment(d.time);

  });

  var dimensions = d3.keys(data[0]).filter(function(key) { return key != "time"; });

  z.domain(dimensions)

  var layers = dimensions.map(function(name){
    return {
      key: name,
      values: data.map(function(d) { 
        return { time: d.time, value: +d[name], garage: name };
      })
    };
  });

  xLine.domain(d3.extent(data, function(d) { return d.time; }));

  data.forEach(function(row){

    var s = _.initial(d3.values(row));

    var tot = s.reduce(function(a,b){return a + b; });

    max = d3.max([tot, max]);

  });
  
  y.domain([-max*.05, max*1.2]);

  var xAxis = d3.svg.axis()
    .scale(xLine)
    .orient("bottom")
    .ticks(12);

  var yAxis = d3.svg.axis()
    .orient("right")
    .scale(y)
    .ticks(5);

  bg = svg.append("rect")
    .attr({
      width: width,
      height: height,
      fill: "white"
    })

  var streams = svg.selectAll(".layer")
    .data(stack(layers))
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", function(d) { return area(d.values); })
    .style("fill", function(d, i){ return z(d.key); });

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis.orient("left"));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  var pressed = false;

  svg.selectAll(".layer")
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
      // .on("click", function(d, i) {
      //   if(pressed){
      //       pressed = false;
      //       svg.selectAll(".layer")
      //       .transition()
      //       .duration(250)
      //       .attr("opacity", 1)
      //     }else{
      //       pressed = true
      //       svg.selectAll(".layer")
      //         .transition()
      //         .duration(250)
      //         .attr("opacity", function(d, j) {
      //           return j != i ? 0.2 : 1;
      //         })
      //     }
      //   })


  var vertical = svg.append("line")
    .attr({
      x1: 0,
      x2: 0,
      y1: 0,
      y2: height,
      class: "vertical",
      stroke: "white",
      // transform: "translate(4,0)"
    });

  svg.on("mousemove", function(){  
         var mousex = d3.mouse(this)[0];
         if(Math.abs(d3.event.webkitMovementX) > 1) {
          time = moment(xLine.invert(mousex));
          if(pause) update();
        }

       });


  sw = function(){

    if(st){
      stack.offset("silhouette");
    }else{
      stack.offset("zero");
    }

    streams.data(stack(layers))
      .transition()
      .duration(500)
      .ease('cubic')
      .attr("d", function(d) { return area(d.values); })

  }

  d3.timer(tick)

});

})()