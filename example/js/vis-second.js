var width = 500,
    height = 500;

var i = 0;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.x, d.y];
    });

var svg2 = d3.select("#vis2").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0," + 30 + ")");

var root;
d3.json("data/malaria-parasites.json", function (error, parasites) {

    root = parasites[0];
    generate();


});

function generate() {

    // get nodes
    var nodes = tree.nodes(root);

    // set node depth
    nodes.forEach(function (d) {
        d.y = 100 * d.depth;
    });

    // connections
    var connections = tree.links(nodes);
    svg2.selectAll("path.link")
        .data(connections, function (d) {
            return d.target.name;
        })
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);

    // circles
    svg2.selectAll("circle")
        .data(nodes, function (d) {
            return d.name;
        })
        .enter()
        .append("circle")
        .attr("r", 0)
        .attr("class", "node-circle")
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        })
        .transition()
        .duration(2000)
        .attr("r", 10);

    // labels
    svg2.selectAll("text")
        .data(nodes, function (d) {
            return d.name;
        })
        .enter()
        .append("text")
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y - 15;
        })
        .attr("class", "node-label")
        .text(function (d) {
            return d.name;
        });

}