// Global variables
var alldata,
    nested_data,
    treemap,
    chart,
    group,
    root,
    data_filtered;

// Size variables
var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    width = 1100 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


//Define default colorbrewer scheme
var quantiles = 9
var colorScheme = colorbrewer["Blues"];
var color = d3.scale.quantile()
    .range(colorScheme[quantiles]);

// Path
treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(false)
    .sort(function (a, b) {
        return a.fuel_economy_city - b.fuel_economy_city;
    })
    .round(true)
    .value(function (d) {
        return d.fuel_economy_city;
    });

// Select DIV
chart = d3.select("#treemap").append("rect")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

queue()
    .defer(d3.csv, "data/electric_vehicles_by_model2.csv")
    .await(function (error, data) {

        //DataWrangling
        alldata = data;

        // Convert numeric values to 'numbers'
        alldata.forEach(function (d) {
            d.engine_size = +d.engine_size;
            d.fuel_economy_city = +d.fuel_economy_city;
            d.fuel_economy_highway = +d.fuel_economy_highway;
            d.gas_fuel_economy_city = +d.gas_fuel_economy_city;
            d.model_year = +d.model_year;
            d.price = +d.price;
        });

        nested_data = d3.nest()
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
                    'engine_type': v[0].engine_type,
                    'engine_size': v[0].engine_size
                };
            })
            .entries(alldata)
            .map(function (d) {
                d.values['name'] = d.key;
                return d.values;
            });

        createVis(nested_data);
    });

function createVis(data) {
    nested_data = data

    // Get selected variable
    group = d3.select("#selected-variable")
        .property("value");

    // Filter
    data_filtered = nested_data.filter(function (d) {
        return d.engine_type === group;
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
    color.domain([min_var, max_var])


    // Treemap implementation
    // SELECT
    var node = chart.datum(root).selectAll("rect")
        .data(treemap.nodes);

    // ENTER
    node.enter()
        .append("rect");

    // UPDATE
    node.on("mouseover", function (d) {
            if (d.engine_size > 0) {
                d3.select(this)
                    //.style("opacity", 0.5)
                    .transition()
                    .duration(50)
                    .style("background-color", "rgb(250, 255, 106)")
                    .style("color", "white");
            }
        })
        .on("mouseout", function (d) {
            if (d.engine_size > 0) {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("background-color", color(d.engine_size))
                    .style("color", "black");
            }
        })
        .call(position)
        .transition()
        .duration(400)
        .ease("linear")
        .style("background-color", function (d) {
            return color(d.engine_size);
        })
        .text(function (d) {
            return d.children ? null : d.manufacturer + ": " + d.model + " (" + d.engine_size + ")";
        })
        .attr("class", "node");

    // EXIT
    node.exit().remove();
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