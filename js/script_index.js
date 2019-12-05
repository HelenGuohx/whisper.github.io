    // ****** sunburst chart ******
    // load the data for asterplot(sunburst) chart
    d3.text('data/comp/top10.csv').then(response => {
        let parsed = d3.csvParseRows(response);
            let dataTop = parsed.slice(1).map((current) => {
                return {
                    name: current[0],
                    size: +current[1],
                }
            });
        let alsterPlot = new SunburstChart();
        alsterPlot.update(dataTop);
        // let compMap = new CompanyMap('', dataTop);
        // compMap.update();
    });