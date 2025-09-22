class ScatterPlot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */
  constructor(_config, _dispatcher, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 720,
      containerHeight: 260,
      margin: {
        top: 30,
        right: 15,
        bottom: 25,
        left: 30
      },
      tooltipPadding: _config.tooltipPadding || 15
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
    // Init x-scale for GDP per capita
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    // Init y-scale for age
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Init axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
      .tickSize(-vis.height - 10)
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSize(-vis.width - 10)
      .tickPadding(10);

    // Define SVG
    vis.svg = d3.select(vis.config.parentElement)
      .attr('class', 'chart')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append axis groups 
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'sp-x-axis')
      .attr('transform', `translate(0,${vis.height})`);
    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'sp-y-axis');

    // Append axes titles - From Tutorial 5
    vis.chartArea.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('GDP per Capita (US$)');

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
    vis.xValue = d => d.pcgdp;
    vis.yValue = d => d.start_age;

    // Define scale domains
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([25, 95]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const circles = vis.chartArea.selectAll('.point')
      .data(vis.data.filter(d => d.pcgdp !== null), d => d.leader)
      .join('circle')
      .attr('class', 'point')
      .attr('fill-opacity', 0.65)
      .attr('r', 5)
      .attr('cy', d => vis.yScale(vis.yValue(d)))
      .attr('cx', d => vis.xScale(vis.xValue(d)));

    // Tooltip event listeners - Tutorial 5
    // GDP formatting from https://stackoverflow.com/questions/13599118/how-to-remove-decimal-point-from-my-y-axis-scale-in-d3js-graph
    circles
      .on('mouseover', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
              <div class="tooltip-title">${d.leader}</div>
              <div><i>${d.country}, ${d.start_year} - ${d.end_year}</i></div>
              <ul>
                <li>Age at inauguration: ${d.start_age}</li>
                <li>Time in office: ${d.end_year - d.start_year} years</li>
                <li>GDP/capita: ${d3.format('.0f')(d.pcgdp)}</li>
              </ul>
            `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });

    // Update the axes/gridlines and remove the axis - Tutorial 5
    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())

  }

}