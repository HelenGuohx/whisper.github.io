

class TopicModel{
    /**
   * Constructor for the TopicModel
   *
   * @param
   */
    constructor (proTopCenter, conTopCenter, proTopicTerm, conTopicTerm){
        this.proTopCenter = proTopCenter;
        this.conTopCenter = conTopCenter;
        this.proTopicTerm = proTopicTerm;
        this.conTopicTerm = conTopicTerm;

        // Initializes the svg elements required for this chart
       let divModel = d3.select("#pro-model")

        //fetch the svg bounds
        this.svgModelBounds = divModel.node().getBoundingClientRect();
        this.svgModelWidth = this.svgModelBounds.width;
        this.svgModelHeight = this.svgModelBounds.height;

        this.color1 = "#1f77b4",// baseline color for default topic circles and overall term frequencies
        this.color2 = "#d62728";

        // Set global margins used for everything
        this.margin = {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100
        },
        //this.barwidth = 150,
        //this.barheight = this.svgWidth/2-this.barwidth,
        this.mdswidth = this.svgModelWidth,
        this.mdsheight = this.svgModelHeight;


        // bar chart
        let divBar = d3.select("#proBar");

        //fetch the svg bounds
        this.svgBarBounds = divBar.node().getBoundingClientRect();
        this.svgBarWidth = this.svgBarBounds.width;
        this.svgBarHeight = this.svgBarBounds.height;




    };


    /*
    * create TopicModel chart
    * @param
    *
    * */
    update(){

        this.updateModel('pro');
        this.updateModel('con');

    }

