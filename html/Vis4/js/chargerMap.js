
/*
 *  chargerMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

ChargerMap = function(_parentElement, _data , _mapPosition,_chargerTypes ) {
    this.parentElement = _parentElement;
    this.chargerTypes = _chargerTypes;
    this.data = _data;
    this.mapPosition = _mapPosition;
    L.Icon.Default.imagePath = 'img';
    this.map = null;
    this.filterList = {};
    this.initialState = false;
    this.initVis();
}


/*
 *  Initialize station map
 */

ChargerMap.prototype.initVis = function() {
    var vis = this;
    vis.initialState = true;
    // creating chargerLists for specific charger layers
    var markerList = [];
    vis.chargerTypesList = Object.keys(vis.chargerTypes);
    vis.chargerTypesList.map(function (d) {
        markerList[d] = [];
        vis.filterList[d]= 1;
    });
    // create filterObj to keep track what's displayed and what not.


    var tmpMarker;
    // sort every station from data into its specific marker list
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
        }
    });



    //create map
    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 5);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(vis.map);


    // create marker parent
    vis.allChargers = new L.MarkerClusterGroup({ chunkedLoading: true});

    // create sub groups for markers
    start = new Date().getTime();
    vis.mySubGroup = {};
    vis.chargerTypesList.map(function (d,i) {
        vis.mySubGroup[d] = L.featureGroup.subGroup(vis.allChargers,  markerList[d]);
    });
    console.log("Adding chargers to map took: " + (new Date().getTime()-start)/1000 + 's');

    vis.updateVis();
};


/*
 *  Data wrangling
 */

ChargerMap.prototype.isInitial = function (){
    var vis =  this;
    return vis.initialState;
};

ChargerMap.prototype.addAllMarkers = function() {
    var vis =  this;
    vis.chargerTypesList.map(function (d,i) {
        vis.filterList[d] = 1;
    });
};


ChargerMap.prototype.removeAllMarkers = function() {
    var vis =  this;
    vis.chargerTypesList.map(function (d,i) {
       vis.filterList[d] = 0;
    });
    vis.initialState = false;
};

ChargerMap.prototype.addMarkers = function(filter) {
    var vis =  this;
    filter.forEach(function(d){
        vis.filterList[d] = 1;
    });
    console.log(vis.filterList);
};

ChargerMap.prototype.removeMarkers = function(filter) {
    var vis =  this;
    filter.forEach(function(d){
        vis.filterList[d] = 0;
    });
};

/*
 *  The drawing function
 */
ChargerMap.prototype.goTo = function(location,bounds){
    var vis =  this;
    //map.setView(location);
    vis.map.fitBounds(bounds);
    vis.updateVis();
};


ChargerMap.prototype.updateVis = function() {
    var vis =  this;
    console.log("adding charger stations");
    start = new Date().getTime();
    vis.chargerTypesList.map(function (d,i) {
        switch (vis.filterList[d]) {

            case 0 :
                vis.map.removeLayer(vis.mySubGroup[d]);
                break;
            case 1 :
                vis.mySubGroup[d].addTo(vis.map);
                vis.filterList[d] = 2;
                break;
            default :
                console.log("nothing to do for charger type: " + d);
                break;
        }
    });
    console.log("Done adding chargers in: " + (new Date().getTime()-start)/1000 + 's');
    if (vis.initialState) {vis.allChargers.addTo(vis.map)}
    vis.allChargers.refreshClusters();
};
