class HeatMap{
    /**
   * Constructor for the HeatMap
   *
   * @param
   */
    constructor (proTopCenter, conTopCenter, proTopicTerm, conTopicTerm) {
        this.proTopCenter = proTopCenter;
        this.conTopCenter = conTopCenter;
        this.proTopicTerm = proTopicTerm;
        this.conTopicTerm = conTopicTerm;

        // Initializes the height and width
        this.bbox = d3.select(`#pro-heatmap`).node().getBoundingClientRect();
        this.height = 700; //this.bbox.height;
        this.width = this.bbox.width;
        this.margin = {top: 30, right: 30, bottom: 50, left: 30};

        this.proColor = "#1f77b4",// baseline color for default topic circles and overall term frequencies
        this.conColor = "#d62728";

    }

    /*
    * create HeatMap chart
    * @param
    *
    * */
    createDiv(what = "pro") {

        let selectDiv = d3.select(`#${what}-heatmap`)
            .append("div")
            .attr("class", "select-div")
            .attr("height", 10)
            .attr("width", this.width - this.margin.left - this.margin.right);
        ;

        let topicPropDiv = d3.select(`#${what}-heatmap`)
            .append("div")
            .attr("class", "heatmap-div")
            .attr("height", this.height - this.margin.top - this.margin.bottom)
            .attr("width", this.width - this.margin.left - this.margin.right)
        ;
    }

    update(){
        this.createDiv("pro");
        this.createHeatmap("pro", 10, this.proColor);

        this.createDiv("con");
        this.createHeatmap("con", 12, this.conColor);

    }

    createHeatmap(what = "pro", num_topics, topicColor){
        // Dropdown
        // Dropdown menu list
        let topicLabel = []
        // let num_topics = 10;
        for (let i=1; i<= num_topics; i++){
            topicLabel.push(i);
        }

        // Create dropdown
        let selectDiv = d3.select(`#${what}-heatmap`).select(".select-div")
        selectDiv.append("g")
            .attr("transform", `translate(10, 50)`)
            .append("text")
            .text(`${what} Topic `)

        selectDiv
            .append("g")
            .attr("transform", `translate(${50}, ${20})`)
            .insert("select", "svg")
            .attr("id", `opts-${what}`)
            .attr("class", "dropdown-btn")
            .selectAll("option")
            .data(topicLabel)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d)
        ;

        d3.select(`#opts-${what}`).on("change", dropdownChange);



        function dropdownChange() {
            var selectedTopic = d3.select(this).property('value');
            updateHeatmap(selectedTopic, what);
        };




        // Heatmap
        let topicTerm;
        if (what == "pro"){
                topicTerm = this.proTopicTerm
        } else {
                topicTerm = this.conTopicTerm
        }
        console.log(what, topicTerm);

        // Create SVG for heatmap
        let topicPropDiv = d3.select(`#${what}-heatmap`).select(".heatmap-div")

        let canvas = topicPropDiv
            .append("svg")
            .attr("id", `heatmap-${what}`)
            .attr("height", this.height - this.margin.top - this.margin.bottom )
            .attr("width", this.width - this.margin.left - this.margin.right)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        ;


        // Data and Terms for heatmap and yaxis
        let topNum = 10;
        let lambda = 1;
        function getData(selectedTopic=1) {

            let dat2 = topicTerm.filter(function(d) {
                return d.Topic == selectedTopic
            });
            for (let i = 0; i < dat2.length; i++) {
                dat2[i].relevance = lambda * dat2[i].Beta + (1 - lambda) * dat2[i].Beta/dat2[i].Term_Prob;
            }
            // sort by relevance:
            dat2.sort(fancysort("relevance"));

            // truncate to the top R tokens:
            let dat3 = dat2.slice(0, topNum);
            return dat3;
        }

        function getTerms(dat3){
            let terms = []
            for (let d of dat3) {
                terms.push(d.Term)
            }
            return terms;

        }


