class CompanyMapSelection{
    constructor(companyMap, companyProfile, distribution, compData){
        this.companyMap = companyMap;
        this.companyProfile = companyProfile;
        this.distribution = distribution;
        this.compData = compData;
        this.compmapBtn = d3.select('#compmap-btn');


    }
    setDefault(){
        //set default value
         let default_value = this.compData[0];
            this.compmapBtn.select('.dd-button')
            .attr('value', JSON.stringify(default_value) )
            .text(default_value.Company_Name)
            .on('click', function(){
                d3.select('#compmap-btn').select('.dd-menu').attr('display','block')
            })
        ;
        console.log("default", default_value);

    }
     update(){
        let companyMapSelection = this;
        let compmapBtn = this.compmapBtn;



        function sortByAttribute(data, attribute){
            data.sort( function (a,b) {
                a = a[attribute].toLowerCase();
                b = b[attribute].toLowerCase();
                if (+a && +b ){
                    return +a > +b
                } else if (a > b){
                    return 1
                }
                return -1
            })
        }


        d3.selectAll('.dd-menu-tabs > input')
            .on('click', function () {
                console.log("click", compmapBtn.select('.dd-menu-tabs'))
                d3.select('.dd-menu-tabs').selectAll('input').attr('class','dd-menu-tab');
                d3.select(this).attr('class', 'dd-menu-tab-click');
                console.log("dd-menu-tab this", this.id);
                // remove ul
                compmapBtn.selectAll('ul').remove();
                // add new ul
                sortByAttribute(companyMapSelection.compData, this.id);
                companyMapSelection.updateMenu(companyMapSelection.compData);
                // d3.select('.dd-menu').attr('display','block')

            });
        console.log("d3.selectAll('.dd-menu-tabs > input')", d3.selectAll('.dd-menu-tabs > input'));


        // set default tab
         d3.select('#Company_Name').attr('class', 'dd-menu-tab-click');
         sortByAttribute(companyMapSelection.compData, 'Company_Name');
         this.updateMenu(this.compData);

         // update map
         // this.companyMap.updateSelectedComp()




    }
    updateMenu(data){
        let table = d3.select('.dd-menu')
            .append('ul')
            .attr('class', 'dd-menu-ul')
            .selectAll('li')
            .data(data)
            .enter()
         ;
        table.append('li')
            .attr('class', 'dd-menu-li')
            .attr('value', d => d  )
            .text(d => d.Company_Name)
         ;
        d3.selectAll('.dd-menu-li')
            .on('click', d => {
                console.log('selection d', d);
                // update company name in button
                d3.select('.dd-button')
                    .attr('value', JSON.stringify(d))
                    .text(d.Company_Name);

                //update highlight in map
                this.companyMap.updateSelectedComp();

                //update profile
                d3.select('#profile').selectAll('div').remove();
                console.log("d.rank", d.Rank);
                this.companyProfile.update(d.Rank);

                //update distribution
                // this.distribution.update();
                this.distribution.updateDistrBar(1);
                this.distribution.updateDistrBar(2);

                // close table
                d3.select('.dd-menu').attr('display','none')


            })
    }


}