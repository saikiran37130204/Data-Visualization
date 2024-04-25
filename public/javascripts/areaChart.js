// Parse the CSV data
d3.csv(
  'https://gist.githubusercontent.com/saikiran37130204/a8e24e3e2808d15b783b0e5ca3ee48ed/raw/4684cda8c3dbac92ff48727075cf10ac3881d444/Rainfall_dataset.csv',
).then(function (data) {
  // Convert string data to numbers
  data.forEach(function (d) {
    d.YEAR = +d.YEAR;
    d.ANNUAL = +d.ANNUAL;
  });

  // Filter data for the years 1960 to 2017
  const filteredData = data.filter(function (d) {
    return d.YEAR >= 1960 && d.YEAR <= 2017;
  });

  // Group data by year and calculate the sum of annual rainfall for all states
  const aggregatedData = Array.from(
    d3.group(filteredData, (d) => d.YEAR),
    ([key, value]) => ({
      key: key,
      value: d3.sum(value, (d) => d.ANNUAL),
    }),
  );

  // Set up dimensions
  const margin = {
    top: 60,
    right: 30,
    bottom: 80,
    left: 200,
  };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG
  const svg = d3
    .select('#area-chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
      'transform',
      `translate(${margin.left},${margin.top})`,
    );

  // Add chart title
  svg
    .append('text')
    .attr('class', 'chart-title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .text('Total Annual Rainfall in India (1960-2017)');
  // Define scales
  const x = d3
    .scaleLinear()
    .domain([1960, 2017])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedData, (d) => d.value)])
    .range([height, 0]);

  // Draw area
  const area = d3
    .area()
    .x((d) => x(+d.key))
    .y0(height)
    .y1((d) => y(d.value));

  svg
    .append('path')
    .datum(aggregatedData)
    .attr('fill', 'lightsteelblue')
    .attr('d', area);

  // Add x-axis
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d'))); // Format ticks as integers

  // Add x-axis label
  svg
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom / 2)
    .text('Year');

  // Add y-axis
  svg.append('g').call(d3.axisLeft(y));

  // Add y-axis label
  svg
    .append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 150)
    .text('Total Annual Rainfall (mm)');

  // Create tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  // Create a circle element for the hover point
  const hoverPoint = svg
    .append('circle')
    .attr('class', 'hover-point')
    .attr('r', 5)
    .style('fill', 'black')
    .style('opacity', 0);

  // Add interactivity to show tooltip and hover point on hover
  svg
    .append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mouseover', () => {
      tooltip.style('opacity', 1);
      hoverPoint.style('opacity', 1);
    })
    .on('mousemove', (event) => {
      const mouseX = d3.pointer(event)[0];
      const xDate = x.invert(mouseX);
      const bisect = d3.bisector((d) => d.key).right;
      const index = bisect(aggregatedData, xDate);
      const d = aggregatedData[index - 1];
      tooltip
        .html(
          `<strong>Year:</strong> ${d.key}<br/><strong>Total Rainfall:</strong> ${d.value.toFixed(
            2,
          )}`,
        )
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY}px`);
      hoverPoint
        .attr('cx', x(+d.key))
        .attr('cy', y(d.value));
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
      hoverPoint.style('opacity', 0);
    });
});
