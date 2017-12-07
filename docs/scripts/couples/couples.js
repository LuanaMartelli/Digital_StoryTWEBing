 let svg2 = d3.select("#svgcouples"),
    margin2 = { top: 20, right: 20, bottom: 30, left: 100 },
    width2 = +svg2.attr("width") - margin2.left - margin2.right,
    height2 = +svg2.attr("height") - margin2.top - margin2.bottom,
        g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    let x2 = d3.scaleBand()
        .rangeRound([0, width2])
        .paddingInner(0.1)
        .align(0.1);

    let y2 = d3.scaleLinear()
        .rangeRound([height2, 0]);

    let z2 = d3.scaleOrdinal()
        .range(["#4682b4", "#e58a34"]);

    d3.csv("scripts/couples/couples.csv", function(d, i, columns) {

      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    }, function(error, data) {
      if (error) throw error;

      let keys = data.columns.slice(1);

      data.sort(function(a, b) { return b.total - a.total; });
      x2.domain(data.map(function(d) { return d.Countries; }));
      y2.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
      z2.domain(keys);

      g2.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return z2(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x2(d.data.Countries); })
          .attr("y", function(d) { return y2(d[1]); })
          .attr("height2", function(d) { return y2(d[0]) - y2(d[1]); })
          .attr("width2", x2.bandwidth());

      g2.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height2 + ")")
          .call(d3.axisBottom(x2));

      g2.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", y2(y2.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Helps");

      let legend = g2.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width2 - 19)
          .attr("width2", 19)
          .attr("height2", 19)
          .attr("fill", z2);

      legend.append("text")
          .attr("x", width2 - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
    });