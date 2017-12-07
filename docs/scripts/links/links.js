let svg1 = d3
  .select('#svglinks')
  .attr('viewBox', '0 0 1400 800')
  .attr('preserveAspectRatio', 'xMidYMid slice')
let width1 = +svg1.attr('width')
let height1 = +svg1.attr('height')

/* Choisi le type de projection du globe et centre l'image */
let projection = d3
  .geoNaturalEarth1()
  .scale(250)
  .translate([width1 / 2, height1 / 2])

  /* Gestionnaire de points et d'arcs + La taille des points des chaque pays */
let path = d3
  .geoPath()
  .pointRadius(2)
  .projection(projection)

  /* Défini la zone ou sera généré la grille de voronoi. Ici elle est générée de façon à être 1 plus grand sur touts les côtés */
let voronoi = d3.voronoi().extent([[-1, -1], [width1 + 1, height1 + 1]])

d3
  .queue()
  .defer(d3.json, 'scripts/links/world.json')
  .defer(d3.csv, 'scripts/links/countries.csv', typeAirport)
  .defer(d3.csv, 'scripts/links/links.csv', typeFlight)
  .await(ready)

/* La fonction ready est lancée quand les 3 defers sont prêts */
function ready (error, world, countries, links) {
  if (error) throw error

  let countryByCode = d3.map(countries, function (d) {
    return d.country
  })

  links.forEach(function (link) {
    let source = countryByCode.get(link.actorA)
    let target = countryByCode.get(link.actorB)
    if (source != null && target != null) {
      source.arcs.coordinates.push([source, target])
      target.arcs.coordinates.push([target, source])
    }
  })

  /* Dessine la carte */
  svg1
    .insert('path', '.graticule')
    .datum(topojson.feature(world, world.objects.land))
    .attr('class', 'land')
    .attr('d', path)

  /* Dessine les frontières */
  svg1
    .insert('path', '.graticule')
    .datum(
      topojson.mesh(world, world.objects.countries, function (a, b) {
        return a !== b
      })
    )
    .attr('class', 'boundary')
    .attr('d', path)

  /* Dessine les points des pays */
  svg1
    .append('path')
    .attr('class', 'country-dots')
    .attr('d', path({ type: 'MultiPoint', coordinates: countries }));

  /* Rerpésente le tout */
  let country = svg1
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('g')
    .attr('class', 'country')

  /* Tooltip de chaque pays */
  country.append('title').text(function (d) {
    return d.country + '\n' + d.arcs.coordinates.length + ' links'
  })

  country
    .append('path')
    .attr('class', 'country-arc-out')
    /* Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à 'hover' */
    .attr('d', function (d) {
      return path(d.arcs)
    })
  /* country.append('path')
            .attr('class', 'country-arc-in')
            //Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à 'hover'
            .attr('d', function (d) { return path(d.arcs); }); */
  country
    .append('path')
    .data(voronoi.polygons(countries.map(projection)))
    .attr('class', 'country-cell')
    .attr('d', function (d) {
      return d ? 'M' + d.join('L') + 'Z' : null
    })
}

function typeAirport (d) {
  d[0] = +d.longitude
  d[1] = +d.latitude
  d.arcs = { type: 'MultiLineString', coordinates: [] }
  return d
}

function typeFlight (d) {
  d.count = +d.count
  return d
}
