class TermTopicLinkChart {
    /**
     * Constructor for TermTopicLinkChart
     *
     * @param
     */
    constructor(proTopicTerm, conTopicTerm) {
        this.proTopicTerm = proTopicTerm;
        this.conTopicTerm = conTopicTerm;
        let divlink = d3.select('#term-topic-link');
        let divbound = divlink.node().getBoundingClientRect();
        this.margin = {
            "top": 100,
            "left": 60,
        };
        this.boundWidth = divbound.width //- 2*this.margin.left;
        this.boundHeight = divbound.height //- 2* this.margin.top;


        this.svg = divlink.append("svg")
            .attr("width", divbound.width)
            .attr("height", divbound.height )
        ;
        // public variables
        this.termDict = []; //an array of objects
        this.proTopicDict = [];
        this.conTopicDict = [];

    };

    update( ){
        const LAMBDA = 1;
        const TOPNUM = 10;
        let proColor = "#1f77b4";
        let conColor = "#d62728";
        let termColor = 'purple';
        let elementRadius = 5;
        let radius = Math.min(this.boundWidth,this.boundHeight)/2- this.margin.top ;//this.boundWidth - 2*this.margin.top;
        let barWidth = 200;
        let barHeight = 10;
        let barMargin = {
            top: 10,
            left: 10,
        };
        let opacityLow = 0.4;
        let opacityHigh = 1;

        let totalDict = {};



        /********term list ******/
        //
        function fancysort(key_name, decreasing) {
            decreasing = (typeof decreasing === "undefined") ? 1 : decreasing;
            return function(a, b) {
                if (a[key_name] < b[key_name])
                    return 1 * decreasing;
                if (a[key_name] > b[key_name])
                    return -1 * decreasing;
                return 0;
            };
        };
        // get top N Term topic dict
        function getTopicDict(data, topicType){
            let topicDict = {};
            data.forEach( d => {
                d.topicId = topicType + 'Topic' + d.Topic;
                d.termId = 'Term-' + d.Term;
                if(d.topicId in topicDict) {
                    d.id = d.topicId + '-Term' + d.Term;
                    d.topic_type = topicType;
                    topicDict[d.topicId].push(d);
                } else {
                    topicDict[d.topicId] = [d];
                };
            });
            return topicDict
        }

        function getTopTerms(data, topNum,) {
            // compute relevance and choose top n terms.
            let topTermData = [];
            for(let key in data){
                let topicValueList = data[key];
                topicValueList.forEach( d=> {
                    d.relevance = LAMBDA * d.Beta + (1 - LAMBDA) * d.Beta/d.Term_Prob;
                });
                topicValueList.sort(fancysort("relevance"));
                // truncate top n terms
                topTermData = topTermData.concat(topicValueList.slice(0, topNum) ) ;
            };
            return topTermData
        }



        function handleMouseover(d){
            let children = totalDict[d];
            children.forEach( ele => {
                //console.log('ele', ele);
                let selected  = d3.selectAll(`path.${ele.id}`);
                selected.style('opacity', opacityHigh);
                selected.style('stroke-width', 3);
                selected.raise();

                let selectedBar = d3.selectAll(`g.${ele.id} > rect`);
                selectedBar.attr('class',"link-bar-highlighted");
                selectedBar.style('opacity', opacityHigh);

                let selectedTopic = d3.selectAll(`#${ele.topicId}`);
                selectedTopic.selectAll('circle').style('opacity',opacityHigh)
                selectedTopic.selectAll('text').attr('transform', 'scale(1.5)');
                selectedTopic.raise();

                let selectedTerm = d3.selectAll(`#${ele.termId}`);
                //selectedTerm.selectAll('circle').attr('opacity',opacityHigh);
                selectedTerm.selectAll('text').attr('font-size',20);
                selectedTerm.selectAll('text').each( function(d){
                    let box = this.getBBox();
                    let padding = 2;
                    selectedTerm.select('rect')
                        .attr('height', box.height + 2*padding)
                        .attr("width", box.width + 2*padding)
                        .attr('x',box.x -padding)
                        .attr('y',box.y - padding)
                    ;
                    // console.log("box",box);
                    // console.log("this", selectedTerm.select(`rect`));
                    // console.log(selectedTerm);
                })


                // console.log('selected', selectedBar);
                // console.log('selectedterm', selectedTerm);
                // console.log('selectedtopic', selectedTopic);
            })


        }

        function handleMouseout(d){
            let children = totalDict[d];
            children.forEach( ele => {
                //console.log('ele', ele);
                let selected = d3.selectAll(`path.${ele.id}`);
                selected.style('opacity', opacityLow);
                selected.style('stroke-width', 1);

                let selectedBar = d3.selectAll(`g.${ele.id} > rect`);
                selectedBar.style('opacity', opacityLow);
                // selectedBar.style('stroke-width', 1);
                selectedBar.attr('class',"link-bar");

                let selectedTopic = d3.selectAll(`#${ele.topicId}`);
                selectedTopic.selectAll('circle').style('opacity', opacityLow);
                selectedTopic.selectAll('text').attr('transform', 'scale(1)');

                let selectedTerm = d3.selectAll(`#${ele.termId}`);
                selectedTerm.selectAll('text').attr('font-size','10')
                selectedTerm.selectAll('rect').attr('height',0)
            })

        }

        /*** get all the dict ****/
        let proTotalTopicDict = getTopicDict(this.proTopicTerm, 'Pro');
        let conTotalTopicDict = getTopicDict(this.conTopicTerm, 'Con');

        let proTopTerms = getTopTerms(proTotalTopicDict, TOPNUM);
        let conTopTerms = getTopTerms(conTotalTopicDict, TOPNUM);
        let topicTerms = proTopTerms.concat(conTopTerms);

        console.log("proTopTerms", proTopTerms);


        proTopTerms.forEach( d => {
            if(d.topicId in this.proTopicDict){
                this.proTopicDict[d.topicId].push(d)
            } else {
                this.proTopicDict[d.topicId] = [d]
            }
        });

        conTopTerms.forEach( d => {
            if(d.topicId in this.conTopicDict){
                this.conTopicDict[d.topicId].push(d)
            } else {
                this.conTopicDict[d.topicId] = [d]
            }
        });

        let termDict = {};
        topicTerms.forEach( d => {
            if(d.termId in termDict){
                termDict[d.termId].push(d)
            } else {
                termDict[d.termId] = [d]
            }
        });
        this.termDict = termDict;

        totalDict = {...this.proTopicDict,...this.conTopicDict, ...this.termDict};

        console.log("this protopicdict", this.proTopicDict);
         console.log("this conTopicDict", this.conTopicDict);
         console.log("this termDict", this.termDict);


        console.log("total", totalDict);



        /***** create topic simi circle side *****/


        // scale
        // counterclockwise rotation
        let proScale = d3.scaleLinear()
            .range([-0.5*Math.PI, -0.99*Math.PI])
        ;
        let conScale = d3.scaleLinear()
            .range([-1.01*Math.PI, -1.5*Math.PI])
        ;
        let termScale = d3.scaleLinear()
            .range([-0.5*Math.PI, 0.5*Math.PI])
        ;

        let xbarScale = d3.scaleLinear()
            .range([0,barWidth]);

        let ybarScale = d3.scaleBand()
            .range([0, this.boundHeight - barMargin.top])
            .padding(0.25)
        ;


        // define circle center
        let linkChart = this.svg.append('g')
            // .attr('translate',`${this.margin.left}, ${this.margin.top}`)
        ;
        console.log('linkchart', linkChart);

        let proTopicList = Object.keys(this.proTopicDict);
        proScale.domain([0, proTopicList.length - 1])
        let proTopicSide = linkChart.append('g')
                // .attr('transform', `translate(${this.boundWidth}, ${this.boundHeight/2})`)
                .selectAll('.pro-topic-side')
                .data(proTopicList)
                .enter()
                .append('g')
                .attr('id',d => d)
                .attr('class','pro-topic-side')
                // .each(d => {d.children = this.proTopicDict[d]} )
                .attr('transform', (d,i) => {
                    let angle = proScale(i);
                    let x = radius * Math.cos(angle) + this.boundWidth/2 - barWidth;
                    let y = radius * Math.sin(angle) + this.boundHeight/2;
                    // console.log('angle',angle);
                    // console.log('d', d, i);

                    return `translate(${x}, ${y})`
                })
                .on('mouseover', handleMouseover)
                .on('mouseout',handleMouseout)
            ;
        // console.log('topicSide', topicSide);

        proTopicSide.append('circle')
            // .attr('id', d =>`${d}-circle`)
            .attr('r', elementRadius)
            .style('fill', proColor )
            .style('opacity', opacityLow)


        ;

        proTopicSide.append('text')
            .text(d => d)
            .attr('dx', '-0.5em')
            .attr('fill', proColor)
            // .attr('font-size', 20)
            .attr('text-anchor', 'end')

        ;

        let conTopicList = Object.keys(this.conTopicDict);
        conScale.domain([0,conTopicList.length - 1]);
        let conTopicSide = linkChart.append('g')
                .selectAll('.con-topic-side')
                .data(conTopicList)
                .enter()
                .append('g')
                .attr('id', d => d)
                .attr('class','con-topic-side')
                .attr('transform', (d,i) => {
                    let angle = conScale(i);
                    let x = radius * Math.cos(angle) + this.boundWidth/2 - barWidth; //circle center (this.boundWidth/2, this.boundHeight/2)
                    let y = radius * Math.sin(angle) + this.boundHeight/2;

                    return `translate(${x}, ${y}) ` //rotate(${angle*180/Math.PI + 180})
                })
                .on('mouseover', handleMouseover)
                .on('mouseout',handleMouseout)
            ;

        conTopicSide.append('circle')
            // .attr('id', d =>`${d}-circle`)
            .attr('r', elementRadius)
            .style('fill', conColor )
            .style('opacity', opacityLow)

        ;

        conTopicSide.append('text')
            .text(d => d)
            .attr('dx', '-0.5em')
            .attr('fill', conColor)
            .attr('text-anchor', 'end')
        ;

        /***** create term side *****/
        // radius = Math.min(this.boundWidth,this.boundHeight)/2 - this.margin.left;
        let termList = Object.keys(termDict);
        termList.sort();
        termScale.domain([0, termList.length]);
        let TermSide = linkChart.selectAll('.term-side')
            .data(termList)
            .enter()
            .append('g')
            .attr('id', d =>d)
            .attr('class','term-side')
            .attr('transform', (d,i) => {
                let angle = termScale(i);
                let x = radius * Math.cos(angle) + this.boundWidth/2 + barWidth;
                let y = radius * Math.sin(angle) + this.boundHeight/2;
                return `translate(${x}, ${y}) rotate(${angle*180/Math.PI})`
            })
            .on('mouseover', handleMouseover)
            .on('mouseout', handleMouseout)
        ;

        TermSide.append('circle')
            .attr('r', elementRadius)
            .style('fill', termColor )
            .style('opacity', opacityLow)

        ;
        //background color and shape
        TermSide.append('rect')
            .attr('id',d => d)
            .attr('x',30)
            .attr('y',10)
            .attr('rx', 6)
            .attr('ry',6)
            .style('fill','#e0cae3')
        ;

        TermSide.append('text')
            .attr('id',d => d)
            .text(d => d.split('-')[1])
            .attr('x', 30)
            .attr('y',10)
            .attr('fill', termColor)
            .attr('font-size', 10)

        ;

        /*** create bar chart in the middle ***/

        topicTerms.sort((a,d) => (a.Term > d.Term ? 1:-1) );

        ybarScale.domain([ ...Array(topicTerms.length).keys()]);
        xbarScale.domain(d3.extent(topicTerms, function(d){ return +d.Term_Freq } ));

        let barChart = this.svg.append('g')
            .attr('transform',`translate(${(this.boundWidth- barWidth)/2}, ${barMargin.top})`)
        ;
        let bars = barChart.selectAll('rect')
            .data(topicTerms)
            .enter()
            .append('g')
            .attr('class', d => d.id)
            // .attr('class','term-topic-bar')
            // .on('mouseover', handleMouseover)
            // .on('mouseout', handleMouseout)
            ;

        // bar chart as background
        bars.append('rect')
            .attr('height', ybarScale.bandwidth())
            .attr('width', barWidth)
            .attr('x', 0)
            .attr('y', (d,i) => ybarScale(i))
            .style('fill', '#7e7e7e')
            .style('opacity', opacityLow)
        ;

        // bar chart that shows term frequency

        bars.append('rect')
            .attr('class','term-freq-bar')
            .attr('height', ybarScale.bandwidth())
            .attr('width', d => xbarScale(+d.Term_Freq))
            .attr('x', 0)
            .attr('y', (d,i) => ybarScale(i))
            .style('fill', '#e66200')
            .style('opacity', opacityLow)
        ;

        /****** add links to topics and terms ****/

        // curve approach 1: this function also create curve, but need require more than two points and not so good here.
        // let lineGenerator = d3.line().curve(d3.curveCardinal.tension(1));
        // console.log("linegenerator", lineGenerator([[100,100],[200,200],[1000,1000]]));

        // curve approach 2: linkHorizontal and vertical for hierarchical node and link
        // , the x and y generated by d3 tree are default vertical , so swap x and y. In this case, no need to do that.
        let link = d3.linkHorizontal()
            .x(function(p) { return p.x; })
            .y(function(p) { return p.y; });

        // curve approach 3: `M ${x1},${y1} C ${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2} `
        //  + `M${x3},${y3} C ${x4},${(y3+y4)/2} ${x4},${(y3+y4)/2} ${x4},${y4}`

        // generate the data for d3.linkHorizontal function
        let nodes = [];
        topicTerms.forEach( (d,i) => {
            // console.log("topic term d", d);
            let x1 = (this.boundWidth- barWidth)/2;
            let y1 = barMargin.top + ybarScale(i) + ybarScale.bandwidth()/2;  //start point from left end of bar
            let angle = d.topic_type == 'Pro'? proScale(+d.Topic-1): conScale(+d.Topic-1);
            let x2 = radius * Math.cos(angle) + this.boundWidth/2 - barWidth;
            let y2 = radius * Math.sin(angle) + this.boundHeight/2;

            let x3 = x1 + barWidth;
            let y3 = y1;

            let angle4 = termScale(termList.indexOf(d.termId));
            let x4 = radius * Math.cos(angle4) + this.boundWidth/2 + barWidth;
            let y4 = radius * Math.sin(angle4) + this.boundHeight/2;
            nodes.push({
                source: {x:x1, y:y1,link_type: d.topic_type, Term: d.Term, Topic: d.Topic, Term_Freq: d.Term_Freq, id:d.id },
                target: {x: x2, y: y2,}
            });
            nodes.push({
                source: {x:x3, y:y3,link_type: "term", Term: d.Term, Topic: d.Topic, Term_Freq: d.Term_Freq, id: d.id },
                target: {x: x4, y: y4,}
            });


        });
        console.log("nodes", nodes);

        let links = this.svg.append('g')
            .selectAll('path')
            .data(nodes)
            .enter()
        ;

        links.append('path')
            .attr('class', d => {
                // console.log('path',d);
                return  d.source.id //d.source.link_type + d.source.Topic + d.source.Term
            })
            .attr('d',d => link(d))
            .attr('fill','none')
            .attr('stroke', d => {
                return d.source.link_type == 'term'? termColor: d.source.link_type == 'Pro'? proColor: conColor
            })
            .attr('stroke-width',1)
            .attr('opacity', opacityLow)
        ;




    }
}
