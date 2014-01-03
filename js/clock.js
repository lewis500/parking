
var maxSize = 250;

var offSetX = maxSize/2;

var  offSetY = offSetX;

var  width = maxSize;

var  height = maxSize;

var fontSize = 14;

var  maxSize=Math.min(width,height);

var  pi = Math.PI;

var rad = maxSize/2-40;

var scaleHours = d3.scale.linear().range([0, 11 + 59 / 60]).domain([0, 2 * pi]);

var vis = d3.select("#clock").append("svg").attr("width", width).attr("height", height);

var clockGroup = vis.append("g").attr("transform", "translate(" + offSetX + "," + offSetY + ")");

clockGroup.append("circle").attr("r", rad).attr("fill","white").attr("class", "clock outercircle").attr("stroke", "black");

clockGroup.append("circle").attr("r", 4).attr("fill", "black").attr("class", "clock innercircle");

var tickLabelGroup=vis.append("g").attr("transform", "translate(" + offSetX + "," + offSetY + ")");

tickLabelGroup.selectAll("text.label")
    .data(d3.range(12))
    .enter().append("text")
    .attr("class", "label")
    .attr("x", function(d, i){return ((rad- fontSize))*Math.cos(2*i*0.26-1.57)  })
    .attr("y", function(d, i){return 7+((rad- fontSize))*Math.sin(2*i*0.26-1.57)   })
    .attr("text-anchor", "middle")
    .text(function(d, i)
             { 
               if (d==0) 
                  return 12;
              else return d;
             }
         );

var gHands = vis.append("g")
    .attr("transform", "translate(" + offSetX + "," + offSetY + ")")
    .attr("class","g-hands");

var minuteHand = gHands.append("g");
    
minuteHand.append("rect")
  .attr({
    width: rad*0.7,
    height: 4,
    y: -2,
    ry: 4,
    transform: "rotate(-90)"
  });

var hourHand = gHands.append("g")

hourHand.append("rect")
    .attr({
      width: rad*0.5,
      height: 8,
      y: -4,
      ry: 8,
      transform: "rotate(-90)"
    });

var curAngle, curAngleHour;

var dragMinute = d3.behavior.drag()
    .on("drag", function() {

      var mx = d3.event.x;
      var my = d3.event.y;

      var newAngle = toDegrees( Math.atan2(my, mx) ) + 90;

      var delMin = (newAngle - curAngle)/6;

      if(newAngle >= 0 && curAngle <= -60) {
        delMin -= 60;
      }
      if(newAngle < -60 && curAngle >= 0){
        delMin += 60;
      }

      if(Math.abs(delMin) < 3) return;
      
      minuteHand.attr("transform", "rotate(" + (newAngle) + ")");

      time.add(delMin, "minutes");

      hourHand.attr("transform","rotate(" + ( (time.hour()%12) * 360/12 + (time.minute() /60 * 360/12) ) +")" );

      update();

      curAngle = newAngle;

    });

var dragHour = d3.behavior.drag()
    .on("drag", function() {

      var mx = d3.event.x;
      var my = d3.event.y;

      var newAngle = toDegrees( Math.atan2(my, mx) ) + 90;

      var delMin = (newAngle - curAngleHour)*2;

      if(newAngle >= 0 && curAngleHour <= -60) {
        delMin -= 60*12;
      }

      if(newAngle < -60 && curAngleHour >= 0){
        delMin += 60*12;
      }

      if(Math.abs(delMin) < 10) return;

      hourHand.attr("transform", "rotate(" + (newAngle) + ")");

      time.add(delMin, "minutes");

      minuteHand.attr("transform","rotate(" + (time.minute() * 6) +")" );

      update();

      curAngleHour = newAngle;
    });


function toDegrees(rad) {
  return rad * (180/Math.PI);
}

minuteHand.call(dragMinute);
hourHand.call(dragHour);