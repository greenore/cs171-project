
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
    chargers = new L.MarkerClusterGroup();
    //chargers = L.layerGroup();

    //add station markers to  layer
    vis.data.map(function(d,index){
        if ( index % 1 == 0) {
            // console.log("marker: " + index);
            chargers.addLayer(L.marker([+d.latitude, +d.longitude]));
            //chargers.addLayer(d.marker);
        }
    });
    console.log("Done adding chargers in: " + (new Date().getTime()-start)/1000 + 's');
    start = new Date().getTime();
    chargers.addTo(map);
    console.log("Adding chargers to map took: " + (new Date().getTime()-start)/1000 + 's');

    vis.wrangleData();
};


/*
 *  Data wrangling
 */

ChargerMap.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();
}


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
