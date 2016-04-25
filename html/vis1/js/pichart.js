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
        this.lspacing = 4;

        //console.log("PiChart");
        console.log(this.data);
        //console.log(this.stateid);
        //console.log(this.statename);

        this.initVis();
    };


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    PiChart.prototype.initVis = function () {
        var vis = this;

        vis.margin = {
            top: 10,
            right: 0,
            bottom: 60,
            left: 10
        };

        vis.width = 400 - vis.margin.left - vis.margin.right;
        vis.height = 250 - vis.margin.top - vis.margin.bottom;
        vis.radius = (vis.height + 40) / 2;
        vis.color = d3.scale.category20c();


        // TO-DO
        vis.svg = d3.select("#piechart_area").append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");


        vis.w = 150,
            vis.h = 150,
            vis.r = vis.h / 2,
            vis.color = d3.scale.category20c();

        vis.arc = d3.svg.arc()
            .outerRadius(vis.r);

        vis.pie = d3.layout.pie()
            .value(function (d) {
                return d.value;
            });


        vis.category[0] = "Natural Gas";
        vis.category[1] = "Nuclear";
        vis.category[2] = "Coal";
        vis.category[3] = "Other";
        vis.category[4] = "Hydro";
        vis.category[5] = "Biomass";
        vis.category[6] = "Geothermal";
        vis.category[7] = "Solar";
        vis.category[8] = "Wind";
        vis.category[9] = "Oil";

        vis.dynamicval["#3A01DF"] = 0;
        vis.dynamicval["#B40404"] = 1;
        vis.dynamicval["#000000"] = 2;
        vis.dynamicval["#FF00FF"] = 3;
        vis.dynamicval["#01A9DB"] = 4;
        vis.dynamicval["#886A08"] = 5;
        vis.dynamicval["#DF7401"] = 6;
        vis.dynamicval["#FFFF00"] = 7;
        vis.dynamicval["#3ADF00"] = 8;
        vis.dynamicval["#6E6E6E"] = 9;


        //var color = d3.scale.category20b();

        vis.color = ["#3A01DF", "#B40404",
                     "#000000", "#FF00FF",
                     "#01A9DB", "#886A08",
                     "#DF7401", "#FFFF00",
                     "#3ADF00", "#6E6E6E"];


        vis.legend = vis.svg.selectAll('.legend')
            .data(vis.color)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                ht = vis.legendrectsz + vis.lspacing;
                ofst = ht * vis.color.length / 2;
                hz = 16 * vis.legendrectsz;
                vt = i * ht - ofst;
                return 'translate(' + hz + ',' + vt + ')';
            });

        vis.legend.append('rect')
            .data(vis.color)
            .attr('width', vis.legendrectsz)
            .attr('height', vis.legendrectsz)
            .style('fill', function (d) {
                return d;
            })
            .style('stroke', "#222");

        vis.legend.append('text')
            .attr('x', vis.legendrectsz - (6 * (vis.legendrectsz + vis.lspacing)))
            .attr('y', vis.legendrectsz - vis.lspacing)
            .text(function (d, i) {
                return vis.category[i];
            });


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
                console.log("STATE");
                console.log(vis.statename);
            }
        });

        //console.log(vis.piedata);

        vis.chartdata = [];
        vis.labelarray = [];

        $.each(vis.piedata, function (key, value) {
            //console.log( key );
            var i = 0;
            $.each(value, function (k, v) {
                //console.log(k);
                //console.log(v);
                vis.labelarray[i++] = k;
                vis.chartdata.push({
                    label: k,
                    value: v
                });
            });
        });

        console.log("Hello World!");
        console.log(vis.chartdata);

        // Update the visualization
        vis.updateVis();
    };


    PiChart.prototype.updateVis = function () {
        var vis = this;
        //console.log(vis.chartdata[0].value);
        console.log(vis.statename);
        $("#statename").html("<br> (" + vis.statename + ")");

        vis.svg.data([vis.chartdata]);

        vis.arcs = vis.svg.selectAll("path.g.slice")
            .data(vis.pie)
            .enter()
            .append("g")
            .attr("class", "slice");

        vis.arcs.append("path")
            .attr("fill", function (d, i) {
                //console.log(d.value);
                return vis.color[i];
            })
            .attr("d", vis.arc)
            .attr("stroke-dasharray", "0.5")
            .attr("stroke-width", "0.5")
            .attr("stroke", "#222");

    };