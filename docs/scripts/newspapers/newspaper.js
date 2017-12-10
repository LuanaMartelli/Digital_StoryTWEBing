/**
 * @summary Génère l'histograme des données trouvées dans nbNewspapers.tsv
 * @author Luana Martelli
 * @author Mika Pagani
 */

/* Defini la taille du canvas */
let svg = d3.select('#svgnewspapers')
let margin = { top: 10, right: 30, bottom: 20, left: 90 }
let width = +svg.attr('width') - margin.left - margin.right
let height = +svg.attr('height') - margin.top - margin.bottom

/* Création du Tooltip */
let tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'toolTip')

/* Defini le type d'axes */
/* L'axe x des valeurs, est linéaire
Est placé à l'endroit donné (0,0 est en haut à gauche)
L'axe est de la même largeur que le canvas
*/
let x = d3
  .scaleLinear()
  .rangeRound([0, width])

/* Axe y des noms, est ordinal et discret
L'axe est de la même hauteur que le canvas
Le padding défini l'espaces entre les barres (mais les déplaces pas, change épaisseur)
*/
let y = d3
  .scaleBand()
  .rangeRound([height, 20])
  .padding(0.1)

/* Ajoute les marges */
let g = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

/* Chargement et traitement des données */
d3.tsv('scripts/newspapers/nbNewspapers.tsv', function (d) { return d }, function (error, data) {
  if (error) throw error

  /* Trie les données par odre décroissant */
  data.sort(function (a, b) { return a.number - b.number })

  /* Défini les domaines (les extrèmes pour le linéaire et toutes les valeures pour le band) */
  x.domain([0, 26000])
  y.domain(data.map(function (d) { return d.newspaper }))

  /* On ajoute l'axe des x au svg */
  g
    .append('g')
    .attr('class', 'x axis')
    .call(d3.axisBottom(x).ticks(5))

  /* On ajoute l'axe des y au svg */
  g
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y))

  /* Insertion des barres dans le svg */
  g
    .selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('y', function (d) { return y(d.newspaper) })
    .attr('width', function (d) { return x(d.number) })
    .on('mousemove', function (d) {
      tooltip
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY + 10 + 'px')
        .style('visibility', 'visible')
        .html((d3.format(',')(d.number) + ' news'))
    })
    .on('mouseout', function (d) { tooltip.style('visibility', 'hidden') })
})
