
var maxSize = 300;

var offSetX = maxSize/2;

var  offSetY = offSetX;

var  width = maxSize;

var  height = maxSize;

var fontSize = 14;

var  maxSize=Math.min(width,height);

var  pi = Math.PI;

var rad=maxSize/2-40;

var scaleSecs = d3.scale.linear().domain([1, 60 + 999 / 1000]).range([0, 2 * pi]);

var scaleMins = d3.scale.linear().domain([0, 59 + 59 / 60]).range([0, 2 * pi]);

var scaleHours = d3.scale.linear().domain([0, 11 + 59 / 60]).range([0, 2 * pi]);

var vis = d3.select("#clock").append("svg").attr("width", width).attr("height", height);

var clockGroup = vis.append("g").attr("transform", "translate(" + offSetX + "," + offSetY + ")");

clockGroup.append("circle").attr("r", rad).attr("fill","white").attr("class", "clock outercircle").attr("stroke", "black");

clockGroup.append("circle").attr("r", 4).attr("fill", "black").attr("class", "clock innercircle");

var tickLabelGroup=vis.append("g").attr("transform", "translate(" + offSetX + "," + offSetY + ")");

tickLabelGroup.selectAll("text.label")
    .data(d3.range(12))
    .enter().append("text")
    .attr("class", "label")
    // .attr("font-size",thisObj.fontSize)
    // .attr("font-family",thisObj.fontName)
    .attr("x", function(d, i){return ((rad- fontSize))*Math.cos(2*i*0.26-1.57)  })
    .attr("y", function(d, i){return 7+((rad- fontSize))*Math.sin(2*i*0.26-1.57)   })
    // .attr("fill", thisObj.textColor)
//    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle")
    .text(function(d, i)
             { 
               if (d==0) 
                  return 12;
              else return d;
             }
         );

var render = function(data) {
    var hourArc, minuteArc, secondArc;

    clockGroup.selectAll(".clockhand").remove();
    secondArc = d3.svg.arc().innerRadius(0).outerRadius(rad*0.85).startAngle(function(d) {
      return scaleSecs(d.numeric);
    }).endAngle(function(d) {
      return scaleSecs(d.numeric);
    });
    minuteArc = d3.svg.arc().innerRadius(0).outerRadius(rad*0.7).startAngle(function(d) {
      return scaleMins(d.numeric);
    }).endAngle(function(d) {
      return scaleMins(d.numeric);
    });
    hourArc = d3.svg.arc().innerRadius(0).outerRadius(rad*0.5).startAngle(function(d) {
      return scaleHours(d.numeric % 12);
    }).endAngle(function(d) {
      return scaleHours(d.numeric % 12);
    });
    return clockGroup.selectAll(".clockhand").data(data).enter().append("svg:path").attr("d", function(d) {
      if (d.unit === "seconds") {
        return secondArc(d);
      } else if (d.unit === "minutes") {
        return minuteArc(d);
      } else if (d.unit === "hours") {
        return hourArc(d);
      }
    }).attr("class", "clockhand").attr("stroke", "black").attr("stroke-width", function(d) {
      if (d.unit === "seconds") {
        return 1;
      } else if (d.unit === "minutes") {
        return 3;
      } else if (d.unit === "hours") {
        return 4;
      }
    }).attr("fill", "none");
  };

  fields = function(dateTime) {
    var dateTime, hour, minute, second,ampm,min;

    second = dateTime.getSeconds();
    minute = dateTime.getMinutes();
    hour = dateTime.getHours();
    ampm="a.m";
    if (minute<10) min="0"+minute;
    else min=minute;
    if (hour>=12) ampm="p.m";

    hour+= minute / 60;

    return [
      {
        "unit": "minutes",
        "numeric": minute
      }, {
        "unit": "hours",
        "numeric": hour
      }
    ];

};//fields()