        // Axes
        // Make x scale
        let xScale = d3.scaleBand()
            .domain(topicLabel)
            .range([0, this.width-this.margin.left-this.margin.right-200])
            .padding(.05)
        ;

        // Make y scale, the domain will be defined on bar update
        let terms = getTerms(getData(1));

        let yScale = d3.scaleBand()
            .domain(terms)
            .range([this.margin.top, this.height-2*this.margin.bottom-100])
            .padding(.05)
        ;

         // Make x-axis and add to canvas
        let xAxis = d3.axisBottom(xScale)
            .tickFormat((d, i) => topicLabel[i])
        ;

        canvas.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(100, ${this.height-2*this.margin.bottom - 150})`)
            .call(xAxis);


        canvas.append("g")
            .attr("id", "x-axis-label")
            .attr("transform", `translate(300, ${this.height-2*this.margin.bottom-100})`)
            .append("text")
            .text("Topics")

        // Make y-axis and add to canvas
        let yAxis = d3.axisLeft(yScale);

        var yAxisHandleForUpdate = canvas.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${100}, ${-50})`)
            .call(yAxis);

        yAxisHandleForUpdate.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value");

        canvas.append("g")
            .attr("id", "y-axis-label")
            .attr("transform", `translate(${0}, ${250})`)
            .append("text")
            .attr("transform", "rotate(-90)")
            .text("Top 10 Relevant Terms")




        function updateHeatmap(selectedTopic, what) {

            let terms = getTerms(getData(selectedTopic));

            yScale.domain(terms);
            yAxisHandleForUpdate.call(yAxis);

            console.log(what, topicTerm);
            let dat = [];
            for (let t of terms) {
                let d2 = topicTerm.filter(function(d) {
                    return d.Term == t;
                });
                dat.push(...d2)
            }
            // console.log("yo", dat);
            let myColor = d3.scaleLinear()
              .range(["#c7caca", topicColor])
              .domain(d3.extent(dat, d => Number(d.Beta)))
            ;


            let heatmap = canvas.append("g")
                    .attr("transform", `translate(${100}, ${-50})`)
                    .selectAll()
                    .data(dat)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) { return xScale(d.Topic) })
                    .attr("y", function(d) { return yScale(d.Term) })
                    .attr("width", xScale.bandwidth() )
                    .attr("height", yScale.bandwidth() )
                    // .style("fill", "black" )
                    .style("fill", function(d) { return myColor(d.Beta)} )
            ;
            // console.log("hey")
            // let betaList = dat.map(d => {
            //     if(d.Beta && +d.Beta ){
            //         return +d.Beta
            //     }
            // });
            // betaList.sort();
            let [minVal, maxVal] = d3.extent(dat, d => Number(d.Beta));
            let diff = maxVal - minVal;
            let legendData = [0, minVal + diff *0.25, minVal + diff *0.5, minVal + diff *0.75, maxVal];
            let legendElementWidth = 50;
            let gridSize = 20;

            //remove legend
            canvas.select('.legend').remove();

            var legend = canvas.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(250,550)`)
                .selectAll("rect")
                .data(legendData)
                .enter()
            ;


          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", 0)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return myColor(d); });

          console.log("legendData", legendData);

          legend.append("text")
            .attr("class", "legend-text")
            .text(d => d3.format('.1s')(d) ) //function(d) { return "≥ " + d3.format('.4e') })
            .attr("x", function(d, i) { return legendElementWidth * i + legendElementWidth/2 ; })
            .attr("y", gridSize)
              .attr('dy', '0.5em')
              .style('text-anchor', 'middle')
          ;




        }



        // Fancy Sort
        function fancysort(key_name, decreasing) {
            decreasing = (typeof decreasing === "undefined") ? 1 : decreasing;
            return function (a, b) {
                if (a[key_name] < b[key_name])
                    return 1 * decreasing;
                if (a[key_name] > b[key_name])
                    return -1 * decreasing;
                return 0;
            }
        }

        // Chose heatmap with topic 1 at first
        updateHeatmap(1, what);


    };




}

