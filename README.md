# CS 171 - Electric Vehicles (EV) Website
A focused, minimum viable product (hence MVP). The project takes a deep dive into electric vehicle usage in the US. It is going to tell the story for a reader who could be a possible buyer of an electric vehicle in the near future. That mean it gives a general overview about electric vehicle technologies and how the environment can benefit from using it. Consequently that means guiding the reader through model overviews / market shares / sales statistics towards important usage questions like service and charging network.

## Project Organization
* **Issues** for individual actionable items, or bugs i.e.:
  * Design home page
  * Implement home page
* **Milestones** for "releases" or overall steps, i.e.:
  * [Single-page site](http://greenore.github.io/EV-Website)
  * [Process Book](https://docs.google.com/document/d/1M83uYdwIpXW8BmJTyH1ezhldWYpx9OqnXTMCWDdt3jI/edit?usp=sharing)
  * [R-Code](https://github.com/greenore/EV-R-Code)

## Architecture/Philosophies
* HTML, CSS, and JS
* Bootstrap, JQuery, Colorbrewer & D3 as frameworks (keep it simple!)
* Mobile-friendly (check for different screen sizes)
* Prototypes in R, Accesible via iFrames
* Encapsilated code as much as possible.

## Team members:
Byron Bahan     <byron.bahan@gmail.com>
Tim Hagmann     <tim.hagmann@gmail.com>
Enrico Mund     <mund.enrico@gmail.com>

TA:  Andrew Reece

*Project homepage:*  http://greenore.github.io/EV-Website/
*Process Book:* https://goo.gl/4wYMqe
*R-Code:* https://github.com/greenore/EV-R-Code
*Project* presentation video: 

*Project structure:*
||-- css (Styling)
||-- data (datasets)
||-- fonts (helper files for fonts)
||-- html (Subfolders for iframes)
||-- img (All the necessary images)
||-- js (Javascript files)
|-- index.html 
|-- README.md

The index.html file is the master file that structures the project. The README.pdf file holds a small overview of the project.

*Used libraries:*
jquery.min.js
bootstrap.min.js
queue.min.js
d3.min.js
d3-tip.js
colorbrewer.js
bootstrap-switch.js
bootstrap-slider.min.js
leaflet.js
leaflet.markercluster.js
leaflet.featuregroup.subgroup-src.js
Leaflet.MakiMarkers.js
topojson.v1.min.js
d3-legend.min.js

*Visualization details:*
Homepage layout and implementation details:

The homepage is implemented as a flat structure that requires scrolling for navigation. Visualization 1 and 4 are integrated in iframes that help to keep the visualizations independent and avoid conflicting variable assignments etc. Vis 2 and 3 are implemented directly into the main page and are linked through handler functions.  

**Vis 1- Choropleth Map**
Part of the code were taken from js/topojson.v1.min.js &  for US map and bar graph and pie chart is modified from class assignments to accommodate our final assignment.   

**Vis 2 - Model Treemap**
Part of the code were taken from https://bl.ocks.org/mbostock/4063582 and then modified according to the project needs. 

**Vis 3 - Model Tree**
Parts of the code were taken from https://bl.ocks.org/mbostock/4339083 and then modified and amended to implement the model tree visualization. 

**Vis 4 - Map with Markers**
The skeleton code of the visualization was taken from CS171 - HW5 and then heavily modified to implement the charger network and the various filter options. The search functionality etc. was implemented by reading through the Google API documentation  

