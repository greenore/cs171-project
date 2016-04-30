/**
 * Created by mund on 12/04/2016.
 */
$('#locationSearch').click(function (){locationSearch($('#locationSearchTerm').val())} );

var rangeCheckbox =$("[name='range-checkbox']").bootstrapSwitch('state',false);
var rangeSlider = $("#rangeSlider").slider();


rangeCheckbox.on('switchChange.bootstrapSwitch',function(){
    var x = rangeSlider.slider('getValue');
    if (x > 0) {
        if(rangeCheckbox.bootstrapSwitch('state'))
        {
            chargerMap.drawRangeCircle(x * 1000);
        }
        else {
            chargerMap.removeRangeCircle();
        }
        console.log(chargerMap.returnChargerDistr());
        chargerDistr.updateData(chargerMap.returnChargerDistr());
    }
});


function locationSearch(locationSeachTerm){
    var url ='https://maps.googleapis.com/maps/api/geocode/json?address=' +locationSeachTerm;
    //  '&key=AIzaSyD9_QfXFTq39wgDJNGnjjq8eTvqNDtesj0;';
    //console.log(url);

    $.getJSON(url,function(data){
        console.log(data);
        chargerMap.goTo([data.results[0].geometry.location.lat,data.results[0].geometry.location.lng],
            [[data.results[0].geometry.bounds.northeast.lat,data.results[0].geometry.bounds.northeast.lng],
                [data.results[0].geometry.bounds.southwest.lat,data.results[0].geometry.bounds.southwest.lng]]);
        //console.log([data.results[0].geometry.location.lat,data.results[0].geometry.location.lat]);
    })
}

