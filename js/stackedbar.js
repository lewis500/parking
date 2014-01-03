//NO PRIDE IN MY CODE! I'M COPY AND PASTING THIS! HOLA, ENJALOT

var div = d3.select(".tooltip")

var format = d3.format('0,000');


var data = [{"city":"New York ","non-workers":4437066,"workers commuting out":-303497,"workers commuting in":912451,"workers living and working in city":3337908},
    {"city":"Los Angeles ","non-workers":2024529,"workers commuting out":-584880,"workers commuting in":754973,"workers living and working in city":1163077},
    {"city":"Chicago ","non-workers":1484155,"workers commuting out":-312747,"workers commuting in":490204,"workers living and working in city":906564},
    {"city":"Houston ","non-workers":1099687,"workers commuting out":-186308,"workers commuting in":763609,"workers living and working in city":782031},
    {"city":"Philadelphia ","non-workers":901395,"workers commuting out":-146825,"workers commuting in":253071,"workers living and working in city":456730},
    {"city":"Phoenix ","non-workers":787476,"workers commuting out":-210941,"workers commuting in":343153,"workers living and working in city":451789},
    {"city":"San Diego ","non-workers":655569,"workers commuting out":-130874,"workers commuting in":297954,"workers living and working in city":496357},
    {"city":"Dallas ","non-workers":637828,"workers commuting out":-192909,"workers commuting in":436522,"workers living and working in city":356548},
    {"city":"San Antonio ","non-workers":711608,"workers commuting out":-75889,"workers commuting in":178853,"workers living and working in city":502699},
    {"city":"Washington ","non-workers":291421,"workers commuting out":-77907,"workers commuting in":539543,"workers living and working in city":215072},
    {"city":"San Francisco ","non-workers":355498,"workers commuting out":-102709,"workers commuting in":265164,"workers living and working in city":330965},
    {"city":"Indianapolis","non-workers":429282,"workers commuting out":-78278,"workers commuting in":217701,"workers living and working in city":302244},
    {"city":"Austin ","non-workers":355180,"workers commuting out":-61220,"workers commuting in":208164,"workers living and working in city":347729},
    {"city":"Jacksonville ","non-workers":423766,"workers commuting out":-37398,"workers commuting in":112945,"workers living and working in city":350669},
    {"city":"San Jose ","non-workers":490929,"workers commuting out":-204708,"workers commuting in":154294,"workers living and working in city":229663},
    {"city":"Columbus ","non-workers":390368,"workers commuting out":-126211,"workers commuting in":206310,"workers living and working in city":253828},
    {"city":"Boston ","non-workers":294070,"workers commuting out":-101104,"workers commuting in":342804,"workers living and working in city":207435},
    {"city":"Charlotte ","non-workers":351418,"workers commuting out":-64040,"workers commuting in":193363,"workers living and working in city":290438},
    {"city":"Detroit ","non-workers":531325,"workers commuting out":-113367,"workers commuting in":162935,"workers living and working in city":114648},
    {"city":"Memphis ","non-workers":379806,"workers commuting out":-44446,"workers commuting in":161143,"workers living and working in city":230624},
    {"city":"Fort Worth ","non-workers":384532,"workers commuting out":-130004,"workers commuting in":188451,"workers living and working in city":190813},
    {"city":"Seattle ","non-workers":255691,"workers commuting out":-87793,"workers commuting in":245380,"workers living and working in city":251756},
    {"city":"Denver ","non-workers":282655,"workers commuting out":-112382,"workers commuting in":268512,"workers living and working in city":183050},
    {"city":"Baltimore ","non-workers":354034,"workers commuting out":-103871,"workers commuting in":206924,"workers living and working in city":162633},
    {"city":"Nashville-Davidson","non-workers":295252,"workers commuting out":-57768,"workers commuting in":159882,"workers living and working in city":234770}]

var margin = {top: 20, right: 20, bottom: 30, left: 130},
    width = 620 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scale.ordinal()
    .range(["#e74c3c", "#3498db",  "#34495e", "#2ecc71", ]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

var x = d3.scale.linear()
    .range([0, width]);

color.domain(["workers commuting out","non-workers","workers living and working in city",  "workers commuting in", ]);

var min = d3.min(data, function(d){return d["workers commuting out"]; });

data.forEach(function(d){
  var x0 = d["workers commuting out"];
  d.pops = color.domain().map(function(name) { 
	  	return {
				  name: name, 
				  x0: x0, 
				  x1: x0 += Math.abs(+d[name]) 
			  } 
	  }); //name refers to like "workers commuting in"
  d.total = d.pops[d.pops.length - 1].x1;
});

y.domain(data.map(function(d) { return d.city; }));

x.domain([ min*1.5 , d3.max(data, function(d) { return d.total; }) -min ]);

var city = svg.selectAll(".city")
    .data(data)
  .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + [0, y(d.city)] + ")"; });

var rects = city.selectAll("rect")
    .data(function(d) { return d.pops; })
  .enter().append("rect")
    .attr("height", y.rangeBand())
    .attr("x", function(d) { return x(d.x0); })
    .attr("width", function(d) { return x(d.x1) - x(d.x0); })
    .attr("stroke","white")
    .attr("stroke-width","0px")
    .style("fill", function(d) { return color(d.name); });

rects.on("mousemove", function(d) {
            div.transition()
                .duration(100)
                .style("opacity", .9)   
                .style("left", (d3.event.pageX +10) + "px")     
                .style("top", (d3.event.pageY - 25) + "px")
                .style("background", color(d.name))
                .style("color", function(){
                    if(d.name == "workers living and working in city" || d.name == "workers commuting out") return "white"
                    else return "black"
                })
                
            d3.select(this).transition()
                .duration(100).style("stroke-width","3px")    
                
            div.html( d3.select(this.parentNode).datum().city + "<br>" + d.name + " : " + format(d.x1 - d.x0))  
            })                 
        .on("mouseout", function(d) {      

            div.transition()        
                .duration(100)      
                .style("opacity", 0);   

                d3.select(this).transition()
                .duration(100).style("stroke-width","0px")
        });

var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + (250 +i * 20) + ")"; });

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format(".2s"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);
// .append("text")
//   .attr("transform", "rotate(-90)")
//   .attr("y", 6)
//   .attr("dy", ".71em")
//   .style("text-anchor", "end")
//   .text("Population");