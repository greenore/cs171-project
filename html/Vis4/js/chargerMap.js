
/*
 *  chargerMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

ChargerMap = function(_parentElement, _data , _mapPosition,_chargerTypes,_colorScale ) {
    this.parentElement = _parentElement;
    this.colorScale = _colorScale;
    this.chargerTypes = _chargerTypes;
    this.data = _data;
    this.mapPosition = _mapPosition;
    L.Icon.Default.imagePath = 'img';
    this.map = null;
    this.filterList = {};
    this.circleFilterList = {};
    this.mode = 'full';
    this.initialState = false;
    this.initVis();
};


/*
 *  Initialize station map
 */

ChargerMap.prototype.initVis = function() {
    var vis = this;
    vis.initialState = true;
    // creating chargerLists for specific charger layers
    vis.iconList = {};
    vis.markerList = [];
    vis.CircleMarkerList = [];
    vis.chargerTypesList = Object.keys(vis.chargerTypes);


    vis.chargerTypesList.map(function (d) {
        //TODO  API icons or offline icons ?
        vis.iconList[d] = L.MakiMarkers.icon({icon: "fuel", color: vis.colorScale(d), size: "m"});
        //vis.iconList[d] = L.icon(
        //    {
        //        iconUrl: 'img/pin-m-fuel+' + vis.colorScale(d).substr(1)+'.png',
        //        shadowUrl: null,
        //
        //        iconSize:     [30, 70], // size of the icon
        //        shadowSize:   null, // size of the shadow
        //        iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
        //        shadowAnchor: null,  // the same for the shadow
        //        popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
        //    }
        //);
        vis.markerList[d] = [];
        vis.CircleMarkerList[d]=[];
        vis.filterList[d]= 1;
        vis.circleFilterList[d]=1;
    });
    // create filterObj to keep track what's displayed and what not.

    var tmpMarker;
    // sort every station from data into its specific marker list
    vis.data.map(function(d,index){
        if (+d.latitude && +d.longitude ) {
            x = d.ev_connector_types;
            if (x) {
                x.forEach(function (el) {
                    tmpMarker = L.marker([+d.latitude, +d.longitude],{icon: vis.iconList[el]})
                        .bindPopup('<div class = "markerText"><strong>'  + d.street_address + '<br>'
                            + d.city + '<br> Charger(s): '
                            +d.ev_connector_types.join() + '</strong></div>'
                        );
                    vis.markerList[el].push(tmpMarker);
                });
            }
        }
    });

    //create map
    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 5);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(vis.map);

    vis.centerMarker = L.marker(vis.mapPosition, {
        'draggable' : true
    });
    vis.centerMarker.addTo(vis.map);
    // create marker parent
    vis.allChargers = new L.MarkerClusterGroup({ chunkedLoading: true});
    vis.circleChargers = new L.MarkerClusterGroup({ chunkedLoading: true});


    // create sub groups for markers
    start = new Date().getTime();
    vis.mySubGroup = {};
    vis.chargerTypesList.map(function (d,i) {
        vis.mySubGroup[d] = L.featureGroup.subGroup(vis.allChargers,  vis.markerList[d]);
    });
    //console.log("Adding chargers to map took: " + (new Date().getTime()-start)/1000 + 's');

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
        if (vis.mode == 'full') {
            vis.filterList[d] = 1;
        }
        else {
            vis.circleFilterList[d] = 1;
        }
    });
    vis.initialState = true;
};


ChargerMap.prototype.removeAllMarkers = function() {
    var vis =  this;
    vis.chargerTypesList.map(function (d,i) {
        if ( vis.mode== 'full') {
            vis.filterList[d] = 0;
        }
        else {
            vis.circleFilterList[d] = 0;
        }
    });
    vis.initialState = false;

};

ChargerMap.prototype.addMarkers = function(filter) {
    var vis =  this;
    filter.forEach(function(d){
        if (vis.mode == 'full') {
            vis.filterList[d] = 1;

        }
        else {
            vis.circleFilterList[d] = 1;
        }
    });
    //console.log(vis.filterList);
};

