// Will be used to the save the loaded JSON, CSV data
var allData = [];
var filteredData = [];
var mapData = [];
var evDataByStateId = [];
var stateXY = {};
var stateID = {};
var selected = "CO2";
var currentState = 0;


// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var evmap, pichart, barchart;


// Start application by loading the data
// Note: queue can only handle 3 files max
queue()
    .defer(d3.json, "data/us-10m.json")
    .defer(d3.csv, "data/finalprojedata.csv")
    .defer(d3.csv, "data/states-10m.csv")
    .await(function(error, topojsondata, csvdata, statesdata) {

        allData = csvdata;
        mapData = topojsondata;

        statesdata.forEach(function (d) {
            stateXY[d.State] = d.Abbreviation;
            stateID[d.State] = +d.USMapID;
        });
        
        // Convert Pence Sterling (GBX) to USD and years to date objects
        allData.forEach(function(d){
            d.Electric_Vehicle_Registrations = +d.Electric_Vehicle_Registrations;
            d.Population = +d.Population;
            d.Percentage = +d.Percentage;
            d.CO2 = +d.CO2;
        });

        filteredData = allData.filter(function(d) {
           return d.State != "All";
        });
        var popmax = d3.max(filteredData, function(d) { return d.Population; });
        var popmin = d3.min(filteredData, function(d) { return d.Population; });
        var pctmax = 100; //d3.max(filteredData, function(d) { return d.Percentage; });
        var pctmin = 0;   //d3.min(filteredData, function(d) { return d.Percentage; });
        var co2max = d3.max(filteredData, function(d) { return d.CO2; });
        var co2min = d3.min(filteredData, function(d) { return d.CO2; });

        //NaturalGas,Nuclear,Coal,Other,Hydro,Biomass,Geothermal,Solar,
        //Wind,Oil,AllElectric,PlugInHybrid,Hybrid,Gasoline
        filteredData.forEach(function(d){
            evDataByStateId.push({
                state: d.State,
                stateid: stateID[d.State],
                evdata: {
                    POP: d.Population,
                    PCT: d.Percentage,
                    CO2: d.CO2,
                    popmax: popmax,
                    popmin: popmin,
                    pctmax: pctmax,
                    pctmin: pctmin,
                    co2max: co2max,
                    co2min: co2min,
                    registratons: d.Electric_Vehicle_Registrations,
                    stateXY: stateXY[d.State]
                },
                pdata: {
                    Coal: +d.Coal,
                    Oil: +d.Oil,
                    NaturalGas: +d.NaturalGas,
                    Other: +d.Other,
                    Nuclear: +d.Nuclear,
                    Hydro: +d.Hydro,
                    Biomass: +d.Biomass,
                    Geothermal: +d.Geothermal,
                    Solar: +d.Solar,
                    Wind: +d.Wind
/*
                    NoCO2: +d.co2_free,
                    CO2: +d.co2_producing
                    */
                },
                bdata: {
                    AllElectric: +d.CO2,
                    PlugInHybrid: +d.PlugInHybrid,
                    Hybrid: +d.Hybrid,
                    Gasoline: +d.Gasoline
                }
            });
        });

        createVis();
});

function createVis() {

    // TO-DO: Instantiate visualization objects here
    // areachart = new ...
    evmap = new EvMap("evmap", evDataByStateId, mapData, selected);
    //Default state for bar and pie charts
    currentState = stateID["Alaska"];
    pichart = new PiChart("pichart", evDataByStateId, currentState);
    barchart = new BarChart("barchart", evDataByStateId, currentState);
}

function updateUSVisualization() {
    evmap.selected = d3.select("#selected-variable").property("value");
    evmap.wrangleData();
}


function stateHover(stateid) {
    pichart.stateid = stateid;
    pichart.wrangleData();
    barchart.stateid = stateid;
    barchart.wrangleData();
}