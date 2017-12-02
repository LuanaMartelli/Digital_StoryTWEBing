
//Defini la taille du canvas
var svg = d3.select("#svgnewspapers"),
    margin = { top: 20, right: 20, bottom: 30, left: 100 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "toolTip");

//Defini le type d'axes
var x = d3.scaleLinear().rangeRound([0, width]);
//Axe des valeures, est linéaire
//L'axe est posé à l'endroit donné (0,0 est en haut à gauche)
var y = d3.scaleBand().rangeRound([height, 20]).padding(0.1);
//Axe des noms, est ordinal et discret.
//L'axe est de la même largeur que le canvas
//Le padding défini l'espaces entre les barres (mais les déplaces pas, change épaisseur)

//Ajoute les marges
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Lis les données du csv et les traites (génération du graphe)
d3.tsv("scripts/newspapers/nbNewspapers.tsv", function (d) { return d }, function (error, data) {
    if (error) throw error;

    data.sort(function (a, b) { return a.number - b.number });

    //Défini les domaines (les extrèmes pour le linéaire et toutes les valeures pour le band)
    x.domain([0, d3.max(data, function (d) { return d.number; })]);
    y.domain(data.map(function (d) { return d.newspaper; }));

    //On ajoute l'axe des x au svg
    g.append("g")
        .attr("class", "x axis") //Donne une classe CSS
        .call(d3.axisBottom(x).ticks(10)) //Défini l'espacement de l'échelle linéaire

    //On ajoute l'axe des y au svg
    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function (d) { return y(d.newspaper); })
        .attr("width", function (d) { return x(d.number); })
        .on("mousemove", function (d) {
            tooltip
                .style("left", d3.event.pageX + 10 + "px")
                .style("top", d3.event.pageY + 10 + "px")
                .style("display", "inline-block")
                .style("visibility", "visible")
                .html((d3.format(",")(d.number) + " news"));
        })
        .on("mouseout", function (d) { tooltip.style("visibility", "hidden"); });
});
