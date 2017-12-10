/**
 * @summary Génère la carte du monde avec les liens trouves dans links.
 * @author Luana Martelli
 * @author Mika Pagani
 */

/* Defini la taille du canvas */
var svgLinks = d3
  .select('#svglinks')
var lwidth = +svgLinks.attr('width')
var lheight = +svgLinks.attr('height')

/* Création du bouton Toggle */
d3
  .select('#links_chart')
  .append('input')
  .text('wiggle')
  .attr('id', 'links_bttn')
  .attr('type', 'button')
  .attr('value', 'Toggle')
  .attr('onclick', 'toggleView()')
  .attr('class', 'links-button-in')

/* Création du label du bouton */
d3
  .select('#links_chart')
  .append('label')
  .text('Selected country helps ...')
  .attr('id', 'links_lbl')
  .attr('for', 'links_bttn')
  .style('font-family', 'verdana')
  .style('padding', '10px 24px')

/* Variable définissant l'état du bouton */
var isHelping = true

/* Création de la projection du globe */
const projection = d3
  .geoNaturalEarth1()
  .scale(220)
  .translate([lwidth / 2, lheight / 2])

/* Création du gestionnaire de points et d'arcs
Définition de la taille des points
Attribution du type de projection utilisé
*/
const path = d3
  .geoPath()
  .pointRadius(2)
  .projection(projection)

/* Création du diagramme de Voronoi */
const voronoi = d3.voronoi().extent([[-1, -1], [lwidth + 1, lheight + 1]])

/* Chargement et traitement des données */
d3
  .queue()
  .defer(d3.json, 'scripts/links/world.json')
  .defer(d3.csv, 'scripts/links/countries.csv', typeCountry)
  .defer(d3.csv, 'scripts/links/links.csv', typeLink)
  .await(ready)

/* Fonction de création du graphe, est lancée lorsque les fichiers sont chargés */
function ready (error, world, countries, links) {
  if (error) throw error

  /* Création d'une liste ayant pour éléments les pays et comme clef leur code ISO */
  var countryByCode = d3.map(countries, function (d) {
    return d.country
  })

  /* Pour chaque lien existant, extraire les acteurs et l'ajouter aux arcs entrants et sortants */
  links.forEach(function (link) {
    var source = countryByCode.get(link.actorA)
    var target = countryByCode.get(link.actorB)
    if (source != null && target != null) {
      source.arcs_out.coordinates.push([source, target])
      target.arcs_in.coordinates.push([target, source])
    }
  })

  /* Ajout de la carte du monde au svg */
  svgLinks
    .insert('path', '.graticule')
    .datum(topojson.feature(world, world.objects.land))
    .attr('class', 'land')
    .attr('d', path)

  /* Ajout des frontières au svg */
  svgLinks
    .insert('path', '.graticule')
    .datum(
    topojson.mesh(world, world.objects.countries, function (a, b) {
        return a !== b
      })
    )
    .attr('class', 'boundary')
    .attr('d', path)

  /* Ajout des points des pays au svg */
  svgLinks
    .append('path')
    .attr('class', 'country-dots')
    .attr('d', path({ type: 'MultiPoint', coordinates: countries }))

  /* Ajout des données des pays au svg */
  var country = svgLinks
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('g')
    .attr('class', 'country')

  /* Création des tooltips */
  country.append('title').attr('id', 'description').text(function (d) {
    return d.country + '\n' + d.arcs_out.coordinates.length + ' links'
  })

  /* Ajout des chemins sortants au svg */
  country
    .append('path')
    .attr('class', 'country-arc-out')
    .attr('d', function (d) {
      return path(d.arcs_out)
    })

  /* Ajout des chemins entrants au svg */
  country
    .append('path')
    .attr('class', 'country-arc-in')
    .attr('d', function (d) {
      return path(d.arcs_in)
    })

  /* Création du diagramme de Voronoi des pays sur la projection actuelle */
  country
    .append('path')
    .data(voronoi.polygons(countries.map(projection)))
    .attr('class', 'country-cell')
    .attr('d', function (d) {
      return d ? 'M' + d.join('L') + 'Z' : null
    })
}

/* Crée un pays ayant pour caractéristique sa position et sa ses liens entrants et sortants */
function typeCountry (d) {
  d[0] = +d.longitude
  d[1] = +d.latitude
  d.arcs_in = { type: 'MultiLineString', coordinates: [] }
  d.arcs_out = { type: 'MultiLineString', coordinates: [] }
  return d
}

function typeLink (d) {
  d.count = +d.count
  return d
}

/* Fonction qui permet de transitionner entre la vue des arcs entrants et sortants */
function toggleView () {
  isHelping = !isHelping
  if (isHelping) {
    d3.selectAll('.country-arc-in').style('display', 'none')
    d3.selectAll('.country-arc-out').style('display', 'inline')
    d3.select('#links_lbl').text('Selected country helps ...')
    d3.select('#links_bttn').attr('class', 'links-button-in')
    d3.selectAll('#description').text(function (d) { return d.country + '\n' + d.arcs_out.coordinates.length + ' links' })
  } else {
    d3.selectAll('.country-arc-in').style('display', 'inline')
    d3.selectAll('.country-arc-out').style('display', 'none')
    d3.select('#links_lbl').text('Selected country is helped by ...')
    d3.select('#links_bttn').attr('class', 'links-button-out')
    d3.selectAll('#description').text(function (d) { return d.country + '\n' + d.arcs_in.coordinates.length + ' links' })
  }
}
