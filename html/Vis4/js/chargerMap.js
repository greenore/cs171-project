
/*
 *  chargerMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */
var map;

ChargerMap = function(_parentElement, _data , _mapPosition, _lines) {
    this.parentElement = _parentElement;
    this.lines = _lines;
    this.data = _data;
    this.mapPosition = _mapPosition;
    L.Icon.Default.imagePath = 'img';
    this.initVis();
}


/*
 *  Initialize station map
 */

ChargerMap.prototype.initVis = function() {

    var vis = this;

    map = L.map(vis.parentElement).setView(vis.mapPosition, 5);


    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log("adding charger stations");
    start = new Date().getTime();

    vis.allChargers = new L.MarkerClusterGroup({ chunkedLoading: true});
    //chargers = L.layerGroup();
    //add station markers to  layer
    vis.chargerTypesList = Object.keys(chargerTypes);
    var markerList = {};
    vis.chargerTypesList.map(function (d) {
        markerList[d] = [];
        });


    console.log(markerList);
    var tmpMarker;
    vis.data.map(function(d,index){
        if ( index % 1 == 0) {
            //console.log(d.ev_connector_types);
            tmpMarker = L.marker([+d.latitude, +d.longitude]);
            x = d.ev_connector_types;
            if (x) {
                x.forEach(function (el) {
                    markerList[el].push(tmpMarker);
                });
            }
            //chargers.addLayer(d.marker);
        }
    });
    console.log("Done adding chargers in: " + (new Date().getTime()-start)/1000 + 's');
    start = new Date().getTime();

    vis.mySubGroup = {};
    vis.chargerTypesList.map(function (d,i) {
        vis.mySubGroup[d] = L.featureGroup.subGroup(vis.allChargers,  markerList[d]);
        vis.mySubGroup[d].addTo(map);
    });
    vis.allChargers.addTo(map);


    //mySubGroup.forEach(function(d){
    //    d.addTo(map);
    //});
    console.log("Adding chargers to map took: " + (new Date().getTime()-start)/1000 + 's');
};


/*
 *  Data wrangling
 */

ChargerMap.prototype.wrangleData = function(filter) {
    var vis = this;

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;
    // Update the visualization
    console.log("Filtering for: " + filter);
    //console.log( vis.allChargers);
    vis.chargerTypesList.map(function (d,i) {
        if(d!= filter){
            //vis.mySubGroup[d].removeLayer(map);
            map.removeLayer(vis.mySubGroup[d]);
            console.log("Filtering: " + d);
        }
    });
    vis.allChargers.refreshClusters();
   // console.log(vis.allChargers);


};


/*
 *  The drawing function
 */
ChargerMap.prototype.goTo = function(location,bounds){
    var vis =  this;
    //map.setView(location);
    map.fitBounds(bounds);
    vis.updateVis();
};


ChargerMap.prototype.updateVis = function() {
};
