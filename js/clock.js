//=========CLOCK PARAMETERS AND HELPER FUNCTIONS===========


var maxSize = 250
  , offSetX = maxSize/2
  , offSetY = offSetX
  , width = maxSize
  , height = maxSize
  ,fontSize = 14
  , maxSize=Math.min(width,height)
  , pi = Math.PI
  , rad = maxSize/2-40;

function toDegrees(rad) {
  return rad * (180/Math.PI);
}

//=========CREATE THE SVG AND CLOCK PARTS===========

var  vis = d3.select("#clock").append("svg").attr("width", width).attr("height", height);

var clockGroup = vis.append("g").attr("transform", "translate(" + offSetX + "," + offSetY + ")");

clockGroup.append("circle").attr("r", rad).attr("fill","white").attr("class", "clock outercircle").attr("stroke", "black")
.attr("stroke-width","3px");

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

var minuteHand = gHands.append("g").attr("class","hand");
    
minuteHand.append("rect")
  .attr({
    width: rad*0.6,
    height: 4,
    y: -2,
    ry: 4,
    rx: 4,
    x: 6,
    transform: "rotate(-90)"
  });

var hourHand = gHands.append("g").attr("class","hand")

hourHand.append("rect")
    .attr({
      width: rad*0.4,
      height: 8,
      y: -4,
      x: 6,
      ry: 8,
      rx: 8,
      transform: "rotate(-90)"
    });

//==========ROTATING CLOCKHANDS FUNCTIONALITY=====

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
      
      time.add(delMin, "minutes");

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

      time.add(delMin, "minutes");

      update();

      curAngleHour = newAngle;

    });

minuteHand.call(dragMinute);
hourHand.call(dragHour);

//===========AM VS PM LABEL ===============

var AmPm = gHands.append("g")
  .append("text")
  .text(function(){return (time.hour() >= 12) ? "PM" : "AM" })
  .attr("dx", "0em")
  .attr("dy","3.5em")
  .style("text-anchor", "middle")

//===========UPDATE FUNCTION FOR WHENEVER TIME CHANGES===============

function update(){

  hourHand.attr("transform","rotate(" + ( (time.hour()%12) * 360/12 + (time.minute() /60 * 360/12) ) +")" );
  minuteHand.attr("transform","rotate(" + (time.minute() * 6) +")" );
  
  d3.selectAll(".out")
    .attr("stroke-width", function(d){
      var q = d[bisect(d, time, 0, d.length - 1)].flow;
      return th(q);
    });

  d3.selectAll(".in")
    .attr("stroke-width", function(d){
      var q = d[bisect(d, time, 0, d.length - 1)].flow;
      return th(q);
    });

  d3.selectAll(".garage").attr("r", function(d){
      var o = d.occupancy,
        v = o[bisect(o, time, 0, o.length - 1)]
      return r(v.occ); 
    });

  AmPm.text(function(){return (time.hour()>+12) ? "PM" : "AM" })

} //update;

var last = 0;

d3.timer(function(elapsed) {
  if(pause) return false;

  t = (elapsed - last)/duration *5;

  last = elapsed;

  time.add(t,"minutes");

  if(time.isAfter(endOfDay)) time = startOfDay;

  update();

});