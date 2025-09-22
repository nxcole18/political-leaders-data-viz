class BarChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  constructor(_config, _dispatcher, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 240,
      containerHeight: 260,
      margin: {
        top: 30,
        right: 5,
        bottom: 25,
        left: 45
      }
    }
    this.data = _data;
    this.dispatcher = _dispatcher;

    this.initVis();
  }

  initVis() {
    let vis = this;

    // Init inner chart size
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Init scales
    // X-scale is gender
    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.2);

    // Y-scale is count of leaders
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Init axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(2)
      .tickSize(0)
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSize(0)
      .tickPadding(10)
      .tickSize(-vis.width);

    // Define SVG 
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('class', 'chart')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append axis groups 
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${vis.height})`);
    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'y-axis');

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Prepare data - Referenced pretty much directly from Tutorial 5
    const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.gender);
    vis.aggregatedData = Array.from(aggregatedDataMap, ([gender, count]) => ({ gender, count }));

    // Define scale data
    vis.xValue = d => d.gender;
    vis.yValue = d => d.count;

    // Define scale domain
    vis.xScale.domain(["Male", "Female"]);
    vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Append barchart title "Gender"
    vis.title = vis.svg.append("text")
      .attr("class", "bc-title")
      .attr("font-family", "Calibri")
      .attr("font-weight", 545)
      .attr("x", 0)
      .attr("y", 13)
      .text("Gender");

    // Create bars - Heavily referenced Tutorial 5
    vis.chartArea.selectAll('.bar')
      .data(vis.aggregatedData)
      .join('rect')
      .attr('class', 'bar')
      .attr('width', vis.xScale.bandwidth())
      .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
      .attr('x', d => vis.xScale(vis.xValue(d)))
      .attr('y', d => vis.yScale(vis.yValue(d)))
      .on('click', function (event, d) {
        // Check if current selection is active and toggle class
        const isActive = d3.select(this).classed('active');
        d3.select(this).classed('active', !isActive);

        // Get the names of selected bars
        const selectedGenders = vis.chartArea.selectAll('.bar.active').data().map(d => d.gender);

        // Trigger filter event 
        vis.dispatcher.call('filterGender', event, selectedGenders);
      });


    // Update the axes because the underlying scales might have changed
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

  }
}