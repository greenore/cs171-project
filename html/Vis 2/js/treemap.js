
var margin = {top: 40, right: 60, bottom: 60, left: 60};

var width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var fundingData = [];

var parseDate = d3.time.format("%Y").parse;
var formatDate = d3.time.format("%Y");


var linetip = d3.tip().attr('class', 'd3-tip') .offset([-10, 0]).html(function(d){
    return formatDate(d.year) + ": $M " + d.fund
});



// --> CREATE SVG DRAWING AREA
var svgFundingChart = d3.select("#chart-area").append('svg')
    .attr("class","vis")
    .attr("id","fundingChartSVG")
    .attr("width", width  + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(formatDate);

svgFundingChart.call(linetip);

var color = d3.scale.category10();

var xAxisGroup = svgFundingChart.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + (height) + ")");

var yAxisGroup = svgFundingChart.append("g")
    .attr("class", "y-axis axis");

var line = d3.svg.line()
    //.interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.fund); });





function updateFundingChart(){


    color.domain(d3.keys(fundingData));

    x.domain([
        0.99 * d3.min(fundingData, function(c) { return d3.min(c.values, function(v) { return v.year; }); }),
        1.01 *d3.max(fundingData, function(c) { return d3.max(c.values, function(v) { return v.year; }); })
    ]);

    y.domain([
        d3.min(fundingData, function(c) { return d3.min(c.values, function(v) { return v.fund; }); }),
        d3.max(fundingData, function(c) { return d3.max(c.values, function(v) { return v.fund; }); })
    ]);

    svgFundingChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgFundingChart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var fundings = svgFundingChart.selectAll(".fundings")
        .data(fundingData)
        .enter().append("g")
        .attr("class", "fundings");

    fundings.append("path")
        .attr("class", "line")
        .attr("id",function(d,i){return "line-"+i} )
        .attr("d", function(d) {return line(d.values); })
        .style("stroke",function(d){return color(d.name)})
        .on("mouseover",function(d,i){
            d3.select("#legentText-"+i).style("font-weight", "bold");
            })
        .on("mouseout",function(d,i){
            d3.select("#legentText-"+i).style("font-weight", "normal");
            });

    var circles = svgFundingChart.selectAll(".markerGroup")
        .data(fundingData)
        .enter()
        .append("g").attr("class","markerGroup")
        .on("mouseover",function(d,i){
            d3.select("#legentText-"+i).style("font-weight", "bold");
        })
        .on("mouseout",function(d,i){
            d3.select("#legentText-"+i).style("font-weight", "normal");
        })
        .style("fill",function(d){ return color(d.name)});

    circles.selectAll(".markerYear")
        .data(function(d){return d.values})
        .enter().append("circle")
        .attr("cx", function(d){return x(d.year)} )
        .attr("cy", function(d) {return y(d.fund)})
        .style('cursor','pointer')
        .attr("r" , 3)
        .on("mouseover",function(d){
            d3.select(this).attr("r",5);
            linetip.show(d)})
        .on("mouseout",function(d){
            d3.select(this).attr("r",3);
            linetip.hide(d)});



    var ls_w = 20, ls_h = 20;
    var legend = svgFundingChart.append('g')
        .attr("transform", "translate(20,80)");

    legend.append("text")
        .attr("x", 20)
        .attr("y",-60)
        .style("text-anchor", "start")
        .text("Funding in  $M");

    var legends = legend.selectAll("g.legend")
        .data(fundingData)
        .enter().append("g")
        .attr("class", "legend")
        .style('cursor','pointer')
        .on("mouseover",function(d,i){ d3.select("#line-"+ i).style("stroke-width",4)})
        .on("mouseout",function(d,i){d3.select("#line-"+i).style("stroke-width",2)});

    legends.append("rect")
        .attr("x", 20)
        .attr("y", function(d, i){ return  (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d, i) {return color(d.name) })
        .style("opacity", 0.8);

    var textLegend = legends.append("text")
        .attr("class","legendText")
        .attr("id",function(d,i){return "legentText-" + i})
        .attr("x", 50)
        .attr("y", function(d, i){ return (i*ls_h) - ls_h - 4;});

    svgFundingChart.selectAll(".legendText").text(function(d) {return d.name});


};