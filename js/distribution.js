

class Distribution{
    /**
   * Constructor for the Distribution
   *
   * @param
   */
    constructor (companyInfo){
        this.companyInfo = companyInfo;

        // Initializes the svg elements required for this chart
        this.distrDiv = d3.select(".general-profit-section")


    }


    /*
    * create Distribution chart
    * @param
    *
    * */
    update(){
        this.distPlot(1);
        this.distPlot(2);



    }

    distPlot(attr = 1) {
        let distr = this;
        console.log("distr", distr);
        //range function
        let range = (start, end, step) => {
            let size = Math.ceil((end - start) / step);
            return new Array(size).fill(start).map((ele, i) => ele + i * step)
        };

        let bar1 = this.distrDiv.select(`#attr${attr}`)
            .select(".distrBar");
        let attributes = ["Profits(B)", "Revenues(B)", "Employee_Number", "Assets(B)"];


        let attr1Div = this.distrDiv.select(`#attr${attr}`);
        console.log("attr1Div", attr1Div);
        attr1Div.selectAll('.dropdown-btn').remove();

        attr1Div.select(".dropdownDistr")
            .insert("select", "svg")
            .attr("id", `opts${attr}`)
            .attr("class", "dropdown-btn")
            .selectAll("option")
            .data(attributes)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d)
        ;
        // change after rendering;
        d3.select(`#opts${attr}`).on("change", dropdownChange);

        function dropdownChange() {
            console.log("dropdownChange", this);
            var selectedAttr = d3.select(this).property('value');
            // console.log(selectedAttr);
            updateDistrPlot(selectedAttr);
            distr.updateDistrBar(attr);
        };

        let compInfo = this.companyInfo;

