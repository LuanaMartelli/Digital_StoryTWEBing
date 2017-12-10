/**
 * @summary Génère l'histograme des couples de pays trouvés dans couples.csv
 * @author Luana Martelli
 * @author Mika Pagani
 */

let svgCouples = d3.select('#svgcouples')
let margin2 = { top: 20, right: 90, bottom: 30, left: 90 }
let width2 = +svgCouples.attr('width') - margin2.left - margin2.right
let height2 = +svgCouples.attr('height') - margin2.top - margin2.bottom
let g2 = svgCouples
  .append('g')
  .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

let tooltip2 = d3
  .select('body')
  .append('div')
  .attr('class', 'toolTipCouple')

let x01 = d3
  .scaleBand()
  .rangeRound([0, width2])
  .paddingInner(0.1)

let x2 = d3.scaleBand().padding(0.05)

let y2 = d3.scaleLinear().rangeRound([height2, 0])

let z2 = d3.scaleOrdinal().range(['#ff8c00', '#ff8c00'])

d3.csv('scripts/couples/couples.csv',
  function (d, i, columns) {
    columns.sort(function (a, b) {
      return a.value - b.value
    })

    for (let i = 1, n = columns.length; i < n; ++i) {
      d[columns[i]] = +d[columns[i]]
    }
    return d
  },
  function (error, data) {
    if (error) throw error

    let keys = data.columns.slice(1)

    x01.domain(
      data.map(function (d) {
        return d.countries
      })
    )
    x2.domain(keys).rangeRound([0, x01.bandwidth()])
    y2
      .domain([
        0,
        d3.max(data, function (d) {
          return d3.max(keys, function (key) {
            return d[key]
          })
        })
      ])
      .nice()

    g2
      .append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', function (d) {
        return 'translate(' + x01(d.countries) + ',0)'
      })
      .selectAll('rect')
      .data(function (d) {
        return keys.map(function (key) {
          return { key: key, value: d[key] }
        })
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return x2(d.key)
      })
      .attr('y', function (d) {
        return y2(d.value)
      })
      .attr('width', x2.bandwidth())
      .attr('height', function (d) {
        return height2 - y2(d.value)
      })
      .attr('fill', function (d) {
        return z2(d.key)
      })

    g2
      .selectAll('rect')
      .on('mousemove', function (d) {
        tooltip2
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY + 10 + 'px')
          .html(d3.format(',')(d.value) + ' links')
          .style('visibility', 'visible')
      })
      .on('mouseout', function (d) {
        tooltip2.style('visibility', 'hidden')
      })

    g2
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height2 + ')')
      .call(d3.axisBottom(x01))

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
      .text('Aid')
  }
)
