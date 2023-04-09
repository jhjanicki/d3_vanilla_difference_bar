const scaleFactor = 1.8;

let width = 1920 / scaleFactor;
let height = 1080 / scaleFactor;

const margin = {
    "top": 84 / scaleFactor,
    "left": (70 + 84) / scaleFactor,
    "bottom": (85 + 84) / scaleFactor,
    "right": 84 / scaleFactor
}

const cleanedData = data.map(d => {
    const date = d.date.toString();
    return {
        date: d.date,
        y0: +d.min,
        y1: +d.max
    }
})

//to format the x-axis labels
const dateFormat = d3.timeFormat("%Y-%m");

const minDate = new Date(cleanedData[0].date);
const maxDate = new Date(cleanedData[cleanedData.length - 1].date);

// scales and axes
const xScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, width])

const yScale = d3.scaleLinear()
    .domain([d3.min(cleanedData, d => d.y0), d3.max(cleanedData, d => d.y1)])
    .range([height, 0]);

let xAxis = d3.axisBottom(xScale).tickFormat(d => dateFormat(d)).ticks(20);
let yAxis = d3.axisLeft(yScale).ticks(10);

//svg
const svg = d3.select("#chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

// draw the paths to be used as the clip path, but draw them first separetely then take the d attribute
g.append("path")
    .datum(avg)
    .attr("id", "areaHigh")
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("d", d3.area()
        .x(d=> xScale(new Date(d.date.toString())))
        .y0(yScale(d3.max(cleanedData, d => d.y1)))
        .y1(d=> yScale(d.mean))
        .curve(d3.curveStepAfter)
    )

g.append("path")
    .datum(avg)
    .attr("id", "areaLow")
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("d", d3.area()
        .x(d=> xScale(new Date(d.date.toString())))
        .y0(yScale(d3.min(cleanedData, d => d.y0)))
        .y1(d=> yScale(d.mean))
        .curve(d3.curveStepAfter)
    )

// get the d attribute from the two areas that are meant to be clip paths
const pathLow = d3.select("#areaLow").attr("d");
const pathHigh = d3.select("#areaHigh").attr("d");

g.append("clipPath")
    .attr("id", "clip-below")
    .append("path")
    .attr("d", pathLow)

g.append("clipPath")
    .attr("id", "clip-above")
    .append("path")
    .attr("d", pathHigh)

g.selectAll("rect.temp-above")
    .data(cleanedData)
    .join("rect")
    .attr("class", "temp-above")
    .attr("x", d => xScale(new Date(d.date)))
    .attr("y", d => yScale(d.y1))
    .attr("width", d => (width - margin.left) / cleanedData.length)
    .attr("height", d => yScale(d.y0) - yScale(d.y1))
    .attr("fill", "#bc4b5c")
    .attr("clip-path", "url(#clip-above)");

g.selectAll("rect.temp-below")
    .data(cleanedData)
    .join("rect")
    .attr("class", "temp-below")
    .attr("x", d => xScale(new Date(d.date)))
    .attr("y", d => yScale(d.y1))
    .attr("width", d => (width - margin.left) / cleanedData.length)
    .attr("height", d => yScale(d.y0) - yScale(d.y1))
    .attr("fill", "#3e68a1")
    .attr("clip-path", "url(#clip-below)");

// Add the average line
g.append("path")
    .datum(avg)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#4d4d4d")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(d=> xScale(new Date(d.date.toString())))
        .y(d=> yScale(d.mean))
        .curve(d3.curveStepAfter)
    )