ChargerMap.prototype.removeMarkers = function(filter) {
    var vis =  this;
    filter.forEach(function(d){
        if (vis.mode == 'full') {
            vis.filterList[d] = 0;
        }
        else {
            vis.circleFilterList[d] = 0;
        }
    });
};

/*
 *  The drawing function
 */
ChargerMap.prototype.goTo = function(location,bounds){
    var vis =  this;
    vis.map.removeLayer(vis.centerMarker);
    //map.setView(location);
    vis.centerMarker = L.marker(location, {'draggable' : true});
    vis.map.addLayer(vis.centerMarker);
    vis.map.fitBounds(bounds);
    vis.updateVis();
};

ChargerMap.prototype.returnChargerDistr  = function() {
    var vis =  this;
    var rObj = [];
    vis.chargerTypesList.forEach(function (d,i) {
        rObj[i] = {};
        rObj[i]['key'] = d;
        rObj[i]['name'] = chargerTypes[d];
        if (vis.filterList[d] == 2){
            if (vis.mode == 'full') {
                rObj[i]['value'] = vis.markerList[d].length;
            }
            else{
                rObj[i]['value'] = vis.CircleMarkerList[d].length;
            }
        }
        else {
            rObj[i]['value'] = 0;
        }
    });
    return rObj;
};

ChargerMap.prototype.drawRangeCircle = function(radius){
    var vis = this;
    var center = vis.centerMarker.getLatLng();
    vis.mode = 'circle';
    vis.CircleSubGroup = {};
    vis.circle = L.circle( center,radius).addTo(vis.map);
    vis.map.removeLayer(vis.allChargers);
    vis.chargerTypesList.map(function (d,i) {
        vis.circleFilterList[d] = 1;
        vis.CircleMarkerList[d]=[];
        vis.markerList[d].forEach(function(e,i){
            if (e.getLatLng().distanceTo(center) < radius)
            {
                vis.CircleMarkerList[d].push(e);
            }
        });
        vis.CircleSubGroup[d] = L.featureGroup.subGroup(vis.circleChargers,vis.CircleMarkerList[d]);
        // vis.initialState = true;
    });
    vis.initialState = true;
    console.log(vis.circleFilterList);
    vis.updateVis();
};

ChargerMap.prototype.removeRangeCircle = function(){
    var vis = this;
    vis.mode = 'full';
    vis.CircleMarkerList = [];
    vis.map.removeLayer(vis.circle);
    vis.map.removeLayer(vis.circleChargers);
    vis.circleChargers.clearLayers();
    //vis.initialState = true;
    vis.chargerTypesList.map(function (d,i) {
        vis.map.removeLayer(vis.CircleSubGroup[d]);
        if (vis.filterList[d] == 0){
            vis.filterList[d] = 1;
        }

    });
    vis.initialState = true;
    console.log(vis.filterList);
    vis.updateVis();
};



ChargerMap.prototype.updateVis = function() {
    var vis =  this;
    switch (vis.mode) {
        case 'full' :
            console.log('adding full map markers:');
            console.log(vis.filterList);

            vis.chargerTypesList.map(function (d, i) {
                switch (vis.filterList[d]) {

                    case 0 :
                        vis.map.removeLayer(vis.mySubGroup[d]);
                        break;
                    case 1 :
                        vis.mySubGroup[d].addTo(vis.map);
                        vis.filterList[d] = 2;
                        break;
                    default :
                        break;
                }
            });
            vis.allChargers.addTo(vis.map);
            vis.allChargers.refreshClusters();

            break;
        case 'circle' :
            console.log('adding circle markers: ');
            console.log(vis.circleFilterList);
            vis.chargerTypesList.map(function (d, i) {

                switch (vis.circleFilterList[d]) {

                    case 0 :
                        vis.map.removeLayer(vis.CircleSubGroup[d]);
                        break;
                    case 1 :
                        vis.CircleSubGroup[d].addTo(vis.map);
                        vis.circleFilterList[d] = 2;
                        break;
                    default :
                        //console.log("nothing to do for charger type: " + d);
                        break;
                }
            });
            vis.circleChargers.addTo(vis.map);
            vis.circleChargers.refreshClusters();
            break;

    }
    //console.log("Done adding chargers in: " + (new Date().getTime()-start)/1000 + 's');

};
