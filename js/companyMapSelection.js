class CompanyMapSelection{
    constructor(companyMap, companyProfile, distribution, compData){
        this.companyMap = companyMap;
        this.companyProfile = companyProfile;
        this.distribution = companyProfile;
        this.compData = compData
        this.compmapBtn = d3.select('.dd-menu');

    }
     update(){
        //set default value
         let default_value = this.compData[0];
        d3.select('.dd-button').text(default_value.Company_Name);
        console.log("default", default_value);

        let btn = d3.select('.dd-button').on('click', d => {
            console.log('btn',d);
        });

        let table = this.compmapBtn.append('ul')
            .attr('class', 'dd-menu-ul')
            .selectAll('li')
            .data(this.compData)
            .enter()
         ;
        table.append('li')
            .attr('class', 'dd-menu-li')
            .attr('value', d => d  )
            .text(d => d.Company_Name)
         ;
        this.compmapBtn.selectAll('.dd-menu-li')
            .on('click', d => {
                console.log('selection d', d);
                // update company name in button
                d3.select('.dd-button').attr('value', d.Rank).text(d.Company_Name);

                //update highlight in map
                this.companyMap.updateSelectedComp();

                //update profile
                d3.select('#profile').selectAll('div').remove();
                this.companyProfile.update(d.Rank)

                //update distribution

                // close table
                d3.select('.dd-menu').attr('display','none')


            })


    }
}