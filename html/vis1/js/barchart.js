/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- data
 */

BarChart = function(_parentElement, _data, _stateid){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateid = _stateid;
    this.update = false;


    this.initVis();
};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.ypadding = 5;
    vis.margin = { top: 20, right: 0, bottom: 30, left: 50 };

    vis.width = 350 - vis.margin.left - vis.margin.right;
    vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // Format text
    vis.format = d3.format(",");

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO
    vis.x = d3.scale.ordinal().rangeRoundBands([0, vis.width], .05);
    vis.y = d3.scale.linear().range([vis.height, 0]);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .tickFormat(function(d) { return (d/1000) + " K"; })
        .ticks(4)
        .orient("left")
        .ticks(8);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");
    
    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
};



/*
 * Data wrangling if necessary
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;
    vis.barobj = [];
    vis.data.map( function(d)  {
        if (d.stateid == vis.stateid ) {
            vis.barobj.push(d.bdata);
        }
    });

    vis.bardata = [];
    $.each( vis.barobj, function( key, value ) {
        $.each( value, function( k, v ) {
            vis.bardata.push({
                type: k,
                value: v
            });
        });
    });

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

BarChart.prototype.updateVis = function(){
    var vis = this;

    vis.min = d3.min(vis.bardata, function (d) {
        return d.value;
    });
    vis.max = d3.max(vis.bardata, function (d) {
        return d.value;
    });

    vis.x.domain(vis.bardata.map(function(d) { return d.type; }));


    if (vis.update) {
        vis.svg.selectAll("rect")
            .data(vis.bardata)
            .attr("y", function(d) { return vis.y(d.value); })
            .attr("height", function(d) { return vis.height - vis.y(d.value); });

        vis.svg.selectAll(".bartext")
            .data(vis.bardata)
            .attr("x", function(d) { return (vis.x(d.type) + (vis.x.rangeBand()/3));})
            .attr("y", function(d) { return vis.y(d.value)-vis.ypadding; })
            .text(function(d){
                return (vis.format(d.value));
            });

    } else {

        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.y.domain([0, vis.max]);


        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        vis.svg.selectAll("rect")
            .data(vis.bardata)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .style("fill", "#35978f")
            .attr("x", function(d) { return vis.x(d.type); })
            .attr("width", vis.x.rangeBand())
            .attr("y", function(d) { return vis.y(d.value); })
            .attr("height", function(d) { return vis.height - vis.y(d.value); });

        vis.svg.selectAll(".rect")
            .data(vis.bardata)
            .enter()
            .append("g")
            .append("text")
            .attr("class", "bartext")
            .attr("x", function(d) { return (vis.x(d.type) + (vis.x.rangeBand()/3));})
            .attr("y", function(d) { return vis.y(d.value)-vis.ypadding; })
            .text(function(d){
                return (vis.format(d.value));
            });

        // Add the text label for the Y axis
        vis.svg.append("text")
            .attr("class", "ytext");
        // Add the text label for the Y axis
        vis.svg.selectAll("text.ytext")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (vis.margin.left + 0))
            .attr("x",0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Pounds of CO2 Equivalent");
    }

    vis.update = true;
};
