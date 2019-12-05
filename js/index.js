const COLOR = ["red","#00D8D5","green","yellow","blue","#D83C40","#FF03D1","#fc8d62","#8da0cb","#e78ac3",
	"#00d8d5","#ffd92f"]


var url = window.location.href;
// 返回当前页面的路径和文件名，如：/testdemo/test.html
var pathname = window.location.pathname;
// 返回 web 主机的端口，如：8080
var port = window.location.port;
// 返回所使用的 web 协议，如：http:
var protocol = window.location.protocol;
console.log("url", url);
console.log("pathname", pathname);
console.log("port", port);
console.log("protocol", protocol);


d3.text('../data/comp/top10.csv').then(response => {
	const parsed = d3.csvParseRows(response),
		dataTop = parsed.slice(1).map( (current) => {
			return {
				name: current[0],
				size: +current[1],
			}
		}, {})

	const parent = document.querySelector('#root')

	createLoaderTopCompanies({
		parentNode: parent,
		data: dataTop,
	})
	setTimeout(hideLoaderShowMap, 2500)

	createMapWithHead({
		parentNode: parent,
	})
})


function hideLoaderShowMap() {
	const loader = document.querySelector('.top_loader_container')
	if (loader) {
		loader.style = "display: none"
	}

	const mapCont = document.querySelector('.map_container')
	if (mapCont) {
		mapCont.classList.remove('hide')
	}
}
const path = d3.geoPath()
let width = 960*2;
let height = 600*2;
var projection = d3.geoAlbersUsa()
		.translate([width/2, height/2])
		.scale([width*1.36])

function createMapWithHead({
	parentNode,
}) {
	const svg = d3.select(parentNode)
		.append('div')
		.attr('id', 'info')





	d3.json("../data/comp/us-10m.v1.json").then(function(us) {
		const mapContainer = d3.select(parentNode)
			.append('div')
			.attr("class", 'map_container hide')

		mapContainer.append('div')
			.attr('id', 'info')

		const svg = mapContainer.append("svg")
			.attr("class", 'map')
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 " + width + " " + height)

		svg.append("g")
			.attr("class", "states")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.states).features)
			.enter().append("path")
			.attr("d", path)

		svg.append("path")
			.attr("class", "state-borders")
			.attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })))

		createStatesNames({
			svg,
		})

		createCity({
			svg,
		})

	})
}

function createStatesNames({
	svg,
}) {


	d3.text('../data/comp/coordinates.csv').then(response => {
		const data = d3.csvParse(response)

		svg.selectAll('.stateName')
			.data(data)
			.enter()
			.append("text")
			.attr("dx", ({longitude, latitude}) => {
				const intLon = +longitude,
					intLat = +latitude,
					projectionRes = projection([intLon, intLat]),
					x = projectionRes ? projectionRes[0] : 0

				return Math.round(x-15)
			})
			.attr("dy", ({latitude, longitude}) => {
				const projectionRes = projection([+longitude, +latitude]),
					y = projectionRes ? projectionRes[1] : 0

				return Math.round(y+5)
			})
			.text(d => d.state )
			.style("font-size", '12px')
			.style("opacity", 0.85)

	})
}

function createCity({
	svg,
}) {

	// var projection = d3.geoAlbersUsa()
	// 	.translate([960/2, 600/2])
	// 	.scale([1300])

	d3.text('../data/comp/comp50.csv').then(response => {
		const data = d3.csvParse(response)

		svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx", ({lon, lat}) => {
				const intLon = +lon,
					intLat = + lat,
					projectionRes = projection([intLon, intLat]),
					cx = projectionRes ? projectionRes[0] : 0

				return cx
			})
			.attr("cy", ({lon, lat}) => {
				const projectionRes = projection([+lon, +lat]),
					cy = projectionRes ? projectionRes[1] : 0

				return cy
			})
			.attr("r", function(d) {
				return 15;
			})
			.style("fill", "rgb(217,91,67)")
			.style("opacity", 0.85)

			.on("click", function(d) {
				const infoNode = document.querySelector('#info')
				infoNode.textContent = d.Company
			})

			.on("mouseout", function(d) {

			});
	})
}

function createLoaderTopCompanies({
	parentNode,
	data,
	size = 400,
}) {

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
		.attr('class', (d, i) => `arc animation-delay-${i}`)

	pieChart.append('path')
		// .attr("fill", (d, i) =>  COLOR[i])
		// .attr("class", "")
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
}
