// --> CREATE SVG DRAWING AREA
var width = 500,
    height = 500,
    legendWidth = 100;


var svg = d3.select("#vis1").append("svg")
    .attr("width", width + legendWidth)
    .attr("height", height);

var projection = d3.geo.mercator()
    .translate([width / 2, height / 2])
    .scale(350);

var path = d3.geo.path()
    .projection(projection);


var geo;
var malariaData;
var data = [];
var selected;
var dropdown = $("#vis1val");
var options;
var regionScale;
var legend;

// read files
queue()
    .defer(d3.json, "data/africa.topo.json")
    .defer(d3.csv, "data/global-malaria-2015.csv")
    .await(function (error, mapTopJson, malariaDataCsv) {

        malariaData = malariaDataCsv;


        // parse topojson
        geo = topojson.feature(mapTopJson, mapTopJson.objects.collection);

        // filter countries
        malariaData = malariaData.filter(function (d) {
            if (d.WHO_region == "African" || d.WHO_region == "Eastern Mediterranean")
                return true;
            else
                return false;

        });

        // parse data
        malariaData.forEach(function (d) {

            d.UN_population = +d.UN_population;
            d.At_risk = +d.At_risk;
            d.At_high_risk = +d.At_high_risk;
            d.Suspected_malaria_cases = +d.Suspected_malaria_cases;
            d.Malaria_cases = +d.Malaria_cases;

            // save with code as key for easy lookup
            data[d.Code] = {
                "Country": d.Country,
                "WHO_region": d.WHO_region,
                "UN_population": d.UN_population,
                "At_risk": d.At_risk,
                "At_high_risk": d.At_high_risk,
                "Suspected_malaria_cases": d.Suspected_malaria_cases,
                "Malaria_cases": d.Malaria_cases
            };
        });

        // all dropdown options
        options = [
            {
                name: "Suspected cases",
                value: "Suspected_malaria_cases",
                suffix: "",
                scale: getScale("Suspected_malaria_cases")
            },
            {
                name: "Diagnosed cases",
                value: "Malaria_cases",
                suffix: "",
                scale: getScale("Malaria_cases")
            },
            {
                name: "Population",
                value: "UN_population",
                suffix: "",
                scale: getScale("UN_population")
            },
            {
                name: "Population at risk",
                value: "At_risk",
                suffix: "%",
                scale: getScale("At_risk")
            },
            {
                name: "Population at high risk",
                value: "At_high_risk",
                suffix: "%",
                scale: getScale("At_high_risk")
            }


        ];
        // set options
        $.each(options, function () {
            dropdown.append($("<option />").val(this.value).text(this.name));
        });

        // set selected option
        dropdown.val("Suspected_malaria_cases");

        // show data on draw
        var off = $("#vis1").offset().top;
        var top = $(window).scrollTop() + $(window).height();
        if (off <= top) {
            updateChoropleth();
        }
        else {
            initialdraw();
        }

        $(window).scroll(function () {
            // get the element that you want check scrolling on it
            var off = $("#vis1").offset().top;
            var top = $(window).scrollTop() + $(window).height();
            if (off <= top) {
                updateChoropleth();
            }
        });

        dropdown.change(function () {
            updateChoropleth();
        });

    });
function updateChoropleth() {

    // get selected value
    var selection = dropdown.val();

    // get all dropdown info
    $.each(options, function () {
        if (this.value == selection) {
            selected = this;
        }
    });


    // initial draw
    initialdraw();


    // update
    svg.selectAll("path")
        .data(geo.features)
        .transition()
        .duration(500)
        .attr("fill", function (d) {
            if (data[d.properties.adm0_a3_is] == null)
                return "black";
            if (isNaN(data[d.properties.adm0_a3_is][selected.value]))
                return "black";
            return selected.scale(data[d.properties.adm0_a3_is][selected.value]);

        })
        .select("title")
        .text(function (d) {
            if (data[d.properties.adm0_a3_is] == null)
                return "No Data Available";
            else if (isNaN(data[d.properties.adm0_a3_is][selected.value]))
                return "No " + selected.name.toLowerCase() + " data available for " + data[d.properties.adm0_a3_is].Country;
            return data[d.properties.adm0_a3_is].Country + " " + selected.name.toLowerCase() + ": " + d3.format(",.0f%")(data[d.properties.adm0_a3_is][selected.value]) + selected.suffix;
        });

    // make legend
    if (legend == null) {
        legend = svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,295)");
    }

    // update legend
    var legendLinear = d3.legend.color()
        .shapeWidth(40)
        .cells(10)
        .orient('vertical')
        .scale(selected.scale)
        .title(selected.name)
        .labelFormat(function (d) {
            return d3.format(",.0f%")(d) + selected.suffix
        });

    svg.select(".legendLinear")
        .call(legendLinear);


}

// the different domains and ranges
function getScale(selected) {


    var domain = malariaData.map(function (d) {
        return +d[selected];
    }).sort(function (a, b) {
        return a - b;
    });
    var regionScale = d3.scale.quantile();

    // set domain/range
    switch (selected) {
        case "Malaria_cases":
            regionScale
                .range(colorbrewer["PuRd"][9])
                .domain(domain);
            return regionScale;
        case "UN_population":
            regionScale
                .range(colorbrewer["YlGnBu"][9])
                .domain(domain);
            return regionScale;
        case "At_risk":
            regionScale
                .range(colorbrewer["OrRd"][9])
                .domain([0, 100]);
            return regionScale;
        case "At_high_risk":
            regionScale
                .range(colorbrewer["OrRd"][9])
                .domain([0, 100]);
            return regionScale;
        case "Suspected_malaria_cases":
            regionScale
                .range(colorbrewer["YlOrRd"][9])
                .domain(domain);
            return regionScale;

    }

}
function initialdraw() {
    svg.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "world")
        .attr("fill", "white")
        .append("title")
        .text("Not Loaded yet.");
}
