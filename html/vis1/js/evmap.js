/*
 * EvMap - Object constructor function
 * @param _parentElement   -- the HTML element in which to draw the visualization
 * @param _data             -- data
 */

EvMap = function (_parentElement, _data, _topomapdata, _selected) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.topomapdata = _topomapdata;
    this.selected = _selected;
    this.populationdiv = 1000000;
    this.dcline = [];
    this.initVis();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

EvMap.prototype.initVis = function () {
    var vis = this;

    vis.margin = {
        top: 40,
        right: 0,
        bottom: 60,
        left: 15
    };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0]);

    vis.stateXY = {};
    vis.data.forEach(function (d) {
        vis.stateXY[d.stateid] = d.evdata.stateXY;
    });
    // SVG drawing area

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("id", "states")
        .attr("class", "Fillc")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO
    vis.projection = d3.geo.albersUsa()
        .scale(750)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.mapdata = topojson.feature(vis.topomapdata, vis.topomapdata.objects.states).features;

    // Render the mapdata by using the path generator
    vis.svg.append("g")
        .selectAll("path")
        .data(vis.mapdata)
        .enter()
        .append("path")
        .attr("d", vis.path)
        .attr("stroke", "#222") //Put lines for states
        .attr("stroke-width", "2") //Put lines for states
        .attr("stroke-dasharray", "0.5")
        .on("mouseover", function (d) {
            vis.mouseincolor(d);
            vis.tip.show(d);
            stateHover(d.id);
        })
        .on("mouseout", function (d) {
            vis.mouseoutcolor(d);
            vis.tip.hide(d);
        });

    vis.statefontsize = 0;

    vis.mapdata.forEach(function (d) {
        if (vis.stateXY[d.id] == "NH") {
            vis.xcoord = vis.path.centroid(d)[0] + 50;
            vis.ycoord = vis.path.centroid(d)[1];
        }
    });

    // Add State Abbreviations
    vis.svg.append("g")
        .selectAll("text")
        .data(vis.mapdata)
        .enter()
        .append("text")
        .attr("id", function (d) {
            return "stateid" + d.id;
        })
        .text(function (d) {
            return vis.stateXY[d.id];
        })
        .attr("x", function (d) {
            if (vis.inacluster(vis.stateXY[d.id])) {
                //if (vis.stateXY[d.id] == "DC") {
                vis.dcline.push({
                    s: vis.stateXY[d.id] + "x",
                    x1: vis.xcoord - 10,
                    x2: vis.path.centroid(d)[0]
                });
                //}
                return vis.xcoord;

            } else {
                return vis.path.centroid(d)[0];
            }
        })
        .attr("y", function (d) {
            if (vis.inacluster(vis.stateXY[d.id])) {
                vis.statefontsize += 20;
                //if (vis.stateXY[d.id] == "DC") {
                vis.dcline.push({
                    s: vis.stateXY[d.id] + "y",
                    y1: vis.ycoord + vis.statefontsize,
                    y2: vis.path.centroid(d)[1]
                });
                //}
                return vis.ycoord + vis.statefontsize;

            } else {
                return vis.path.centroid(d)[1];
            }
        })
        .on("mouseover", function (d) {
            vis.mouseincolor(d);
            if (vis.inacluster(vis.stateXY[d.id])) {
                vis.tip.show(d);
                stateHover(d.id);
            }
        })
        .on("mouseout", function (d) {
            vis.mouseoutcolor(d);
            if (vis.inacluster(vis.stateXY[d.id])) vis.tip.hide(d);
        })
        .attr("text-anchor", "middle")
        .attr('fill', function (d) {
            if (vis.inacluster(vis.stateXY[d.id])) {
                return "#FFFFFF";

            } else {
                return "#ff9e00";
            }
        });


    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
};



/*
 * Data wrangling if necessary
 */

