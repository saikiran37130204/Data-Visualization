// const d3=require('d3');
// Define the dimensions of the chart
const margin = {
  top: 30,
  right: 30,
  bottom: 130,
  left: 60,
};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

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

  // Add title to the chart
svg
.append('text')
.attr('x', width / 2)
.attr('y', 0 - margin.top / 2)
.attr('text-anchor', 'middle')
.style('font-size', '20px')
.style('text-decoration', 'underline')
.text('Rice Production by States in India from 1966 to 2017');

// Fetch the data
d3.csv(
  'https://gist.githubusercontent.com/saikiran37130204/ef60b3ba62f1b32fea758ea94e667f81/raw/fdd5cf1ccace5539c99601e582a5ab29f4d17e4a/CropData.csv',
).then(function (data) {
  // Convert production values to numbers
  data.forEach(function (d) {
    d.RICE_PRODUCTION = +d['RICE PRODUCTION (1000 tons)'];
  });

  // Transform data to sum rice production for each state
  const stateData = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.RICE_PRODUCTION),
    (d) => d['State Name'],
  );

  // Log the transformed data to check if it's correct
  console.log('State-wise Data:', stateData);

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

  // Add bars to the chart
  svg
    .selectAll('rect')
    .data(Array.from(stateData.entries()))
    .enter()
    .append('rect')
    .attr('x', (d) => x(d[0]))
    .attr('y', (d) => y(d[1]))
    .attr('width', x.bandwidth())
    .attr('height', (d) => height - y(d[1]))
    .attr('fill', (d) => colorScale(d[0])) // Use the state name to get a color from the scale
    .on('mouseover', function (event, d) {
      // Sum rice production for all districts of the hovered state
      const totalProduction = data
        .filter((entry) => entry['State Name'] === d[0])
        .reduce(
          (sum, entry) => sum + entry.RICE_PRODUCTION,
          0,
        );

      // Round off production value to two decimal places
      const roundedProduction = totalProduction.toFixed(2);

      // Show tooltip on mouseover
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip
        .html(
          `<strong>${d[0]}</strong><br/>Production: ${roundedProduction} tons`,
        )
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      // Hide tooltip on mouseout
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Add x-axis
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  // Add y-axis
  svg.append('g').call(d3.axisLeft(y));
});

// Add tooltip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);
