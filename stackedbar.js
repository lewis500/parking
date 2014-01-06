var data = [{"city":"New York ","non-workers living in place":4437066,"workers commuting out":303497,"workers commuting in":912451,"workers living and working in city":3337908},
	{"city":"Los Angeles ","non-workers living in place":2024529,"workers commuting out":584880,"workers commuting in":754973,"workers living and working in city":1163077},
	{"city":"Chicago ","non-workers living in place":1484155,"workers commuting out":312747,"workers commuting in":490204,"workers living and working in city":906564},
	{"city":"Houston ","non-workers living in place":1099687,"workers commuting out":186308,"workers commuting in":763609,"workers living and working in city":782031},
	{"city":"Philadelphia ","non-workers living in place":901395,"workers commuting out":146825,"workers commuting in":253071,"workers living and working in city":456730},
	{"city":"Phoenix ","non-workers living in place":787476,"workers commuting out":210941,"workers commuting in":343153,"workers living and working in city":451789},
	{"city":"San Diego ","non-workers living in place":655569,"workers commuting out":130874,"workers commuting in":297954,"workers living and working in city":496357},
	{"city":"Dallas ","non-workers living in place":637828,"workers commuting out":192909,"workers commuting in":436522,"workers living and working in city":356548},
	{"city":"San Antonio ","non-workers living in place":711608,"workers commuting out":75889,"workers commuting in":178853,"workers living and working in city":502699},
	{"city":"Washington ","non-workers living in place":291421,"workers commuting out":77907,"workers commuting in":539543,"workers living and working in city":215072},
	{"city":"San Francisco ","non-workers living in place":355498,"workers commuting out":102709,"workers commuting in":265164,"workers living and working in city":330965},
	{"city":"Indianapolis  (balance)","non-workers living in place":429282,"workers commuting out":78278,"workers commuting in":217701,"workers living and working in city":302244},
	{"city":"Austin ","non-workers living in place":355180,"workers commuting out":61220,"workers commuting in":208164,"workers living and working in city":347729},
	{"city":"Jacksonville ","non-workers living in place":423766,"workers commuting out":37398,"workers commuting in":112945,"workers living and working in city":350669},
	{"city":"San Jose ","non-workers living in place":490929,"workers commuting out":204708,"workers commuting in":154294,"workers living and working in city":229663},
	{"city":"Columbus ","non-workers living in place":390368,"workers commuting out":126211,"workers commuting in":206310,"workers living and working in city":253828},
	{"city":"Boston ","non-workers living in place":294070,"workers commuting out":101104,"workers commuting in":342804,"workers living and working in city":207435},
	{"city":"Charlotte ","non-workers living in place":351418,"workers commuting out":64040,"workers commuting in":193363,"workers living and working in city":290438},
	{"city":"Detroit ","non-workers living in place":531325,"workers commuting out":113367,"workers commuting in":162935,"workers living and working in city":114648},
	{"city":"Memphis ","non-workers living in place":379806,"workers commuting out":44446,"workers commuting in":161143,"workers living and working in city":230624},
	{"city":"Fort Worth ","non-workers living in place":384532,"workers commuting out":130004,"workers commuting in":188451,"workers living and working in city":190813},
	{"city":"Seattle ","non-workers living in place":255691,"workers commuting out":87793,"workers commuting in":245380,"workers living and working in city":251756},
	{"city":"Denver ","non-workers living in place":282655,"workers commuting out":112382,"workers commuting in":268512,"workers living and working in city":183050},
	{"city":"Baltimore ","non-workers living in place":354034,"workers commuting out":103871,"workers commuting in":206924,"workers living and working in city":162633},
	{"city":"Nashville-Davidson metropolitan government (balance)","non-workers living in place":295252,"workers commuting out":57768,"workers commuting in":159882,"workers living and working in city":234770}]

var color = d3.scale.ordinal()
    .range(["#2ecc71", "#3498db", "#e74c3c", "#34495e"]);
		.domain(["workers commuting out", "non-workers living in place", "workers living and working in city", "workers commuting in"]);

var n = 4, // number of layers
    m = data.length, // number of samples per layer
    stack = d3.layout.stack(),
    labels = data.map(function(d) {return d.city;}),
    
    //go through each layer (pop1, pop2 etc, that's the range(n) part)
    //then go through each object in data and pull out that objects's population data
    //and put it into an array where x is the index and y is the number
    layers = stack(data),
    
	//the largest single layer
    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
    //the largest stack
    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

var margin = {top: 40, right: 10, bottom: 20, left: 50},
    width = 677 - margin.left - margin.right,
    height = 533 - margin.top - margin.bottom;

var y = d3.scale.ordinal()
    .domain(d3.range(m))
    .rangeRoundBands([2, height], .08);

var x = d3.scale.linear()
    .domain([0, yStackMax])
    .range([0, width]);

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var layer = svg.selectAll(".layer")
    .data(layers)
  .enter().append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { return color(i); });

layer.selectAll("rect")
    .data(function(d) { return d; })
  	.enter().append("rect")
    .attr("y", function(d) { return y(d.x); })
	.attr("x", function(d) { return x(d.y0); })
    .attr("height", y.rangeBand())
    .attr("width", function(d) { return x(d.y); });

var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(1)
    .tickPadding(6)
	.tickValues(labels)
    .orient("left");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

