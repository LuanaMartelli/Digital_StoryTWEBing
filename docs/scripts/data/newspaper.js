var chart = dc.barChart("#test");

var dsv = d3.dsvFormat(';');
var allData = dsv.parse('/data/DB_2/20130401.csv', (d) => {	
	var cf = crossfilter(d);
	
	var byUrl = cf.dimension(function(p) { return p.url; });
	var groupByUrl = byUrl.group();
	console.log(groupByUrl);

	chart
	.width(768)
	.height(480)
	.x(d3.scale.linear().domain([6,20]))
	.brushOn(false)
	.yAxisLabel("This is the Y Axis!")
	.dimension(byUrl)
	.group(groupByUrl)
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	});
	chart.render();
});

