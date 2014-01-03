//NO PRIDE IN MY CODE! I'M COPY AND PASTING THIS! HOLA, ENJALOT

var data = [
	{"city":"Los Angeles ","non-workers living in place":2024529,"workers commuting out":-584880,"workers commuting in":754973,"workers living and working in city":1163077},
	{"city":"Chicago ","non-workers living in place":1484155,"workers commuting out":-312747,"workers commuting in":490204,"workers living and working in city":906564},
	{"city":"Houston ","non-workers living in place":1099687,"workers commuting out":-186308,"workers commuting in":763609,"workers living and working in city":782031},
	{"city":"Philadelphia ","non-workers living in place":901395,"workers commuting out":-146825,"workers commuting in":253071,"workers living and working in city":456730},
	{"city":"Phoenix ","non-workers living in place":787476,"workers commuting out":-210941,"workers commuting in":343153,"workers living and working in city":451789},
	{"city":"San Diego ","non-workers living in place":655569,"workers commuting out":-130874,"workers commuting in":297954,"workers living and working in city":496357},
	{"city":"Dallas ","non-workers living in place":637828,"workers commuting out":-192909,"workers commuting in":436522,"workers living and working in city":356548},
	{"city":"San Antonio ","non-workers living in place":711608,"workers commuting out":-75889,"workers commuting in":178853,"workers living and working in city":502699},
	{"city":"Washington ","non-workers living in place":291421,"workers commuting out":-77907,"workers commuting in":539543,"workers living and working in city":215072},
	{"city":"San Francisco ","non-workers living in place":355498,"workers commuting out":-102709,"workers commuting in":265164,"workers living and working in city":330965},
	{"city":"Indianapolis  (balance)","non-workers living in place":429282,"workers commuting out":-78278,"workers commuting in":217701,"workers living and working in city":302244},
	{"city":"Austin ","non-workers living in place":355180,"workers commuting out":-61220,"workers commuting in":208164,"workers living and working in city":347729},
	{"city":"Jacksonville ","non-workers living in place":423766,"workers commuting out":-37398,"workers commuting in":112945,"workers living and working in city":350669},
	{"city":"San Jose ","non-workers living in place":490929,"workers commuting out":-204708,"workers commuting in":154294,"workers living and working in city":229663},
	{"city":"Columbus ","non-workers living in place":390368,"workers commuting out":-126211,"workers commuting in":206310,"workers living and working in city":253828},
	{"city":"Boston ","non-workers living in place":294070,"workers commuting out":-101104,"workers commuting in":342804,"workers living and working in city":207435},
	{"city":"Charlotte ","non-workers living in place":351418,"workers commuting out":-64040,"workers commuting in":193363,"workers living and working in city":290438},
	{"city":"Detroit ","non-workers living in place":531325,"workers commuting out":-113367,"workers commuting in":162935,"workers living and working in city":114648},
	{"city":"Memphis ","non-workers living in place":379806,"workers commuting out":-44446,"workers commuting in":161143,"workers living and working in city":230624},
	{"city":"Fort Worth ","non-workers living in place":384532,"workers commuting out":-130004,"workers commuting in":188451,"workers living and working in city":190813},
	{"city":"Seattle ","non-workers living in place":255691,"workers commuting out":-87793,"workers commuting in":245380,"workers living and working in city":251756},
	{"city":"Denver ","non-workers living in place":282655,"workers commuting out":-112382,"workers commuting in":268512,"workers living and working in city":183050},
	{"city":"Baltimore ","non-workers living in place":354034,"workers commuting out":-103871,"workers commuting in":206924,"workers living and working in city":162633},
	{"city":"Nashville-Davidson metropolitan government (balance)","non-workers living in place":295252,"workers commuting out":-57768,"workers commuting in":159882,"workers living and working in city":234770}]

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 620 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scale.ordinal()
    .range(["#e74c3c", "#3498db",  "#34495e", "#2ecc71", ]);

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

color.domain(["workers commuting out","non-workers living in place", "workers commuting in", "workers living and working in city"]);

var min = d3.min(data, function(d){return d["workers commuting out"]; });

data.forEach(function(d){
  var y0 = d["workers commuting out"];
  d.pops = color.domain().map(function(name) { 
	  	return {
				  name: name, 
				  y0: y0, 
				  y1: y0 += Math.abs(+d[name]) 
			  } 
	  }); //name refers to like "workers commuting in"
  d.total = d.pops[d.pops.length - 1].y1;
});

x.domain(data.map(function(d) { return d.city; }));
y.domain([0, d3.max(data, function(d) { return d.total; })]);

var city = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.city) + ",0)"; });

city.selectAll("rect")
  .data(function(d) { return d.pops; })
.enter().append("rect")
  .attr("width", x.rangeBand())
  .attr("y", function(d) { return y(d.y1); })
  .attr("height", function(d) { return y(d.y0) - y(d.y1); })
  .style("fill", function(d) { return color(d.name); });

// var legend = svg.selectAll(".legend")
//     .data(color.domain().slice().reverse())
//   .enter().append("g")
//     .attr("class", "legend")
//     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// legend.append("rect")
//     .attr("x", width - 18)
//     .attr("width", 18)
//     .attr("height", 18)
//     .style("fill", color);

// legend.append("text")
//     .attr("x", width - 24)
//     .attr("y", 9)
//     .attr("dy", ".35em")
//     .style("text-anchor", "end")
//     .text(function(d) { return d; });