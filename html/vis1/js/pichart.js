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

        vis.margin = {top: 10, right: 0, bottom: 60, left: 10};

        vis.width = 350 - vis.margin.left - vis.margin.right;
        vis.height = 250 - vis.margin.top - vis.margin.bottom;
        vis.radius = (vis.height + 40) / 2;
        vis.color = d3.scale.category20c();


        // TO-DO
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");


        vis.w = 130,
            vis.h = 130,
            vis.r = vis.h / 2,
            vis.color = d3.scale.category20c();

        vis.arc = d3.svg.arc()
            .outerRadius(vis.r);

        vis.pie = d3.layout.pie()
            .value(function (d) {
                return d.value;
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

        console.log(vis.chartdata);

        // Update the visualization
        vis.updateVis();
    };


    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */

    PiChart.prototype.updateVis = function () {
        var vis = this;

        //console.log(vis.chartdata[0].value);
        console.log(vis.statename);
        $("#statename").html(" (" + vis.statename + ")");

        vis.svg.data([vis.chartdata]);

        vis.arcs = vis.svg.selectAll("path.g.slice")
            .data(vis.pie)
            .enter()
            .append("g")
            .attr("class", "slice")
        vis.arcs.append("path")
            .attr("fill", function (d, i) {
                return vis.color(i);
            })
            .attr("d", vis.arc);

    };
