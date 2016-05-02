
var allData = [];
var centerUS = [39.8333333,-98.585522];
// Variable for the visualization instance
var chargerMap,chargerDistr;
var chargerColors, chargerColorScale;

var chargerTypes = {

    NEMA515 : "NEMA 5-15",
    NEMA520 : "NEMA 5-20",
    NEMA1450 : "NEMA 14-50",
    J1772 :  "J1772",
    CHADEMO : "CHAdeMO",
    J1772COMBO : "SAE J1772 Combo",
    TESLA : "Tesla"
};

chargerColors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];
//['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f','#bf5b17'];
chargerColorScale =d3.scale.ordinal()
    .range(chargerColors)
    .domain(Object.keys(chargerTypes));

var rangeCheckbox =$("[name='range-checkbox']").bootstrapSwitch('state',false);
var rangeSlider = $("#rangeSlider").slider();


rangeCheckbox.on('switchChange.bootstrapSwitch',function(){
    var x = rangeSlider.slider('getValue');
    if (x > 0) {
        if(rangeCheckbox.bootstrapSwitch('state'))
        {
            allFilterButton.classed('active',true);
            filterButtons.classed('active',false);
            chargerMap.drawRangeCircle(x * 1000);
        }
        else {
            allFilterButton.classed('active',true);
            filterButtons.classed('active',false);
            chargerMap.removeRangeCircle();
        }
        chargerDistr.updateData(chargerMap.returnChargerDistr());
    }
});


var filterButtons = d3.select('#filterButtons').selectAll('button')
    .data(Object.keys(chargerTypes))
    .enter()
    .append('button')
    .attr('class','btn btn-default customBtn')
    .attr('id',function(d){
        return 'filter-'+ d
    })
    .attr('type','button')
    .text(function(d){
        return chargerTypes[d]})
    .on('click',function(d){
        d3.select(this).classed("active", !d3.select(this).classed("active"));
        d3.select('#selectAllChargers').classed("active" , false);
        if (d3.select(this).classed("active"))
            {filterMap(d,'add')}
        else {filterMap(d,'remove')}
    });

d3.select('#filterButtons').append('button')
    .attr('class' , 'btn btn-default active customBtn')
    .attr('id' , 'selectAllChargers')
    .text("All");


var allFilterButton = d3.select('#selectAllChargers').on('click',function(){
    //d3.select(this).classed("active", !d3.select(this).classed("active"));
    if (!d3.select(this).classed("active")){
        d3.select(this).classed("active",true);
        chargerMap.removeAllMarkers();
        chargerMap.updateVis();
        chargerMap.addAllMarkers();
        filterButtons.classed('active',false)

    }
    else {
        d3.select(this).classed("active",false);
        chargerMap.removeAllMarkers();
    }
    chargerMap.updateVis();
    chargerDistr.updateData(chargerMap.returnChargerDistr());

});





function filterMap(filter,action){
    if (action == 'add') {
        if (chargerMap.isInitial()) {
            chargerMap.removeAllMarkers();
        }
        chargerMap.addMarkers([filter]);
    }
    else if (action == 'remove'){

        chargerMap.removeMarkers([filter]);
    }
    chargerMap.updateVis();
    chargerDistr.updateData(chargerMap.returnChargerDistr());}

// Start application by loading the data
loadData();


function loadData() {


    $.getJSON('data/APIanswer-elec.json', function(data) {
        allData = data;
        $('#charger-count').text(allData.fuel_stations.length);
        createVis();
    });


}


function createVis() {
    chargerMap = new ChargerMap('charger-map',allData.fuel_stations,centerUS,chargerTypes,chargerColorScale);
    chargerDistr = new ChargerDistr('#chargerDist',chargerMap.returnChargerDistr(),chargerColorScale);
}