EvMap.prototype.wrangleData = function () {
    var vis = this;

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

EvMap.prototype.updateVis = function () {
    var vis = this;

    vis.svg.selectAll("path")
        .attr("class", function (d) {
            return vis.mapquantize(d);
        });


    vis.tip.html(function (d) {
        return vis.getInfo(d.id);
    });
    vis.svg.call(vis.tip);


    if (vis.selected == "POP") {
        vis.dmin = d3.min(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.dmax = d3.max(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.item = "2";
    } else if (vis.selected == "PCT") {
        vis.dmin = d3.min(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.dmax = d3.max(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.item = "1";
    } else if (vis.selected == "CO2") {
        vis.dmin = d3.min(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.dmax = d3.max(vis.data, function (d) {
            return d.evdata[vis.selected]
        });
        vis.item = "0";
    }

    vis.quantize = d3.scale.quantize()
        .domain([vis.dmin, vis.dmax])
        .range(d3.range(9).map(function (i) {
            return "q" + vis.item + (i + 1) + "-9";
        }));

    vis.svg.append("g")
        .attr("class", "legendq")
        .attr("data-legend-color", "white")
        .attr("transform", "translate(5,20)");

    vis.dformat = d3.format(".2f");
    vis.co2format = d3.format(".0f");
    vis.legend = d3.legend.color()
        .labelFormat(function (d) {
            if (vis.selected == "POP") {
                return vis.dformat(d / vis.populationdiv) + " M";
            } else if (vis.selected == "PCT") {
                return vis.dformat(d) + "%";
            } else {
                return vis.co2format(d);
            }
        })
        .useClass(true)
        .scale(vis.quantize);

    vis.svg.select(".legendq")
        .call(vis.legend);

};

EvMap.prototype.mouseincolor = function(d) {
    var vis = this;

    var stateAbbr = "#stateid" + d.id;
    $(stateAbbr).css('fill', '#cb240f');

    if (vis.inacluster(vis.stateXY[d.id])) {
        var sstring = vis.stateXY[d.id];
        var line = vis.svg.append("line")
            .attr("class", "dcline")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("x1", vis.getxycoord(sstring + "x", "x1"))
            .attr("y1", vis.getxycoord(sstring + "y", "y1"))
            .attr("x2", vis.getxycoord(sstring + "x", "x2"))
            .attr("y2", vis.getxycoord(sstring + "y", "y2"));
    }

    vis.svg.selectAll("path")
        .attr("class", function (p) {
            if (d.id == p.id) {
                return "q31-9";
            } else {
                return vis.mapquantize(p);
            }
        });
}

EvMap.prototype.getxycoord = function (sxyinfo, pos) {
    var rvalue = 0;
    $.each(vis.dcline, function (i) {
        if (vis.dcline[i].s == sxyinfo) {
            if (pos == "x1")
                rvalue = vis.dcline[i].x1;
            else if (pos == "x2")
                rvalue = vis.dcline[i].x2;
            else if (pos == "y1")
                rvalue = vis.dcline[i].y1;
            else
                rvalue = vis.dcline[i].y2;
        }
    });
    return rvalue;
}

EvMap.prototype.mouseoutcolor = function (d) {
    vis = this;

    vis.svg.selectAll("path")
        .attr("class", function (p) {
            return vis.mapquantize(p);
        });
    var stateAbbr = "#stateid" + d.id;
    $(stateAbbr).css('fill', 'blue');

    if (vis.inacluster(vis.stateXY[d.id])) {
        $(stateAbbr).css('fill', '#FFFFFF');
    } else {
        $(stateAbbr).css('fill', '#F2BB66');
    }
    if (vis.inacluster(vis.stateXY[d.id])) {
        vis.svg.selectAll("line").remove();
    }


}

EvMap.prototype.inacluster = function (d) {
    switch (d) {
        case 'VT':
            return true;
        case 'NH':
            return true;
        case 'MA':
            return true;
        case 'RI':
            return true;
        case 'CT':
            return true;
        case 'NJ':
            return true;
        case 'DE':
            return true;
        case 'MD':
            return true;
            //case 'ME': return true;
        case 'DC':
            return true;
    }
    return false;
}

EvMap.prototype.getInfo = function (id) {
    vis = this;
    var returnData = "<span style='color:black'><strong>No data</strong></span>";
    vis.data.forEach(function (j) {
        if (j.stateid == id) {
            returnData = "<span style='color:white'>" + j.state + "<br>" + j.evdata[vis.selected] + "</span>";
        }
    });
    return returnData;
}

EvMap.prototype.mapquantize = function (d) {
    var vis = this;

    var scalenumber = 0;
    var otherdata = "";
    var divnum = 1;
    var maxscale = 5;
    var minscale = 1;
    var itemnum = "0";
    var found = false;
    var calculated = false;
    var state = "";

    vis.data.forEach(function (j) {
        if (vis.selected == "CO2" && (!calculated)) {
            itemnum = "0";
            maxscale = 9;
            divnum = Math.floor((j.evdata.co2max - j.evdata.co2min) / maxscale);
            calculated = true;
        } else if (vis.selected == "PCT" && (!calculated)) {
            itemnum = "1";
            maxscale = 9;
            divnum = Math.floor(325 / maxscale);
            calculated = true;
        } else if (vis.selected == "POP" && (!calculated)) {
            itemnum = "2";
            maxscale = 9;
            divnum = Math.floor((j.evdata.popmax - j.evdata.popmin) / maxscale);
            divnum = vis.populationdiv;
            calculated = true;
        }
        if (j.stateid == d.id) {
            state = j.state;
            found = true;
            var datavalue;
            if (vis.selected == "CO2") {
                datavalue = j.evdata[vis.selected];
            } else if (vis.selected == "PCT") {
                datavalue = j.evdata[vis.selected] * 100;
            } else if (vis.selected == "POP") {
                datavalue = j.evdata[vis.selected];
            }
            scalenumber = Math.ceil(datavalue / divnum);
        }
    });


    if (scalenumber > maxscale) {
        scalenumber = maxscale;
    }
    if (scalenumber < minscale) {
        scalenumber = minscale;
    }
    if (found) {
        var rtnclass = "q" + itemnum + scalenumber + "-9";
        return (rtnclass);
    } else {
        return "#FFFFFF";

    }

}
