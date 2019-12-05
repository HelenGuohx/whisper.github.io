
class CompanyProfile{
    /**
   * Constructor for the CompanyProfile
   *
   * @param
   */
    constructor (companyProfile, companyHQ){
        this.companyProfile = companyProfile;
        this.companyHQ = companyHQ;

        this.companyRank = 1;
        this.divProfile = d3.select('#profile');
        // let svgModelBounds = this.divProfile.node().getBoundingClientRect();
        // this.svgWidth = svgModelBounds.width;
        // this.svgHeight = ;
        // console.log("svgWidth", this.svgWidth);
        // console.log("svgHeight", this.svgHeight);

    };
    /*
    * create CompanyProfile
    * @param
    *
    * */
    update(compRank){
        this.companyRank = compRank;

        // Division for logo
        let logo = this.divProfile.append('div')
            .attr("id", "logoDiv")
            .append('img')
            .attr('class','profile-img')
            .attr('src',  this.companyRank>1?`assets/${this.companyRank}`.jpg:'#' )
            .attr('alt', 'logo')
            .attr('width', 'auto')
            .attr('height',100)
        ;


        // Division for Header
        let header = this.divProfile.append("div")
            .attr("id", "headerDiv")
            .append("h4")
            .text(this.companyProfile[this.companyRank-1].Company_Name)
            .append("h6")
            .text(`Rank #${this.companyRank}`)
        ;

        // Division for Info
        let infoList = this.divProfile.append("div")
            .attr("id", "infoDiv")
            .append("ul")
            .attr("id", "infoList")
            .attr("class", "list-group")
        ;

        // CEO
        let item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("CEO: ")
        ;
        item.append("span")
            .attr("id", "infoCEO")
            .text(this.companyHQ[this.companyRank-1].CEO)
        ;

        // CEO Title
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("CEO Title: ")
        ;
        item.append("span")
            .attr("id", "infoCEOTitle")
            .text(this.companyHQ[this.companyRank-1].CEO_Title)
        ;

        // HeadQuarter
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Headquarter: ")
        ;
        item.append("span")
            .attr("id", "infoHQ")
            .text(this.companyHQ[this.companyRank-1].HQ_Location)
        ;

        // Sector
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Sector: ")
        ;
        item.append("span")
            .attr("id", "infoSector")
            .text(this.companyProfile[this.companyRank-1].Sector)
        ;

        // Industry
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Industry: ")
        ;
        item.append("span")
            .attr("id", "infoIndustry")
            .text(this.companyProfile[this.companyRank-1].Industry)
        ;

        // Website
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Website: ")
        ;
        item.append("span")
            .attr("id", "infoWebsite")
            .text(this.companyHQ[this.companyRank-1].Fortune_Site)
        ;

        // Profit
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Profit: ")
        ;
        item.append("span")
            .attr("id", "infoProfit")
            .text(this.companyProfile[this.companyRank-1].Profits)
        ;

        // Revenue
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Revenue: ")
        ;
        item.append("span")
            .attr("id", "infoRevenue")
            .text(this.companyProfile[this.companyRank-1]["Revenues(m)"])
        ;

        // Employee
        item = infoList.append("li").attr("class", "list-group-item");
        item.append("span")
            .attr("class", "font-weight-bold")
            .text("Employee: ")
        ;
        item.append("span")
            .attr("id", "infoEmployee")
            .text(this.companyProfile[this.companyRank-1]["Employee_Number"])
        ;


        // Sunburst chart

        function groupBy(list, keyGetter) {
            const map = new Map();
            list.forEach((item) => {
                 const key = keyGetter(item);
                 const collection = map.get(key);
                 if (!collection) {
                     map.set(key, [item]);
                 } else {
                     collection.push(item);
                 }
            });
            return map;
        }
        const groupedSector = groupBy(this.companyProfile, d => d.Sector);
        var flags = [], sectors = [], l = this.companyProfile.length, i;
        for( i=0; i<l; i++) {
            if( flags[this.companyProfile[i].Sector]) continue;
            flags[this.companyProfile[i].Sector] = true;
            sectors.push(this.companyProfile[i].Sector);
        }
        let data = {"name" : "Sector", "children": []}
        for (let s of sectors) {
            let lst = [];
            for (let c of groupedSector.get(s)){
                lst.push({"name": c.Company_Name, "size": parseFloat(c["Revenues(m)"].replace( "$", '').replace(",", ""))})
            }
            data.children.push({"name": s, "children" : lst})
        }
        // console.log(data);
        let sectordiv = this.divProfile.node().getBoundingClientRect();

        let w = sectordiv.width;
        let h = 225;
        let r = Math.min(h, w) / 2;
        var categorical = [
              { "name" : "schemeAccent", "n": 8},
              { "name" : "schemeCategory20b", "n" : 20}
            ]

        // Define color scale
        // let color = d3.scaleOrdinal(d3[categorical[0].name]);
        // console.log("quantize", d3.quantize(d3.interpolateRainbow, data.children.length));
        // let color = d3.scaleOrdinal(d3.quantize(d3.interpolateYlGn, 15));
        // let color = d3.scaleOrdinal(d3.quantize(d3.interpolateSinebow , 15));
        let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 15));



        let sector = this.divProfile.append("div")
            .attr("id", "sectorDiv")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", `translate(${w/2}, ${h/2})`);

        var partition = d3.partition()
            .size([2*Math.PI, r]);

        var root = d3.hierarchy(data)
            .sum(d => d.size);

        partition(root);

        var arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);


        let compProf = this.companyProfile;
        console.log("Root.desendants", root.descendants())
        sector.selectAll("path")
            .data(root.descendants())
            .enter()
            .append("g")
            .style("opacity", 0)
            // .attr("fill-opacity", d => {
            //     let opacity = 0;
            //     if(d.depth == 1) {
            //         if(d.data.name == compProf[this.companyRank-1].Sector) {
            //             opacity = .9
            //         } else {
            //             opacity = .5
            //         }
            //     } else if (d.depth == 2) {
            //         if (d.parent.data.name == compProf[this.companyRank - 1].Sector) {
            //             opacity = .9
            //         } else {
            //             opacity = .2
            //         }
            //     }
            //     return opacity;
            //
            // })

            // .attr("class", d => {
            //     let class_name;
            //     if (d.depth == 1){
            //         if(d.data.name == compProf[this.companyRank-1].Sector || d.parent.data.name == compProf[this.companyRank-1].Sector) {
            //             class_name = `selected ${d.data.name} ${d.parent.data.name}}`
            //         } else {
            //             return `${d.data.name} ${d.parent.data.name}`
            //         }
            //     } else {
            //         return "Root"
            //     }
            // })
            .attr("class", d => {
                let class_name;
                if(d.depth == 1) {
                    if(d.data.name == compProf[this.companyRank-1].Sector) {
                        class_name = `${d.data.name} ${d.parent.data.name} node selected`
                    } else {
                        class_name = `${d.data.name} ${d.parent.data.name} node`
                    }
                } else if (d.depth == 2) {
                    if(d.parent.data.name == compProf[this.companyRank-1].Sector) {
                        class_name = `${d.data.name} ${d.parent.data.name} node selected`
                    } else {
                        class_name = `${d.data.name} ${d.parent.data.name} node`
                    }
                } else {
                    class_name = "root"
                }
                return class_name
            })
            // .classed("selected", d => d.data.name == compProf[this.companyRank-1].Sector ? true : false)
            .append("path")
            .attr("display", d => d.depth ? null : "none")
            .attr("d", arc)
            .style("stroke", "#fff")
            // .style("fill", d => color(d.children ? d: d.parent))
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
            .append("title")
            .text(d=>d.data.name)

        function updateSunBurst(){
            d3.selectAll(".node").style("opacity", 0);
            d3.selectAll(".Sector").style("opacity", .3);
            d3.selectAll(".selected").style("opacity", .9)
        }
        updateSunBurst();

        d3.selectAll(".Sector")
            .on("click", onClick)
            .on("mouseover", onOver)
            .on("mouseout", onOut)

        d3.selectAll(".selected")
            .on("click", onClick)
            .on("mouseover", onOver)
            .on("mouseout", onOut)

        function onClick(){
            let selection = d3.select(this)
            console.log("Selection", selection);
            d3.selectAll(".selected")
                .classed("selected", false)
            ;

            selection.classed("selected", true)
            ;

            let class_name = selection.attr("class").split(" ")[0];
            // console.log("class_name: ", class_name.split(" ")[0]);
            d3.selectAll(`.${class_name}`)
                .classed("selected", true)


            updateSunBurst();


        }

        function onOver(){
            let selection = d3.select(this)
            selection.style("opacity", .9)
        }

        function onOut(){
            let selection = d3.select(this)
            selection.style("opacity", .3)
            updateSunBurst();
        }



        // sector.selectAll(".node")
        //     .append("text")
        //     .attr("transform", d => `translate(${arc.centroid(d)})rotate(${computeTextRotation(d)})`)
        //     .attr("dx", "-20")
        //     .attr("dy", ".1em")
        //     .style("font-size", "8px")
        //     .text(d => d.parent ? d.data.name : "")
        //
        // function computeTextRotation(d) {
        //     var angle = (d.x0 + d.x1) / Math.PI * 90;
        //     return (angle < 90 || angle > 270) ? angle: angle + 180;

        // }






    };


}