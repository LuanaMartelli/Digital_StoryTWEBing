var svg = d3.select("#svglinks")
            .attr("viewBox", "0 0 900 600")
            .attr("preserveAspectRatio", "xMidYMid meet"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var projection = d3.geoNaturalEarth1() //Choisi le type de projection du globe
        .scale(170)
        .translate([width / 2, height / 2]); //Centre l'image

    var path = d3.geoPath() //Gesstionnaire de points et d'arcs
        .pointRadius(2) //La taille des points des chaque pays
        .projection(projection);

    var voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, height + 1]]); // Défini la zone ou sera généré la grille de voronoi
    //Ici elle est générée de façon à être 1 plus grand sur touts les côtés

    d3.queue()
        .defer(d3.json, "scripts/links/world.json") //Lire le fichier
        .defer(d3.csv, "scripts/links/countries.csv", typeAirport) //Lire le fichier et passer par fonction
        .defer(d3.csv, "scripts/links/links.csv", typeFlight)
        .await(ready);

    //La fonction ready est lancée quand les 3 defers sont prêts
    function ready(error, world, countries, links) {
        if (error) throw error;

        var countryByCode = d3.map(countries, function (d) { return d.country; });

        console.log(countryByCode.entries())

        links.forEach(function (link) {
            var source = countryByCode.get(link.actorA),
                target = countryByCode.get(link.actorB);
            if (source != null && target != null) {
                source.arcs.coordinates.push([source, target]);
                target.arcs.coordinates.push([target, source]);
            }
        });

        //Dessine la carte
        svg.insert("path", ".graticule")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        //Dessine les frontières
        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);

        //Dessine les points des pays
        svg.append("path")
            .attr("class", "airport-dots")
            .attr("d", path({ type: "MultiPoint", coordinates: countries }));
        
            //Rerpésente le tout
        var airport = svg.selectAll(".airport")
            .data(countries)
            .enter().append("g")
            .attr("class", "airport");

        //Tooltip de chaque pays
        airport.append("title")
            .text(function (d) { return d.country + "\n" + d.arcs.coordinates.length + " links"; });

        airport.append("path")
            .attr("class", "airport-arc-out")
            //Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à "hover"
            .attr("d", function (d) { return path(d.arcs); });
        /* airport.append("path")
            .attr("class", "airport-arc-in")
            //Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à "hover"
            .attr("d", function (d) { return path(d.arcs); }); */
        airport.append("path")
            .data(voronoi.polygons(countries.map(projection)))
            .attr("class", "airport-cell")
            .attr("d", function (d) { return d ? "M" + d.join("L") + "Z" : null; });
    }

    function typeAirport(d) {
        d[0] = +d.longitude;
        d[1] = +d.latitude;
        d.arcs = { type: "MultiLineString", coordinates: [] };
        return d;
    }

    function typeFlight(d) {
        d.count = +d.count;
        return d;
    }