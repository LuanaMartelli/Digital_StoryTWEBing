$.get('./docs/data/DB_2/20130401.csv', 'utf8', function (data) {
	var dsv = d3.dsvFormat(';');
	var allData = dsv.parse(data, (d) => {	
		var crossfilter = crossfilter(allData);
		
		var byActor1 = crossfilter.dimension(function(p) { return p.actor1; });
		var groupByActor = byActor1.group();
		groupByActor.top(Infinity).forEach(function(a, i) {
			console.log(a.key + ": " + a.value);
		});
	});
	
});


