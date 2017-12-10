var svgLinks = d3
  .select('#svglinks')
var lwidth = +svgLinks.attr('width')
var lheight = +svgLinks.attr('height')

// Creation of Button
d3
  .select('#links_chart')
  .append('input')
  .text('wiggle')
  .attr('id', 'links_bttn')
  .attr('type', 'button')
  .attr('value', 'Toggle')
  .attr('onclick', 'toggleView()')
  .attr('class', 'links-button-in')

// Creation of Label for Button
d3
  .select('#links_chart')
  .append('label')
  .text('Selected country helps ...')
  .attr('id', 'links_lbl')
  .attr('for', 'links_bttn')
  .style('font-family', 'verdana')
  .style('padding', '10px 24px')

var isHelping = true

var projection = d3
  .geoNaturalEarth1() // Choisi le type de projection du globe
  .scale(220)
  .translate([lwidth / 2, lheight / 2]) // Centre l'image

var path = d3
  .geoPath() // Gestionnaire de points et d'arcs
  .pointRadius(2) // La taille des points des chaque pays
  .projection(projection)

var voronoi = d3.voronoi().extent([[-1, -1], [lwidth + 1, lheight + 1]]) // Défini la zone ou sera généré la grille de voronoi
// Ici elle est générée de façon à être 1 plus grand sur touts les côtés

d3
  .queue()
  .defer(d3.json, 'scripts/links/world.json') // Lire le fichier
  .defer(d3.csv, 'scripts/links/countries.csv', typeAirport) // Lire le fichier et passer par fonction
  .defer(d3.csv, 'scripts/links/links.csv', typeFlight)
  .await(ready)

// La fonction ready est lancée quand les 3 defers sont prêts
function ready (error, world, countries, links) {
  if (error) throw error

  var countryByCode = d3.map(countries, function (d) {
    return d.country
  })

  links.forEach(function (link) {
    var source = countryByCode.get(link.actorA)
    var target = countryByCode.get(link.actorB)
    if (source != null && target != null) {
      source.arcs_out.coordinates.push([source, target])
      target.arcs_in.coordinates.push([target, source])
    }
  })

  // Dessine la carte
  svgLinks
    .insert('path', '.graticule')
    .datum(topojson.feature(world, world.objects.land))
    .attr('class', 'land')
    .attr('d', path)

  // Dessine les frontières
  svgLinks
    .insert('path', '.graticule')
    .datum(
    topojson.mesh(world, world.objects.countries, function (a, b) {
        return a !== b
      })
    )
    .attr('class', 'boundary')
    .attr('d', path)

  // Dessine les points des pays
  svgLinks
    .append('path')
    .attr('class', 'country-dots')
    .attr('d', path({ type: 'MultiPoint', coordinates: countries }))

  // Rerpésente le tout
  var country = svgLinks
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('g')
    .attr('class', 'country')

  // Tooltip de chaque pays
  country.append('title').attr('id', 'description').text(function (d) {
    return d.country + '\n' + d.arcs_out.coordinates.length + ' links';
  })

  country
    .append('path')
    .attr('class', 'country-arc-out')
    // Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à 'hover'
    .attr('d', function (d) {
      return path(d.arcs_out)
    })

  country
    .append('path')
    .attr('class', 'country-arc-in')
    // Les lignes sont toujours là mais c'est le CSS qui gère si il les affiche ou pas grâce à 'hover'
    .attr('d', function (d) {
      return path(d.arcs_in)
    })

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
  d.arcs_in = { type: 'MultiLineString', coordinates: [] }
  d.arcs_out = { type: 'MultiLineString', coordinates: [] }
  return d
}

function typeFlight (d) {
  d.count = +d.count
  return d
}

function toggleView () {
  isHelping = !isHelping
  if (isHelping) {
    d3.selectAll('.country-arc-in').style('display', 'none')
    d3.selectAll('.country-arc-out').style('display', 'inline')
    d3.select('#links_lbl').text('Selected country helps ...')
    d3.select('#links_bttn').attr('class', 'links-button-in')
    d3.selectAll('#description').text(function (d) {return d.country + '\n' +d.arcs_out.coordinates.length + ' links'})
  } else {
    d3.selectAll('.country-arc-in').style('display', 'inline')
    d3.selectAll('.country-arc-out').style('display', 'none')
    d3.select('#links_lbl').text('Selected country is helped by ...')
    d3.select('#links_bttn').attr('class', 'links-button-out')
    d3.selectAll('#description').text(function (d) {return d.country + '\n' +d.arcs_in.coordinates.length + ' links'})
  }
}
