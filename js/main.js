//http://bl.ocks.org/davetaz/9954190
//http://bl.ocks.org/d3noob/8375092
//http://bl.ocks.org/d3noob/8329404
//http://bl.ocks.org/mbostock/4339083


var treeDiagram;
var salesNumbers;
var allData ;

var ModelData = {};

queue()
    .defer(d3.csv, "data/electric_vehicles_by_model.csv")
    .await(function(error, data){
        //DataWrangling for Model Tree
        allData = data;

        var minRadius = 5;
        var maxRadius = 15;

        var radiusScale = d3.scale.linear()
            .range([minRadius,maxRadius]);

        var nested_data = d3.nest()
            .key(function(d) { return d.fuel; }).sortKeys(d3.ascending)
            .key(function(d) { return d.manufacturer;}).sortKeys(d3.ascending)
            //.key(function(d) { return d.Model; }).sortKeys(d3.ascending)
            .entries(allData);
        nested_data.forEach(function(fuel){
                fuel['parent'] = ModelData;
                fuel['_children']= fuel.values;
                fuel.values.forEach(function(manufact) {
                    manufact['parent'] = fuel;
                    manufact['_children'] = manufact.values;
                    manufact['tot_sales'] = d3.sum(manufact.values, function (d) {
                        return d.tot_sales
                    });
                    manufact['extent'] = d3.extent(manufact.values, function (d) {
                        return +d.tot_sales
                    });

                    manufact.values.forEach(function (model) {
                        model['parent'] = manufact;
                    });
                });

                fuel['tot_sales'] = d3.sum(fuel.values,function(d){return d.tot_sales});
                fuel['extent'] = d3.extent(fuel.values, function (d){return d.tot_sales}
                );

                fuel.values.forEach(function(manufact) {
                    radiusScale.domain(manufact['extent']);
                    manufact._children.forEach(function(model){
                        model['radius']=radiusScale(model.tot_sales);
                    });
                    radiusScale.domain(fuel.extent);
                    manufact['radius'] = radiusScale(manufact.tot_sales);
                });
            }
        );
        ModelData['radius'] = 5;
        ModelData['parent'] = null;
        ModelData['key'] = "EV's";
        ModelData['children'] = null;
        ModelData['_children'] = nested_data;
        ModelData['tot_sales'] = d3.sum(nested_data,function(d){return d.tot_sales});
        ModelData['extent'] = d3.extent(nested_data,function(d){return d.tot_sales});
        ModelData._children.forEach(function(d) {
            radiusScale.domain(ModelData['extent']);
            d.radius = radiusScale(d.tot_sales);
        });
        console.log(ModelData);

        createVis();
    });

function createVis() {
    treeDiagram = new TreeDiagram('#treediagram',ModelData,salesNumbers);
};

