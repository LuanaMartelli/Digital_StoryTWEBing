let svgCodes = d3.select('#svgcodes')
let width3 = +svgCodes.attr('width')
let height3 = +svgCodes.attr('height')
let radius = Math.min(width3, height3) / 2
let g3 = svgCodes.append('g').attr('transform', 'translate(' + width3 / 2 + ',' + height3 / 2 + ')')

let color = d3.scaleOrdinal(['#e58a34', '#4682b4', '#e58a34', '#4682b4', '#e58a34', '#4682b4', '#e58a34'])

let pie = d3
  .pie()
  .sort(null)
  .value(function (d) { return d.value })

let path3 = d3
  .arc()
  .outerRadius(radius - 10)
  .innerRadius(0)

let label = d3
  .arc()
  .outerRadius(radius - 40)
  .innerRadius(radius - 40)

d3.csv('scripts/codes/codes.csv', function (d) {
  d.value = +d.value
  return d
}, function (error, data) {
  if (error) throw error

  let arc = g3.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc')

  arc
    .append('path')
    .attr('d', path3)
    .attr('fill', function (d) { return color(d.data.code) })

  arc
    .append('text')
    .attr('transform', function (d) { return 'translate(' + label.centroid(d) + ')' })
    .attr('dy', '0.35em')
    .text(function (d) { return d.data.code })
})
