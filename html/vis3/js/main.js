//http://bl.ocks.org/davetaz/9954190
//http://bl.ocks.org/d3noob/8375092
//http://bl.ocks.org/d3noob/8329404
//http://bl.ocks.org/mbostock/4339083


var treeDiagram;
var salesNumbers;
var alldata ;
var allSales;

var ModelData = {};

queue()
    .defer(d3.csv, "data/Electric_Vehicles_by_model.csv")
    .defer(d3.csv, "data/sales07-15.csv")
    .await(function(error, data,sales){
        //DataWrangling for Model Tree
        alldata = data;
        var nested_data = d3.nest()
            .key(function(d) { return d.Fuel; }).sortKeys(d3.ascending)
            .key(function(d) { return d.Manufacturer;}).sortKeys(d3.ascending)
            //.key(function(d) { return d.Model; }).sortKeys(d3.ascending)
            .entries(alldata);
        nested_data.forEach(function(fuel){
            fuel['parent'] = ModelData;
            fuel['_children']= fuel.values;
            fuel.values.forEach(function(manufact){
                manufact['parent'] = fuel;
                manufact['_children']= manufact.values;
                manufact.values.forEach(function(model){
                    model['parent'] = manufact;
                })
            })

        });
        ModelData['parent'] = null;
        ModelData['key'] = "EV's";
        ModelData['children'] = null;
        ModelData['_children'] = nested_data;
        //ModelData['manufact'] = [];
        //ModelData.children.forEach(function(d){
        //    d['manufact']=[];
        //    d.children.forEach(function(e){
        //            console.log(e.key);
        //            d['manufact'].push(e.key);
        //            ModelData['manufact'].push(e.key)
        //    })
        //});
        //
        //// Data wrangling for Sales data
        //var nested_salesdata = d3.nest()
        //    .key(function(d) { return d.Manufacturer;}).sortKeys(d3.ascending)
        //    .key(function(d) { return d.Model; }).sortKeys(d3.ascending)
        //    //.key(function(d) { return d.Model; }).sortKeys(d3.ascending)
        //    .entries(sales);
        //
        //nested_salesdata.forEach(function (d) {
        //    d.values.forEach(function(e){
        //        e.values.forEach(function(f){
        //            delete f.Manufacturer;
        //            delete f.Model
        //        })
        //    })
        //});
        //
        //
        //
        //salesNumbers = new SalesNumbers(nested_salesdata);
        //console.log(ModelData);
        //console.log(salesNumbers.byManufacturer("Toyota"));
        //console.log(salesNumbers.byList(["Toyota","BMW","Tesla"]));


        createVis();
    });

function createVis() {
    treeDiagram = new TreeDiagram('#treediagram',ModelData,salesNumbers);
};

