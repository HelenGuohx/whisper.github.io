

class SunburstChart{
    /**
   * Constructor for the SunburstChart
   *
   * @param
   */
    constructor (){

    };
    /*
    * create sunburst chart
    * @param
    *createLoaderTopCompanies
    * */
    update(data) {

    const COLOR = ["red","#00D8D5","green","yellow","blue","#D83C40","#FF03D1","#fc8d62","#8da0cb","#e78ac3", "#00d8d5","#ffd92f"];

    const size = 400;
    const parentNode = document.querySelector('#root');
	const radius = Math.floor(size / 2),
		innerRadius = 0

	const maxSize = Math.max(...data.map( ({ size }) => size ))

	const svg = d3.select(parentNode)
		.append('div')
		.attr("class", 'top_loader_container')
		.append("svg")
		.attr("width", size)
		.attr("height", size)
		.attr("class", 'top_loader')
		.append("g")
		.attr("transform", `translate(${size / 2}, ${size / 2})`)

	const pie = d3.pie()
		.value(d => d.size)
		.sort(null)

	const arcLabel = d3.arc()
		.outerRadius( ({ data }) => {
			const { size } = data
			const outerRadius = (radius - innerRadius) * (size / maxSize) + innerRadius
			return outerRadius
		})
		.innerRadius( ({ data }) => {
			const { size } = data
			const outerRadius = (radius - innerRadius) * (size / maxSize) + innerRadius
			return outerRadius
		})

	const arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius( ({ data }) => {
			const { size } = data
			const outerRadius = (radius - innerRadius) * (size / maxSize) + innerRadius
			return outerRadius
		} )

	//add pieChart
	const pieChart = svg
		.selectAll('.arc')
		.data(pie(data))
		.enter()
		.append('g')
		.attr('class', 'arc')

	pieChart.append('path')
		.attr("fill", (d, i) =>  COLOR[i])
		.attr('d', arc)
		.attr("stroke", "white")
		.attr("stroke-width", "2px")

	// Now add the annotation. Use the centroid method to get the best coordinates
	pieChart.append('text')
		.attr("dy", ".2em")
		.attr("dx", "-1em")
		.text(d => (d.data.name.length > 10) ? d.data.name.slice(0,10)+'...' : d.data.name )
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")";  })
		.attr("transform", d =>
			`translate(${arc.centroid(d)}) rotate(${90 + (d.startAngle + d.endAngle) / 2 * 180 / Math.PI})`)
		.style("text-anchor", "middle")
		.style("font-size", radius/15)
	// Join new data

	const path = svg.selectAll("path")
		.data(pie(data))

	// Enter new arcs
	// path.enter().append("path")
	// 	.append('g')
	// 	.attr('class', 'arc')
	// 	.attr("class", "loader_chart_sector")
	// 	.attr("fill", (d, i) =>  COLOR[i])
	// 	.attr("d", arc)
	// 	.attr("stroke", "white")
	// 	.attr("stroke-width", "2px")
	// 	.append('text')
	// 	.text(d => d.data.name)
	// 	.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")";  })
	// 	.style("text-anchor", "middle")
	// 	.style("font-size", 17)



}

}