    updateModel(modelType){
        let topCenter = this[`${modelType}TopCenter`];

        let mdswidth = this.svgModelWidth;
        let mdsheight = this.svgModelHeight;
        let margin = this.margin;

        let model = d3.select(`#${modelType}-model`)
            .append("svg")
            .attr("height", this.mdsheight)
            .attr("width", this.mdswidth)
        ;

        let modelConfig = {
            "barId": modelType + "Bar", // proBar, conBar
            "title_type":capitalize(modelType), // Pro, Con
            "barColor": modelType == 'pro'?this.color1: this.color2,
        };

        function capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        let maxval = d3.max(topCenter, d=> +d.Topic_Proportion);
        let legendList = [maxval*0.2, maxval*0.5, maxval];
        console.log('legendList', legendList);

        let radius = d3.scaleSqrt()
			.domain([0, maxval*0.2])
			.range([0, 20]);


        // Create scale pro and con model
        this.xproScale = d3.scaleLinear()
            .range([0, this.svgModelWidth - this.margin.left - 50])
            .domain(d3.extent(topCenter, d => Number(d.X)))
        ;
        this.yproScale = d3.scaleLinear()
            .domain(d3.extent(topCenter, d => Number(d.Y)))
            .range([this.svgModelHeight - this.margin.bottom - this.margin.top , 0]) // reverse y
        ;



        //models pro and con
        model.append("text")
            .text("Intertopic Distance Map")
            .attr("x", mdswidth/2)
            .attr("y", margin.top/2)
            .style("font-size", "20px")
            .style("text-anchor", "middle");

        function createPcaAxis(model ) {
            // create group for pca plot
            let pcaAxis1 = model
                .append('g')
                .attr('transform', `translate(${margin.left/2},${mdsheight / 2})`)
            ;
            pcaAxis1.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', mdswidth - margin.left)
                .attr('y2', 0)
                .attr('stroke', 'rgba(191, 191, 191, 0.5)')
                .attr('stroke-width', '1px')

            ;
            pcaAxis1.append('text')
                .text('PCA1')
                .attr('x', mdswidth - margin.left)
                .attr('y', 0)
                .style("text-anchor", "end")
                .attr("stroke", 'rgba(191, 191, 191, 0.3)')
                .style("font-size", "20px")
                .style("fontWeight", 100)
                .attr('dx', '-0.5em')
                .attr('dy', '-0.5em')
                .attr('opacity', 0.4)
            ;
            let pcaAxis2 = model.append('g')
                .attr('transform', `translate(${mdswidth / 2}, ${margin.top})`)
            ;
            pcaAxis2.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', mdsheight)
                .style('stroke', 'rgba(191, 191, 191, 0.5)')
                .style('stroke-width', '1px')
            ;
            pcaAxis2.append('text')
                .text('PCA2')
                .attr('x', 0)
                .attr('y', 0)
                .style("text-anchor", "start")
                .attr("stroke", 'rgba(191, 191, 191, 0.3)')
                .style("font-size", "20px")
                .style("fontWeight", 100)
                .attr('dx', '0.5em')
                .attr('dy', '0.5em')
                .attr('opacity', 0.4)
            ;
        }

        createPcaAxis(model);

        let proPoints = model
            .selectAll("cirlce")
            .data(topCenter)
            .enter()
            .append("g")
            .attr("class", "model-circle")
            .attr("id", d => `${modelType}Topic${d.Topic}`)
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`)
            .on('click', d =>  {
                d3.selectAll(`#${modelType}-model circle`).style('opacity', 0.4);

                let topicValue = d.Topic;
                d3.select(`#${modelType}Topic${topicValue} circle`).style('opacity', 1); // hightlight pro points
                d3.select(`#${modelType}Topic${topicValue}`).raise();

                this.updateBarChart(topicValue, modelType, modelConfig); // show pro bar chart


        })

        ;

        // proportion of area of MDS plot to which the sum of default topic circle areas is set
        //  model part
        // draw circles
        proPoints.append("circle")
            // .attr("class", "model-circle")
            .style("opacity", 0.4)
            .style("fill", modelConfig.barColor)
            .attr("r", d => {
                return radius(+d.Topic_Proportion)//Math.sqrt(d.Topic_Proportion * 50000/Math.PI)
            })
            .attr("cx", d => {
                return this.xproScale(d.X)
            })
            .attr("cy", d => this.yproScale(d.Y))
            .attr("stroke", "black")
            // .attr("id", d => `${modelType}Topic${d.Topic}`)

        ;
        proPoints.append("text")
            .attr("class", "model-text")
            .attr("x", d => this.xproScale(d.X))
            .attr("y", d => this.yproScale(d.Y))
            .attr("stroke", "black")
            .attr("opacity", 1)
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("fontWeight", 100)
            .text(d=>d.Topic);

        ;

        // add circle legend
        let legendBox = model.append("g")
            .attr("transform", `translate(${this.mdswidth - this.margin.right}, ${this.mdsheight - 25})`);


        const legend = legendBox
            .style('opacity', 1)
			.attr("fill", "grey")
			.attr("text-anchor", "middle")
			.style("font", "10px sans-serif")
			.selectAll("g")
			.data(legendList)
			.join("g");

		legend.append("circle")
            .style('opacity', 1)
			.attr("fill", "none")
			.attr("stroke", "grey")
			.attr("cy", d => -radius(d))
			.attr("r", radius);

		legend.append("text")
			.attr("y", d => -2 * radius(d))
			.attr("dy", "1.3em")
			.text(d3.format(".2%"));

		legendBox.append('text')
            .text('Circle size: topic proportion')
            .attr('dy', '1em')
            .style('font-size', '12px')
        ;


    };


    updateBarChart (selectedTopic,modelType,modelConfig ) {

        let lambda = 1;
        let topNum = 10;
        let selectedTopicTerm = this[`${modelType}TopicTerm`];
        let margin = {
            'top':80,
            'bottom': 20,
            'right': 20,
            'left': 80,
        }

        let barheight = this.svgBarHeight - margin.right;
        let barwidth = this.svgBarWidth - margin.left;

        // empty svg
        d3.select(`#${modelType}Bar svg`).remove();
        // create new svg
        let barSvg = d3.select(`#${modelType}Bar`)
            .append('svg')
            .attr('height', this.svgBarHeight)
            .attr('width', this.svgBarWidth)
        ;

        // grab the bar-chart data for this topic only:
        let dat2 = selectedTopicTerm.filter(function(d) {
            return d.Topic == selectedTopic
        });

        // define relevance:
        for (let i = 0; i < dat2.length; i++) {
            dat2[i].relevance = lambda * dat2[i].Beta + (1 - lambda) * dat2[i].Beta/dat2[i].Term_Prob;
        }

        // sort by relevance:
        dat2.sort(fancysort("relevance"));

        // truncate to the top R tokens:
        let dat3 = dat2.slice(0, topNum);


         let y = d3.scaleBand()
            .domain(dat3.map(function(d) {
                return d.Term;
            }))
            .range([0, barheight - margin.bottom - margin.top])
            .padding(0.15)
         ;

        let x = d3.scaleLinear()
            .domain([0, d3.max(dat3, function(d) {
                return +d.Term_Freq;
            })])
            .range([0, barwidth - margin.right - margin.left])
            //.nice();
        ;


        // add title for bar chart
        barSvg.append("text")
            .attr("x", barwidth/2)
            .attr("y", margin.top/2)
            .attr("class", "bubble-tool") //  set class so we can remove it when highlight_off is called
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text(modelConfig.title_type +": Topic "+ selectedTopic + " Top-" + topNum + " Most Salient Terms");


        // Add bar chart
        let chart = barSvg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .attr("id", "bar-freqs");

        // add coordinate
        let yAxis = d3.axisLeft()
            .scale(y);

        // barchart axis adapted from http://bl.ocks.org/mbostock/1166403
        let xAxis = d3.axisTop()
            .scale(x)
        ;

        chart.append("g")
            .attr("class", "xaxis")
            .call(xAxis);

        chart.append("g")
            .attr("class", "yaxis")
            .call(yAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
        ;

        // bar chart legend:
        // let barguide = {"width": 100, "height": 15};
        // d3.select("#bar-freqs").append("rect")
        //     .attr("x", 0)
        //     .attr("y", mdsheight + 10)
        //     .attr("height", barguide.height)
        //     .attr("width", barguide.width)
        //     .style("fill", color1)
        //     .attr("opacity", 0.4);
        //
        // d3.select("#bar-freqs").append("text")
        //     .attr("x", barguide.width + 5)
        //     .attr("y", mdsheight + 10 + barguide.height/2)
        //     .style("dominant-baseline", "middle")
        //     .text("Overall term frequency");
        //
        // d3.select("#bar-freqs").append("rect")
        //     .attr("x", 0)
        //     .attr("y", mdsheight + 10 + barguide.height + 5)
        //     .attr("height", barguide.height)
        //     .attr("width", barguide.width/2)
        //     .style("fill", color2)
        //     .attr("opacity", 0.8);
        // d3.select("#bar-freqs").append("text")
        //     .attr("x", barguide.width/2 + 5)
        //     .attr("y", mdsheight + 10 + (3/2)*barguide.height + 5)
        //     .style("dominant-baseline", "middle")
        //     .text("Estimated term frequency within the selected topic");

        // Bind  data to  bar chart
        let basebars = chart.selectAll(".bar-totals")
            .data(dat3)
            .enter();

        // Draw the gray background bars defining the overall frequency of each word
        basebars.append("rect")
            .attr("class", "bar-totals")
            .attr("x", 0)
            .attr("y", function(d) {
                return y(d.Term);
            })
            .attr("height", y.bandwidth())
            .style("fill", modelConfig.barColor)
            .attr("opacity", 0.4)
            .transition()
            .delay(100)
            .duration(1000)
            .attr("width", function(d) {
                return x(d.Term_Freq);
            })


        ;

        // // Add word labels to the side of each bar
        // basebars.append("text")
        //     .attr("class", "terms")
        //     .attr("x", )
        //     .attr("y", function(d) {
        //         console.log("basebar d", d)
        //         return y(d.Term) + 12;
        //     })
        //     .attr("cursor", "pointer")
        //     .attr("id", function(d) {
        //         return (termID + d.Term)
        //     })
        //     .style("text-anchor", "end") // right align text - use 'middle' for center alignment
        //     .text(function(d) {
        //         return d.Term;
        //     })
        // ;




        // sort array according to a specified object key name
        // Note that default is decreasing sort, set decreasing = -1 for increasing
        // adpated from http://stackoverflow.com/questions/16648076/sort-array-on-key-value
        function fancysort(key_name, decreasing) {
            decreasing = (typeof decreasing === "undefined") ? 1 : decreasing;
            return function(a, b) {
                if (a[key_name] < b[key_name])
                    return 1 * decreasing;
                if (a[key_name] > b[key_name])
                    return -1 * decreasing;
                return 0;
            };
        }
    };

}

