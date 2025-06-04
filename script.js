const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const svg = d3.select("#heatmap"),
      width = 1200,
      height = 500,
      padding = 60;

svg.attr("width", width).attr("height", height);

const tooltip = d3.select("#tooltip");

d3.json(url).then(data => {
  const baseTemp = data.baseTemperature;
  const dataset = data.monthlyVariance;

  const years = dataset.map(d => d.year);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const xScale = d3.scaleBand()
    .domain([...new Set(years)])
    .range([padding, width - padding]);

  const yScale = d3.scaleBand()
    .domain(d3.range(1, 13))
    .range([padding, height - padding]);

  const colorScale = d3.scaleQuantize()
    .domain(d3.extent(dataset, d => baseTemp + d.variance))
    .range(["#4575b4", "#91bfdb", "#ffffbf", "#fdae61", "#d73027"]);

  const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => year % 10 === 0)).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(m => months[m - 1]);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg.selectAll(".cell")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemp + d.variance)
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", d => colorScale(baseTemp + d.variance))
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`)
        .attr("data-year", d.year)
        .html(`${d.year} - ${months[d.month - 1]}<br>${(baseTemp + d.variance).toFixed(2)}℃<br>${d.variance.toFixed(2)}℃ variance`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Legend
  const legendColors = colorScale.range();
  const legend = d3.select("#legend");
  legend.selectAll("div")
    .data(legendColors)
    .enter()
    .append("div")
    .append("svg")
    .attr("width", 40)
    .attr("height", 20)
    .append("rect")
    .attr("width", 40)
    .attr("height", 20)
    .attr("fill", d => d);
});