        function updateDistrPlot(selectedAttr) {

            clearBars();

            let margin = {top: 30, bottom: 30, left: 30, right: 30};
            let svgBounds = bar1.node().getBoundingClientRect();
            let svgWidth = svgBounds.width;
            let svgHeight = svgBounds.height;
            let barHist1 = bar1.append("svg")
                .attr("id", `barHist${attr}`)
                .attr("height", svgHeight)
                .attr("width", svgWidth)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
            ;


            //clean data
            compInfo.forEach(d => d[selectedAttr] = d[selectedAttr].replace(',', '').replace('$', ''));

            // X axis: scale and draw:
            let min_val = d3.min(compInfo, d => Number(d[selectedAttr]));
            let max_val = d3.max(compInfo, d => Number(d[selectedAttr]));
            let xScale = d3.scaleLinear()
                .domain([min_val, max_val])
                .range([0, svgWidth - margin.right - margin.left])
            ;
            console.log("compinfo", compInfo);
            console.log("min max", [min_val, max_val]);


            // set the parameters for the histogram
            let histogram = d3.histogram()
                .value(function (d) {
                    return d[selectedAttr];
                })   // I need to give the vector of value
                .domain(xScale.domain())  // then the domain of the graphic
                .thresholds(xScale.ticks(10)); // then the numbers of bins

            let bins = histogram(compInfo);

            //get the min and max value of the interval
            let interval = bins[1].x1 - bins[1].x0;
            let min_interval = bins[1].x0 - interval;
            bins[0].x0 = min_interval;
            let max_interval = bins[bins.length - 1].x0 + interval;
            bins[bins.length - 1].x1 = max_interval
            xScale.domain([min_interval, max_interval]);

            let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.0s'));
            barHist1.append("g")
                .attr("transform", `translate(${0}, ${svgHeight - margin.bottom - margin.top})`)
                .call(xAxis);

            // Y axis: scale and draw:
            var yScale = d3.scaleLinear()
                .range([svgHeight - margin.top - margin.bottom, 0])
                .domain([0, d3.max(bins, function (d) {
                    return d.length;
                })]);   // d3.hist has to be called before the Y axis obviously
            let yAxis = d3.axisLeft(yScale)
                .ticks(5);

            barHist1.append("g")
                .attr("transform", `translate(${0}, ${0}) scale(1, 1)`)
                .call(yAxis);

            let yScale1 = d3.scaleLinear()
                .range([svgHeight - margin.top - margin.bottom, 0])
                .domain([d3.max(bins, function (d) {
                    return d.length;
                }), 0]);

            console.log("Bins", bins);
            // // append the bar rectangles to the svg element
            barHist1.append('g')
                .attr('class', 'bar-group')
                .selectAll("rect")
                .data(bins)
                .enter()
                .append("g")
                .attr("class", "dist-bars")
                .attr('id', d => {
                    // console.log('bins d', d);
                    // console.log('bins d', d[0]);
                    let ranks = '';
                    d.forEach(ele => ranks += 'rank' + ele.Rank + '-');
                    return ranks
                })
                .attr("x", 1)
                .attr("transform", d => `translate(${xScale(d.x0)}, ${svgHeight - margin.top - margin.bottom}) scale(1, -1)`)
                .append('rect')
                .attr("width", function (d) {
                    return xScale(d.x1) - xScale(d.x0) - 3;
                })
                .style("fill", "steelblue")
                .transition()
                .delay(100)
                .duration(1000)
                .attr("height", function (d) {
                    return (yScale1(d.length));
                })


            // console.log("BIns", bins);


            // Brush and Selection
            let brush = d3.brushX().extent([[0, 0], [svgWidth - margin.right - margin.left, svgHeight]]).on("end", brushed);
            barHist1.append("g").attr("class", `brush${attr}`).call(brush);
            console.log("brush success");

            let scaleBrush = d3.scaleLinear()
                .domain([0, svgWidth - margin.right - margin.left])
                .range([min_val, max_val])
            ;

            //
            function brushed(d) {
                console.log("BIns", bins);
                console.log("BIns x0", bins[0].x0);
                // console.log(d)
                let selected = d3.event.selection;
                console.log("Brush", selected);

                console.log("min max", [scaleBrush(selected[0]), scaleBrush(selected[1])])
                let s0 = scaleBrush(selected[0]);
                let s1 = scaleBrush(selected[1]);

                let selBins = [];
                let bars = d3.selectAll(".dist-bars");
                let x = min_interval;
                for (let i = 0; i < bins.length; i++) {
                    if (bins[i].x0 > s0 && bins[i].x0 < s1) {
                        selBins.push(bins[i]);
                        console.log(i, bins[i])
                    } else if (bins[i].x1 > s0 && bins[i].x1 < s1) {
                        selBins.push(bins[i]);
                        console.log(i, bins[i])
                    }

                }
                let compList = []
                for (let bin of selBins) {
                    for (let cmp of bin) {
                        compList.push(cmp.Rank)
                    }
                }
                console.log("Companies", compList)

            }

        }
    updateDistrPlot("Profits(B)");

        function clearBars() {
            d3.selectAll(`#barHist${attr}`).remove();
        }


    }

    updateDistrBar(attr=1){
        // get company
        let format = d3.format('.0s');
        let compId = JSON.parse(d3.select('.dd-button').attr('value') );
		console.log("updateDistrBar compId", compId);
		// console.log("select rank", `rect[class*=rank${compId.Rank}]`);

        addCompbarHist(attr, compId.Rank);

        function addCompbarHist(attr=1, rankId = 1, selectedAttr = 'Profits(B)') {
            let barHist = d3.select(`#attr${attr}`);
            console.log('barHist', barHist);

            // let barHistValue = barHist.select('.dropdown-btn'); // get barHist select value
            // console.log('barHistValue', barHistValue.node().value);
            // console.log('barHistValue', barHistValue.property("value")); valid


            let bars = barHist.select(`#barHist${attr}`).selectAll('.bar-group > g');
            let selected = bars.filter(function (d) {
                    // console.log('filter d', d);
                    // console.log("this", this.id);
                    return this.id.includes('rank' + rankId + '-')

            });
             console.log('selected bar', selected);
             bars.selectAll('rect').style('fill', 'steelblue');
             selected.select('rect').style('fill', 'red');

        }


    }


}





