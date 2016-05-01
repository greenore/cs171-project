ChargerDistr = function (_parentElement, _data,_colorScale) {
    this.parentElement = _parentElement;
    this.colorScale = _colorScale;
    this.data = _data;
    this.duration = 750;
    this.margin = {
        top: 20,
        right: 5,
        bottom: 30,
        left: 5
    };
    this.width = 600  - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;

    this.initVis();
};



/*
 *  Initialize charger distr
 */


ChargerDistr.prototype.initVis = function () {
    var vis = this;


    vis.chart = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    //vis.chart.append("text")
    //    .style("fill", "white")
    //    .text("Charger Distribution")
    //    .attr("x", vis.width / 2)
    //    .attr("y", -vis.margin.top / 2);

    vis.yScaleRight = d3.scale.linear()
        .range([vis.height, 0]);

    vis.xScaleRight = d3.scale.ordinal()
        .domain(vis.data.map(function (d) {
            return d.key
        }))
        .rangeRoundBands([0, vis.width], 0.1);

    vis.xAxisRight = d3.svg.axis()
        .scale(vis.xScaleRight)
        .orient("bottom");


    vis.yAxisRight = d3.svg.axis()
        .scale(vis.yScaleRight)
        .orient("left");

    vis.updateVis();
};

ChargerDistr.prototype.updateData = function (updatedData) {
    var vis = this;
    vis.data = updatedData;
    vis.updateVis();
};


ChargerDistr.prototype.updateVis = function () {
    var vis = this;
    vis.yScaleRight.domain([0, d3.max(vis.data, function (d) {
        return d.value
    })]);

    vis.bar = vis.chart.selectAll("g")
        .data(vis.data)
        .enter().append("g")
        .attr('id', function (d) {
            return d
        })
        .attr("transform", function (d) {
            return "translate(" + vis.xScaleRight(d.key) + ",0)";
        });

        //.on('click',function(d){
        //    d3.select(this).classed("active", !d3.select(this).classed("active"));
        //    if (d3.select(this).classed("active"))
        //    {filterMap(d.key,'add')}
        //    else {filterMap(d.key,'remove')}
        //})



    vis.bar.append("rect")
        .attr("class", "distrRect")
        .attr("width", vis.xScaleRight.rangeBand())
        .style('fill',function(d){return vis.colorScale(d.key)})
        .append('title')
        .text(function(d) {return d.name + ' : ' + d.value});


    vis.chart.selectAll('title')
        .data(vis.data)
        .text(function(d) {return d.name + ' : ' + d.value});

    vis.chart.selectAll('rect')
        .data(vis.data)
        .transition(vis.duration)
        .attr("y", function (d) {
            return vis.yScaleRight(d.value);
        })
        .attr("height", function (d) {
            return vis.height - vis.yScaleRight(d.value);
        });

    //vis.bar.append("text")
    //    .attr("x", vis.xScaleRight.rangeBand() / 2)
    //    .attr('class', 'chargerText')
    //    .style("text-anchor", "middle")
    //    .style("fill", "white")
    //    .text(function (d) {
    //        console.log(d);
    //        return chargerTypes[d.key]
    //    })
    //    .attr("y", function (d) {
    //        return vis.yScaleRight(d.value) - 10
    //    });


    vis.chart.append("g")
        .attr("class", "x axis")
        .style("fill", "white")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxisRight);

    vis.chart.append("g")
        .attr("class", "y axis")
        .call(vis.yAxisRight)
        .style("fill", "white")
        .append("text")
        .attr("transform", "translate("+ '-5' +","+(vis.height/2)+")rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Charger Distribution");
};
