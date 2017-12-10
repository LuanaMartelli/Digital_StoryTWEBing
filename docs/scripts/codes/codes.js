/**
 * @summary Génère le diagramme des codes les plus communs
 * @author Luana Martelli
 * @author Mika Pagani
 */

var svgCodes = d3.select('#svgcodes')
var width3 = +svgCodes.attr('width')
var height3 = +svgCodes.attr('height')
var radius = Math.min(width3, height3) / 2
var donutWidth = 75
var legendRectSize = 18
var legendSpacing = 4
var g3 = svgCodes
  .append('g')
  .attr('transform', 'translate(' + width3 / 2 + ',' + height3 / 2 + ')')

var color = d3.scaleOrdinal([
  '#e58a34',
  '#4682b4',
  '#e58a34',
  '#4682b4',
  '#e58a34',
  '#4682b4',
  '#e58a34'
])

var arc = d3.arc()
  .innerRadius(radius - donutWidth)
  .outerRadius(radius)

var pie = d3.pie()
  .value(function (d) { return d.value })
  .sort(null)

var tooltip3 = g3.selectAll('path')
  .append('div')
  .attr('class', 'toolTipCode')

tooltip3.append('div')
  .attr('class', 'label')
     
tooltip3.append('div')
  .attr('class', 'count')

tooltip3.append('div')
  .attr('class', 'percent')

d3.csv('scripts/codes/codes.csv', function (error, dataset) {
  if (error) {
    console.log(error)
  }

  dataset.sort(function (a, b) { return a.value - b.value })

  dataset.forEach(function (d) {
    d.value = +d.value
  })

  g3.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function (d, i) {
      return color(d.data.code)
    })
    .on('mousemove', function (d) {
      var total = d3.sum(dataset.map(function(d) {
      return d.value;                          
    }))                                 
    var percent = Math.round(1000 * d.data.value / total) / 10
    tooltip3  .select('.label').html(d.data.code)
    tooltip3.select('.count').html(d.data.value)
    tooltip3.select('.percent').html(percent + '%')
    tooltip3.style('display', 'block');
    tooltip3.style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY + 10 + 'px')
        .style('visibility', 'visible')
  })
  .on('mouseout', function () {
    tooltip3.style('display', 'none')
  })

  var legend3 = g3.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) {
      var h = legendRectSize + legendSpacing
      var offset = h * color.domain().length / 2
      var horz = -2 * legendRectSize
      var vert = i * h - offset
      return 'translate(' + horz + ',' + vert + ')'
    })

  legend3.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color)

  legend3.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function (d) { return d })
})
