let svgCouples = d3.select('#svgcouples')
let margin2 = { top: 20, right: 20, bottom: 30, left: 100 }
let width2 = +svgCouples.attr('width') - margin2.left - margin2.right
let height2 = +svgCouples.attr('height') - margin2.top - margin2.bottom
let g2 = svgCouples.append('g').attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

let tooltip2 = d3
  .select('body')
  .append('div')
  .attr('class', 'toolTip')

let x2 = d3
  .scaleBand()
  .rangeRound([0, width2])
  .paddingInner(0.1)
  .align(0.1)

let y2 = d3
  .scaleLinear()
  .rangeRound([height2, 0])

let z2 = d3
  .scaleOrdinal()
  .range(['#4682b4', '#e58a34'])

d3.csv('scripts/couples/couples.csv', function (d, i, columns) {
  let t = 0
  for (i = 1; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]]
  d.total = t
  return d
}, function (error, data) {
  if (error) throw error

  let keys = data.columns.slice(1)

  data.sort(function (a, b) { return b.total - a.total })
  x2.domain(data.map(function (d) { return d.Countries }))
  y2.domain([0, d3.max(data, function (d) { return d.total })]).nice()
  z2.domain(keys)

  g2
    .append('g')
    .selectAll('g')
    .data(d3.stack().keys(keys)(data))
    .enter().append('g')
    .attr('fill', function (d) { return z2(d.key) })
    .selectAll('rect')
    .data(function (d) { return d })
    .enter().append('rect')
    .attr('x', function (d) { return x2(d.data.Countries) })
    .attr('y', function (d) { return y2(d[1]) })
    .attr('height', function (d) { return y2(d[0]) - y2(d[1]) })
    .attr('width', x2.bandwidth())

  g2
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height2 + ')')
    .call(d3.axisBottom(x2))

  g2
    .append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y2).ticks(null, 's'))
    .append('text')
    .attr('x', 2)
    .attr('y', y2(y2.ticks().pop()) + 0.5)
    .attr('dy', '0.32em')
    .attr('fill', '#000')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'start')
    .text('Helps')

  let legend = g2
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(keys.slice().reverse())
    .enter().append('g')
    .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')' })

  g2
    .selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    //.attr('height', y2.bandwidth())
    .attr('y', function (d) { return y2(d.Countries) })
    //.attr('width', function (d) { return x(d.Country1-Country2) })
    .on('mousemove', function (d) {
      tooltip2
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY + 10 + 'px')
        .style('display', 'inline-block') 
        .style('visibility', 'visible')
        .html((d3.format(',')(d.Countries) + ' news'))
    })
    .on('mouseout', function (d) { tooltip2.style('visibility', 'hidden') })


  legend
    .append('rect')
    .attr('x', width2 - 19)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', z2)

  legend
    .append('text')
    .attr('x', width2 - 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(function (d) { return d })
})
