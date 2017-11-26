// TODO : Known bug : when you scoll fast on a circle, it becomes smaller...
// set the stage
var margin = {t:20, r:20, b:50, l:150 },
    w = 1400 - margin.l - margin.r,
    h = 700 - margin.t - margin.b,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([h - 60, 0]),
    //colors that will reflect geographical regions
    color = d3.scale.category10();

var svg = d3.select("#chart").append("svg")
    .attr("width", w + margin.l + margin.r)
    .attr("height", h + margin.t + margin.b);

// set axes, as well as details on their ticks
var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(20)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(20)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("left");

// group that will contain all of the plots
var groups = svg.append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");


// bring in the data, and do everything that is data-driven
var dsv = d3.dsv("\t", "text/plain");
dsv("./data/newspapers.csv", function(data) {

    var countData = d3.nest()
        .key(function(d) { return d.url;})
        .rollup(function(g) { 
        return g.length }).entries(data);


    var selection = countData.sort(function(x,y) {return d3.descending(x.values, y.values)})
        selection = selection.slice(0,100)

    var x0 = d3.min(selection, function(d) { return d.values; });
    var x1 = d3.max(selection, function(d) { return d.values; });

    x.domain([x0, x1]);

    // style the circles, set their locations based on data
    var circles =
        groups.selectAll("circle")
        .data(selection)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d) {return x(+d.values);})
        .attr("cy", function (d) {return Math.random() * h})
        .attr("id", function (d) {return d.key;})
        .attr("r", function (d) {return d.values/550;})
        .attr("value", function (d) {return d.values;})
        .style("fill", function(d) { return color(d.key); });
     
    // run the mouseon/out functions
    circles.on("mouseover", function(d) {
        var circle = d3.select(this);
        const rayon = circle.attr("r");

    // transition to increase size/opacity of bubble
    circle.transition()
        .duration(800).style("opacity", 1)
        .attr("r", rayon * 2)
        .ease("elastic");
        console.log(circle.attr("r"));

    // function to move mouseover item to front of SVG stage, in case
    // another bubble overlaps it
    d3.selection.prototype.moveToFront = function() { 
        return this.each(function() { 
        this.parentNode.appendChild(this); 
    }); 
};

    // skip this functionality for IE9, which doesn't like it
if (!$.browser.msie) {
        circle.moveToFront();   
    }
});

circles.on("mouseout", function(d) {
    var circle = d3.select(this);
    const rayon = circle.attr("r");

// go back to original size and opacity
circle.transition()
    .duration(800).style("opacity", .5)
    .attr("r", rayon / 2)
    .ease("elastic");
});

    // tooltips (using jQuery plugin tipsy)
circles.append("title")
    .attr("dx", function(d) {return d.values;})
    .attr("dy", 0 + w/2)
    .text(function(d) {return d.key;})

    $(".circles").tipsy({gravity: 's', fade: true, html: true, title: function() { return this.getAttribute('id') + " " + this.getAttribute('value') + " articles";}});
});
