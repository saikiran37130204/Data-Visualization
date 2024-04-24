// Fetch the data
d3.csv(
  'https://gist.githubusercontent.com/saikiran37130204/ef60b3ba62f1b32fea758ea94e667f81/raw/fdd5cf1ccace5539c99601e582a5ab29f4d17e4a/CropData.csv',
).then(function (data) {
  // Convert production values to numbers
  data.forEach(function (d) {
    d.RICE_PRODUCTION = +d['RICE PRODUCTION (1000 tons)'];
  });

  // Define the dimensions of the chart
  const margin = {
    top: 70,
    right: 30,
    bottom: 100,
    left: 70,
  };
  const width = 750 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG element to the chart div
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
      'transform',
      `translate(${margin.left},${margin.top})`,
    );

  // Function to calculate total rice production
  function calculateTotalRiceProduction(data) {
    return d3.sum(data, (d) => d.RICE_PRODUCTION);
  }

  function updateChart(filteredData) {
    // Remove existing bars
    svg.selectAll('g').remove();
    svg.selectAll('text').remove();
    svg.selectAll('rect').remove();

    // Transform data to sum rice production for each state
    const stateData = d3.rollup(
      filteredData,
      (v) => d3.sum(v, (d) => d.RICE_PRODUCTION),
      (d) => d['State Name'],
    );

    // Define x and y scales
    const x = d3
      .scaleBand()
      .domain(Array.from(stateData.keys()))
      .range([0, width])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Array.from(stateData.values()))])
      .range([height, 0]);

    // Define a function to generate unique colors for each state
    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(Array.from(stateData.keys()));

    // Update bars
    const bars = svg
      .selectAll('g')
      .data(Array.from(stateData.entries()));

    bars.exit().remove(); // Remove old bars

    bars
      .enter()
      .append('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d[1]))
      .attr('width', x.bandwidth() + 5)
      .attr('height', (d) => height - y(d[1]))
      .attr('fill', (d) => colorScale(d[0]))
      .on('mouseover', function (event, d) {
        // Highlight the hovered bar
        d3.select(this).attr('fill', 'black');
        // Show tooltip on mouseover
        tooltip.style('opacity', 100);
        tooltip
          .html(
            `${d[0]}<br>${d[1].toFixed(2)} (in 1000 tons)`,
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function (event, d) {
        // Restore the original color of the bar
        d3.select(this).attr('fill', colorScale(d[0]));
        // Hide tooltip on mouseout
        tooltip.style('opacity', 0);
      });

    // Add title to the chart
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('text-decoration', 'underline')
      .text(
        'Rice Production by States in India from 1966 to 2017',
      );

    // Add x-axis
    svg
      .append('g')
      .attr('class', 'x-axis') // Add class for selection
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add x-axis label
    svg
      .append('text')
      .attr(
        'transform',
        `translate(${width / 2}, ${height + margin.top + 10})`,
      )
      .style('text-anchor', 'middle')
      .text('State');

    // Add y-axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Add y-axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -70)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Production (1000 tons)');

    // Define tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

  // Add checkboxes
  const checkboxes = d3
    .select('#checkboxes')
    .selectAll('.checkbox')
    .data(Array.from(new Set(data.map((d) => d.Year))))
    .enter()
    .append('label')
    .attr('class', 'checkbox')
    .text((d) => d + ' ')
    .append('input')
    .attr('type', 'checkbox')
    .attr('value', (d) => d) // Add value attribute to checkbox
    .on('change', function () {
      const selectedYears = d3
        .selectAll('input[type="checkbox"]:checked')
        .nodes()
        .map((checkbox) => checkbox.value);

      let filteredData = data;
      if (selectedYears.length > 0) {
        filteredData = data.filter((d) =>
          selectedYears.includes(d.Year),
        );
        const totalProduction =
          calculateTotalRiceProduction(filteredData);
        console.log(
          'Total Rice Production for selected years:',
          totalProduction,
        );
      } else {
        const totalProduction =
          calculateTotalRiceProduction(data);
        console.log(
          'Total Rice Production for all years:',
          totalProduction,
        );
      }

      updateChart(filteredData); // Update the chart with filtered data
    });

  // Initialize the chart
  updateChart(data);
});
