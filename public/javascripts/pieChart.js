// Fetch the data
d3.csv(
  'https://gist.githubusercontent.com/saikiran37130204/ef60b3ba62f1b32fea758ea94e667f81/raw/fdd5cf1ccace5539c99601e582a5ab29f4d17e4a/CropData.csv',
).then(function (data) {
  // Convert production values to numbers
  data.forEach(function (d) {
    d.WHEAT_PRODUCTION = +d['WHEAT PRODUCTION (1000 tons)'];
  });

  // Define the dimensions of the chart
  const margin = {
    top: 100,
    right: 30,
    bottom: 50,
    left: 120,
  };
  const width = 850 - margin.left - margin.right; // Increased width
  const height = 600 - margin.top - margin.bottom; // Increased height

  // Append SVG element to the chart div
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
      'transform',
      `translate(${width / 2},${height / 2})`, // Center the pie chart
    );

  // Function to calculate total wheat production
  function calculateTotalWheatProduction(data) {
    return d3.sum(data, (d) => d.WHEAT_PRODUCTION);
  }

  function updateChart(filteredData) {
    // Remove existing pie chart
    svg.selectAll('*').remove();

    // Transform data to sum wheat production for each state
    const stateData = d3.rollup(
      filteredData,
      (v) => d3.sum(v, (d) => d.WHEAT_PRODUCTION),
      (d) => d['State Name'],
    );

    // Define pie layout
    const pie = d3.pie().value((d) => d[1]);

    // Define arc generator
    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 50);

    // Define color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Generate pie slices
    const arcs = pie(Array.from(stateData.entries()));

    // Append pie slices
    svg
      .selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data[0]))
      .on('mouseover', function (event, d) {
        // Highlight the hovered slice
        d3.select(this).attr('fill', 'black');
        // Show tooltip on mouseover
        tooltip.style('opacity', 100);
        tooltip
          .html(
            `${d.data[0]}<br>${d.data[1].toFixed(2)} (in 1000 tons)`,
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function (event, d) {
        // Restore the original color of the slice
        d3.select(this).attr('fill', colorScale(d.data[0]));
        // Hide tooltip on mouseout
        tooltip.style('opacity', 0);
      });

    // Add title
    svg
      .append('text')
      .attr('x', 0)
      .attr('y', height / 2 - margin.top / 2 - 375)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .text(
        'Wheat Production by States in India from 1966 to 2017',
      );

    // Add legend
    const legend = svg
      .selectAll('.legend')
      .data(arcs)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        (d, i) =>
          `translate(-${width / 2},${i * 20 - height / 2 + 50})`, // Move legend to the top
      );

    legend
      .append('rect')
      .attr('x', width - 20)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => colorScale(d.data[0]));

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text((d) => d.data[0]);

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
          calculateTotalWheatProduction(filteredData);
        console.log(
          'Total Wheat Production for selected years:',
          totalProduction,
        );
      } else {
        const totalProduction =
          calculateTotalWheatProduction(data);
        console.log(
          'Total Wheat Production for all years:',
          totalProduction,
        );
      }

      updateChart(filteredData); // Update the chart with filtered data
    });

  // Initialize the chart
  updateChart(data);
});
