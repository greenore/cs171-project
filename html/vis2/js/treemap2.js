// Global variables
var all_data;

queue()
    .defer(d3.csv, "data/electric_vehicles_by_model.csv")
    .await(function (error, data) {

        //DataWrangling
        all_data = data;

        // Convert numeric values to 'numbers'
        all_data.forEach(function (d) {
            d.engine_size = +d.engine_size;
            d.fuel_economy_city = +d.fuel_economy_city;
            d.fuel_economy_highway = +d.fuel_economy_highway;
            d.gas_fuel_economy_city = +d.gas_fuel_economy_city;
            d.model_year = +d.model_year;
            d.price = +d.price;
        });

        nested_data_tree = d3.nest()
            .key(function (d) {
                return d.id;
            })
            .rollup(function (v) {
                // leaf
                if (v.length === 1 && v[0].id.indexOf('/') === -1) {
                    return {
                        'size': parseInt(v[0].engine_size)
                    };
                }
                // node
                v.map(function (d) {
                    d.id = d.id.substring(d.id.indexOf('/') + 1);
                    return d;
                });
                return {
                    'children': level(v)
                };
            })
            .rollup(function (v) {
                return {
                    'manufacturer': v[0].manufacturer,
                    'model': v[0].model,
                    'model_year': v[0].model_year,
                    'price': v[0].price,
                    'category': v[0].category,
                    'fuel_economy_city': v[0].fuel_economy_city,
                    'fuel_economy_city_units': v[0].fuel_economy_city_units,
                    'fuel_economy_highway': v[0].fuel_economy_highway,
                    'fuel_economy_highway_units': v[0].fuel_economy_highway_units,
                    'gas_fuel_economy_city': v[0].gas_fuel_economy_city,
                    'gas_fuel_economy_highway': v[0].gas_fuel_economy_highway,
                    'fuel': v[0].fuel,
                    'engine_type': v[0].engine_type,
                    'engine_size': v[0].engine_size,
                    'units': v[0].units
                };
            })
            .entries(all_data)
            .map(function (d) {
                d.values['name'] = d.key;
                return d.values;
            });

        createTree(nested_data_tree);
    });

function createTree() {
    function wait(ms) {
        var start = new Date().getTime();
        var end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
    }
    treeDiagram = new TreeDiagram('#treediagram', ModelData, salesNumbers);
};



/*
 *  TreeGraph - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            
 */

TreeGraph = function (_parentElement, _data) {
    this.duration = 750;
    this.parentElement = d3.select(_parentElement);
    this.data = _data;
    this.initVis(this.data);
    this.i = 0;
};

TreeGraph.prototype.initVis = function () {

    // Size variables
    var margin_tree = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        width_tree = 1100 - margin_tree.left - margin_tree.right,
        height_tree = 600 - margin_tree.top - margin_tree.bottom;

    var vis = this;

    //Define default colorbrewer scheme
    vis.quantiles = 9
    vis.colorScheme = colorbrewer["Blues"];
    vis.color_tree = d3.scale.quantile()
        .range(colorScheme[quantiles]);

    // Path
    vis.treemap = d3.layout.treemap()
        .size([width_tree, height_tree])
        .sticky(false)
        .sort(function (a, b) {
            return a.fuel_economy_city - b.fuel_economy_city;
        })
        .round(true)
        .value(function (d) {
            return d.fuel_economy_city;
        });

    // Select SVG
    vis.chart = d3.select("#treemap").append("rect")
        .style("position", "relative")
        .style("width", (width_tree + margin_tree.left + margin_tree.right) + "px")
        .style("height", (height_tree + margin_tree.top + margin_tree.bottom) + "px")
        .style("left", margin_tree.left + "px")
        .style("top", margin_tree.top + "px");

    vis.div_tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}





function createVis(data) {
    nested_data = data

    // Get selected variable
    group = d3.select("#selected-variable")
        .property("value");

    // Filter
    data_filtered = nested_data.filter(function (d) {
        return d.fuel === group;
    });

    root = {
        'name': 'electric_cars',
        'children': data_filtered
    };

    // Color domain
    var min_var = d3.min(root.children, function (d) {
        return d.engine_size;
    });
    var max_var = d3.max(root.children, function (d) {
        return d.engine_size;
    });
    color_tree.domain([0, max_var])

    // Treemap implementation
    // SELECT
    var node_tree = chart.datum(root).selectAll("rect")
        .data(treemap.nodes);

    // ENTER
    node_tree.enter()
        .append("rect");

    // UPDATE
    node_tree.on("mouseover", function (d) {
            if (d.engine_size > 0) {
                d3.select(this)
                    //.style("opacity", 0.5)
                    .transition()
                    .duration(50)
                    .style("background-color", "rgb(250, 255, 106)")
                    .style("color", "white");

                div_tooltip.transition().duration(100)
                    .style("opacity", 0.8)
                div_tooltip.html(function () {
                        return "<strong>" + d.manufacturer + "</strong>" + "</br>" +
                            "Model: " + d.model + " - " + d.model_year + "</br>" +
                            "Category: " + d.category + "</br>" +
                            "Engine Size: " + d.engine_size + " " + d.units + "</br>" +
                            "Fuel Economy City: " + d.fuel_economy_city + " " + d.fuel_economy_city_units + "</br>" +
                            "Fuel Economy Highway: " + d.fuel_economy_highway + " " + d.fuel_economy_highway_units + "</br>" +
                            "Price: " + d.price
                    })
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            }
        })
        .on("mouseout", function (d) {
            if (d.engine_size > 0) {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("background-color", color_tree(d.engine_size))
                    .style("color", "black");

                div_tooltip.transition().duration(300)
                    .style("opacity", 0);

            }
        })
        .call(position)
        .transition()
        .duration(400)
        .ease("linear")
        .style("background-color", function (d) {
            return color_tree(d.engine_size);
        })
        .text(function (d) {
            return d.children ? null : d.manufacturer + ": " + d.model + " (" + d.engine_size + ")";
        })
        .attr("class", "node_tree");

    // EXIT
    node_tree.exit().remove();
};


// Position function
function position() {
    this.style("left", function (d) {
            return d.x + "px";
        })
        .style("top", function (d) {
            return d.y + "px";
        })
        .style("width", function (d) {
            return Math.max(0, d.dx - 1) + "px";
        })
        .style("height", function (d) {
            return Math.max(0, d.dy - 1) + "px";
        });
}
