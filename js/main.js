let data;

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/leaderlist.csv').then(_data => {

  // Convert columns to numerical values
  data = _data;
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr == 'pcgdp') {
        d[attr] = (d[attr] == 'NA') ? null : +d[attr];
      } else if (attr != 'country' && attr != 'leader' && attr != 'gender') {
        d[attr] = +d[attr];
      }
    });
  });

  data = data.sort((a, b) => a.label - b.label);

  // Filter data to only have durations > 0 and have oecd as default choice
  data = data.filter(d => (d.duration > 0));
  const oecdDefault = data.filter(d => d.oecd == 1);

  // Init views
  barchart = new BarChart({ parentElement: '#bar-chart', }, dispatcher, oecdDefault);
  barchart.updateVis();

  scatterplot = new ScatterPlot({ parentElement: '#scatter-plot', }, dispatcher, oecdDefault);
  scatterplot.updateVis();

  lexischart = new LexisChart({ parentElement: '#lexis-chart', }, dispatcher, oecdDefault);
  lexischart.updateVis();

});

// Initialize dispatcher that is used to orchestrate events - Tutorial 5
const dispatcher = d3.dispatch('filterCountry', 'filterGender');

// Dispatcher waits for 'filterCountry' event 
// Filter data based on the selected country in the global dropdown
dispatcher.on('filterCountry', selectedFilter => {
  if (selectedFilter == "oecd") {
    barchart.data = data.filter(d => d.oecd == 1);
    scatterplot.data = data.filter(d => d.oecd == 1);
    lexischart.data = data.filter(d => d.oecd == 1);
  } else if (selectedFilter == "eu27") {
    barchart.data = data.filter(d => d.eu27 == 1);
    scatterplot.data = data.filter(d => d.eu27 == 1);
    lexischart.data = data.filter(d => d.eu27 == 1);
  } else if (selectedFilter == "brics") {
    barchart.data = data.filter(d => d.brics == 1);
    scatterplot.data = data.filter(d => d.brics == 1);
    lexischart.data = data.filter(d => d.brics == 1);
  } else if (selectedFilter == "gseven") {
    barchart.data = data.filter(d => d.gseven == 1);
    scatterplot.data = data.filter(d => d.gseven == 1);
    lexischart.data = data.filter(d => d.gseven == 1);
  } else if (selectedFilter == "gtwenty") {
    barchart.data = data.filter(d => d.gtwenty == 1);
    scatterplot.data = data.filter(d => d.gtwenty == 1);
    lexischart.data = data.filter(d => d.gtwenty == 1);
  } else {
    barchart.data = data.filter(d => d.oecd == 1);
    scatterplot.data = data.filter(d => d.oecd == 1);
    lexischart.data = data.filter(d => d.oecd == 1);
  }
  // Update all views
  barchart.updateVis();
  scatterplot.updateVis();
  lexischart.updateVis();
});

// Dispatcher waits for 'filterGender' event - Tutorial 5
// Filter data based on the selected gender in the bar chart
dispatcher.on('filterGender', selectedFilter => {
  if (selectedFilter.length == 0) {
    scatterplot.data = data;
    lexischart.data = data;
  } else {
    scatterplot.data = data.filter(d => selectedFilter.includes(d.gender));
    lexischart.data = data.filter(d => selectedFilter.includes(d.gender));
  }
  scatterplot.updateVis();
  lexischart.updateVis();
});

// Dispatcher is called when a global filter is clicked - Tutorial 5
d3.select("#country-selector")
  .on("click", function (event) {
    // Check if current selection is active and toggle class
    const isActive = d3.select(this).classed('active');
    d3.select(this).classed('active', !isActive);
    const selectedCountry = d3.select(this).property("value");

    // Trigger filter event 
    dispatcher.call('filterCountry', event, selectedCountry);
  });

