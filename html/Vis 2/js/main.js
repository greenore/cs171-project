//http://bl.ocks.org/davetaz/9954190
//http://bl.ocks.org/d3noob/8375092
//http://bl.ocks.org/d3noob/8329404
//http://bl.ocks.org/mbostock/4339083


var treeDiagram;
var alldata ;
var dataObj = {};
var margin = {top: 40, right: 60, bottom: 60, left: 200};

var i = 0,
    duration = 750;

var width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var ModelData = {};

queue()
    .defer(d3.csv, "data/Electric_Vehicles_by_model.csv")
    .await(function(error, data){
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }
        //DataWrangling
        alldata = data;
        console.log(alldata);
        var nested_data = d3.nest()
            .key(function(d) { return d.Fuel; }).sortKeys(d3.ascending)
            .key(function(d) { return d.Manufacturer;}).sortKeys(d3.ascending)
            //.key(function(d) { return d.Model; }).sortKeys(d3.ascending)
            .entries(alldata);
        console.log(nested_data);
        //ModelData.x0 = height / 2;
        //ModelData.y0 = 0;
        ModelData.children.forEach(collapse);


        console.log(alldata);
        console.log(dataObj);

        //createVis();
    });

function createVis() {
    //treeDiagram = new TreeDiagram(alldata);
};