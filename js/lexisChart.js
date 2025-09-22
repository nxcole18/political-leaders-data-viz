class LexisChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  constructor(_config, _dispatcher, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 380,
      margin: {
        top: 15,
        right: 15,
        bottom: 28,
        left: 30
      }
    }
    this.data = _data;
    this.dispatcher = _dispatcher;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Apply clipping mask to 'vis.chart' to clip arrows
    vis.chart = vis.chartArea.append('g')
      .attr('clip-path', 'url(#chart-mask)');

    // Initialize clipping mask that covers the whole chart
    vis.chart.append('defs')
      .append('clipPath')
      .attr('id', 'chart-mask')
      .append('rect')
      .attr('width', vis.width + 5)
      .attr('y', -vis.config.margin.top)
      .attr('height', vis.height);

    // Helper function to create the arrows and styles for our various arrow heads
    vis.createMarkerEnds();

    // Init scales
    // X-scale is for year
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    // Y-scale is for age
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Init axes
    // Reference for removing comma in years https://stackoverflow.com/questions/16549868/d3-remove-comma-delimiters-for-thousands/19675893
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
      .tickSize(-vis.height - 10)
      .tickFormat(d3.format("d"))
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSize(-vis.width - 10)
      .tickPadding(10);

    // Append axis groups to chart area
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'lc-x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'lc-y-axis');

    // Append y-axis title
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .text('Age');
  }


  updateVis() {
    let vis = this;

    // Define scale data
    vis.xValue = d => d.start_year;
    vis.yValue = d => d.start_age;

    // Define scale domains
    vis.xScale.domain([1950, 2021]);
    vis.yScale.domain([25, 95]);

    vis.renderVis();
  }


  renderVis() {
    let vis = this;

    // Referenced https://stackoverflow.com/questions/23703089/d3-js-change-color-and-size-on-line-graph-dot-on-mouseover
    vis.chart.selectAll('.arrow-head')
      .data(vis.data)
      .join('line')
      .attr('class', 'arrow-head')
      .attr('marker-end', 'url(#arrow-head)')
      .attr('x1', d => vis.xScale(d.start_year))
      .attr('x2', d => vis.xScale(d.end_year))
      .attr('y1', d => vis.yScale(d.start_age))
      .attr('y2', d => vis.yScale(d.end_age))
      .attr('stroke', '#ddd')
      .on("mouseover", function () {
        d3.select(event.currentTarget).attr("stroke", "#888");
        d3.select('arrow-head').attr("stroke", "#888");
      })
      .on("mouseout", function () {
        d3.select(event.currentTarget).attr("stroke", "#ddd");
        d3.select('arrow-head').attr("stroke", "#ddd");
      });

    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())
  }

  /**
   * Create all of the different arrow heads.
   * Styles: default, hover, highlight, highlight-selected
   * To switch between these styles you can switch between the CSS class.
   * We populated an example css class with how to use the marker-end attribute.
   * See link for more info.
   * https://observablehq.com/@stvkas/interacting-with-marker-ends
   */
  createMarkerEnds() {
    let vis = this;
    // Default arrow head
    // id: arrow-head
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#ddd')
      .attr('fill', 'none');

    // Hovered arrow head
    // id: arrow-head-hovered
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-hovered')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#888')
      .attr('fill', 'none');

    // Highlight arrow head
    // id: arrow-head-highlighted
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#aeaeca')
      .attr('fill', 'none');

    // Highlighted-selected arrow head
    // id: arrow-head-highlighted-selected
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted-selected')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#e89f03')
      .attr('fill', 'none');
  }
}