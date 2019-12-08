
class CompanyMap {
	/**
	 * Constructor for the CompanyMap
	 *
	 * @param:
	 */
	constructor(compData, usMap, usStates) {
		this.compData = compData;
		this.usMap = usMap;
		this.usStates = usStates;
		this.svg = null;


	};

	/*
    * create us Map for Company location and bar charts for company's revenue and profits
    * @param
    *
    * */
	update() {
		let us = this.usMap;
		let data = this.compData;
		let width = 975;
		let height = 610;
		let format = d3.format(",.0f");
		let legendList = [10000, 100000, 500000];


		function cleanStrToNum(s) {
			return +(s.replace('$', '').replace(',', '').split('.')[0])
		}

		data = data.filter(d => d.Rank);
		data.forEach(d => d["Revenues(m)"] = cleanStrToNum(d["Revenues(m)"]));

		let revenueList = data.map(d => d["Revenues(m)"]);
		revenueList.sort((a, b) => b - a);

		console.log('data', data);
		console.log('revenueList', revenueList);
		console.log("d3.quantile(revenueList, 0.985)]", d3.quantile(revenueList, 0.985));
		let path = d3.geoPath();

		let radius = d3.scaleSqrt()
			.domain([0, d3.quantile(revenueList, 0.985)])
			.range([0, 20]);


		const svg =  d3.select('#compmap')
			.append("svg")
			.attr("viewBox", [-10, 0, width, height]);
		this.svg = svg;

		svg.append("path")
			.datum(topojson.feature(us, us.objects.nation))
			.attr("fill", "#ccc")
			.attr("d", path);

		svg.append("path")
			.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		const legend = svg.append("g")
			.attr("fill", "#777")
			.attr("transform", "translate(900,608)")
			.attr("text-anchor", "middle")
			.style("font", "10px sans-serif")
			.selectAll("g")
			.data(legendList)
			.join("g");

		legend.append("circle")
			.attr("fill", "none")
			.attr("stroke", "#ccc")
			.attr("cy", d => -radius(d))
			.attr("r", radius);

		legend.append("text")
			.attr("y", d => -2 * radius(d))
			.attr("dy", "1.3em")
			.text(d3.format(".1s"));

		var projection = d3.geoAlbersUsa()
			.translate([width / 2, height / 2])
			.scale([width * 1.36]);


		let compTag = svg.append("g")
			.attr("fill", "steelblue")
			.attr("fill-opacity", 0.5)
			.attr("stroke", "#fff")
			.attr("stroke-width", 0.5)
			.attr('id', 'circle-group')
			.selectAll("circle")
			.data(data)
			.enter()
			.append("g")
			.attr('id', d => 'circle' + d.Rank)
			.attr("transform", d => {
				let lon = +d.lon;
				let lat = +d.lat;
				let projectionRes = projection([lon, lat]);
				projectionRes = projectionRes ? projectionRes : [0, 0];
				// console.log("circle", d);
				// console.log("project", projectionRes);
				return `translate(${projectionRes})`
			})
		;


		compTag.append('circle')
			.attr("r", d => radius(+d["Revenues(m)"])) //radius(d["Revenues(m)"])
			.append('title')
			.text(d => d.Company_Name + '\n'
				+ "Location: " + d.City + ', ' + d.State + '\n'
				+ "Revenues(m): " + "$" + format(d["Revenues(m)"]));

		// compTag.append('text')
		// 	.text(d => d.Company_Name)
		// 	.attr('fill', 'black')
			// .attr('text-anchor','middle')
		// ;

		// this.updateSelectedComp()


	};


	/*
	* params:seletedComp rank as id for each company
	* */
	updateSelectedComp() {
		//get selection value
		// let compId = 1;
		let compId = JSON.parse(d3.select('.dd-button').attr('value') );
		console.log("comp", compId);

		//remove highlighted circle
		let hc = this.svg.select('#circle-group').selectAll('g')
			.attr('class', 'circle-highlight-no')
			;
		hc.selectAll('text').remove();

		;
		console.log('svg hc', hc);

		//highlight selected company
		this.svg.select(`g[id=circle${compId.Rank}]`)
			.raise()
			.attr('class','circle-highlight')
			.append('text')
			.text(compId.Company_Name)
			.attr('fill', 'black')

		;


	}
}