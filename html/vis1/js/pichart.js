    /*
     * PiChart - Object constructor function
     * @param _parentElement 	-- the HTML element in which to draw the visualization
     * @param _data				-- data
     */

    PiChart = function (_parentElement, _data, _stateid) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.stateid = _stateid;
        this.statename = "Alabama";
        this.category = {};
        this.dynamicval = {};
        this.legendrectsz = 10;
        this.lspacing = 3;


        this.initVis();
    };


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    PiChart.prototype.initVis = function () {
        var vis = this;

    vis.ypadding = 5;
    vis.margin = { top: 20, right: 20, bottom: 30, left: 0 };

    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 200 - vis.margin.top - vis.margin.bottom;

        vis.radius = (vis.height + 40) / 2;
        vis.color = d3.scale.category20c();

        // TO-DO
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", "translate(" + vis.width / 4 + "," + vis.height / 2 + ")");


        vis.w = 120,
            vis.h = 120,
            vis.r = vis.h / 2,
            vis.color = d3.scale.category20c();

        vis.arc = d3.svg.arc()
            .outerRadius(vis.r);

        vis.pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        vis.category[0] = "Coal";
        vis.category[1] = "Oil";
        vis.category[2] = "Natural Gas";
        vis.category[3] = "Nuclear";
        vis.category[4] = "Other";
        vis.category[5] = "Hydro";
        vis.category[6] = "Biomass";
        vis.category[7] = "Geothermal";
        vis.category[8] = "Solar";
        vis.category[9] = "Wind";

        vis.dynamicval["#543005"] = 0;
        vis.dynamicval["#8c510a"] = 1;
        vis.dynamicval["#bf812d"] = 2;
        vis.dynamicval["#dfc27d"] = 3;
        vis.dynamicval["#f6e8c3"] = 4;
        vis.dynamicval["#c7eae5"] = 5;
        vis.dynamicval["#80cdc1"] = 6;
        vis.dynamicval["#35978f"] = 7;
        vis.dynamicval["#01665e"] = 8;
        vis.dynamicval["#003c30"] = 9;

        //var color = d3.scale.category20b();

        vis.color = ["#543005", "#8c510a",
                     "#bf812d", "#dfc27d",
                     "#f6e8c3", "#c7eae5",
                     "#80cdc1", "#35978f",
                     "#01665e", "#003c30"];

        vis.legend = vis.svg.selectAll('.legend')
            .data(vis.color)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                ht = vis.legendrectsz + vis.lspacing;
                ofst =  ht * vis.color.length / 2;
                hz = 16 * vis.legendrectsz;
                vt = i * ht - ofst;
                return 'translate(' + hz + ',' + vt + ')';
            });

        vis.legend.append('rect')
            .data(vis.color)
            .attr('width', vis.legendrectsz)
            .attr('height', vis.legendrectsz)
            .style('fill', function(d){
                return d;
            })
            .style('stroke', "#222");


        vis.legend.append('text')
            .attr("class", "dynamictext")
            .attr('x', vis.legendrectsz + vis.lspacing)
            .attr('y', vis.legendrectsz - vis.lspacing)
            .text("place holder");

        vis.legend.append('text')
            .attr('x', vis.legendrectsz - ( 6 * (vis.legendrectsz  + vis.lspacing)))
            .attr('y', vis.legendrectsz - vis.lspacing)
            .text(function(d,i) { return vis.category[i]; });



        // TO-DO: (Filter, aggregate, modify data)
        vis.wrangleData();
    };


    /*
     * Data wrangling if necessary
     */

    PiChart.prototype.wrangleData = function () {
        var vis = this;

        vis.piedata = [];
        vis.data.map(function (d) {
            if (d.stateid == vis.stateid) {
                vis.piedata.push(d.pdata);
            }
        });
        vis.data.forEach(function (d) {
            if (d.stateid == vis.stateid) {
                vis.statename = d.state;
            }
        });


        vis.chartdata = [];
        vis.labelarray = [];

        $.each(vis.piedata, function (key, value) {
            var i = 0;
            $.each(value, function (k, v) {
                vis.labelarray[i++] = k;
                vis.chartdata.push({
                    label: k,
                    value: v
                });
            });
        });

        // Update the visualization
        vis.updateVis();
    };


    PiChart.prototype.updateVis = function () {
        var vis = this;
        $("#statename").html("(" + vis.statename + ")");

        vis.svg.data([vis.chartdata]);

        vis.arcs = vis.svg.selectAll("path.g.slice")
            .data(vis.pie)
            .enter()
            .append("g")
            .attr("class", "slice");
        
        vis.arcs.append("path")
            .attr("fill", function (d, i) {
                return vis.color[i];
            })
            .attr("d", vis.arc)
            .attr("stroke-dasharray", "0.5")
            .attr("stroke-width", "2")
            .attr("stroke", "#222");

        vis.legend.selectAll('.dynamictext')
            .attr('x', vis.legendrectsz + vis.lspacing)
            .attr('y', vis.legendrectsz - vis.lspacing)
            .text(function(d,i) {
                return vis.chartdata[vis.dynamicval[d]].value;
            });

    };
