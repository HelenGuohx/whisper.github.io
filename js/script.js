



// ****** general info ******

//init for company map
Promise.all([
    d3.csv("data/comp/compinfo50.csv"),
    d3.csv("data/comp/coordinates.csv"),
    // d3.csv("data/fortune50/fortune50_info.csv"),
    // d3.csv("data/fortune50/fortune50_info_px.csv"),
    // d3.csv("data/fortune50/fortune50_hq.csv"),
]).then(function(files){
    // d3.json("data/comp/us-10m.v1.json").then(function(us) {
     d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json").then(function(us){
         let companyMapSelection = new CompanyMapSelection(null, null, null,files[0]);
         // companyMapSelection.setDefault();

        let companyMap = new CompanyMap(files[0], us, files[1]);
        companyMap.update();

        let companyProfile = new CompanyProfile(files[0]); //files[2]
        // companyProfile.update(1);

        let distr = new Distribution(files[0]);
        distr.update();

        companyMapSelection.companyMap = companyMap;
        companyMapSelection.companyProfile = companyProfile;
        companyMapSelection.distribution = distr;
        companyMapSelection.update();



    })
});


// ****** topic model ******
// load the data for topic model


Promise.all([
    d3.csv("data/topicModeling/pro/10/topic_center.csv"),
    d3.csv("data/topicModeling/con/12/topic_center.csv"),
    d3.csv("data/topicModeling/pro/10/topic_term_distr.csv"),
    d3.csv("data/topicModeling/con/12/topic_term_distr.csv"),
]).then(function(files) {

  let topicModel = new TopicModel(files[0], files[1], files[2], files[3]);
  topicModel.update();

  let termTopicLink = new TermTopicLinkChart(files[2], files[3]);
  termTopicLink.update(10);

  let heatMap = new HeatMap(files[0], files[1], files[2], files[3]);
  heatMap.update();


})




