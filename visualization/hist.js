var ordinals = [];
var x, y, bars, xAxis, yAxis, width_hist, heigth_hist, svg_hist, div_hist, xScale, yScale;
var duration_hist = 1000;

function update_hist(data) {
    ordinals = data.map(x => x.site);

    xScale = x.domain([-1, ordinals.length])
    yScale = y.domain([0, d3.max(data, function (d) { return d.value })])

    let xBand = d3.scaleBand().domain(d3.range(-1, ordinals.length)).range([0, width_hist])

    const threshold_max = Math.round(data.length * 0.8);
    const threshold_min = Math.round(data.length* 0.2);
    
    var range_min = 0;
    var range_max = 0;

    if (data[threshold_min])
        range_min = data[threshold_min].value;

    if (data[threshold_max])
        range_max = data[threshold_max].value;

    let bars_tmp = bars.selectAll('.bar')
        .data(data);

    if (data.length == 0) bars.selectAll('.bar').remove();

    bars_tmp.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('height', 0)
        .attr('y', heigth_hist)
        .style("fill", d => d.value >= range_min ? "#fb8761" : d.value < range_max ? "#4f127b" : "#b5367a")
        .on("click", function (d) {
            filter_node = d.site;
        })
        .merge(bars_tmp)
        .transition()
        .duration(duration_hist)
        .attr('x', function (d, i) {
            return xScale(i) - xBand.bandwidth() * 0.9 / 2
        })
        .attr('y', function (d, i) {
            return yScale(d.value)
        })
        .attr('width', xBand.bandwidth() * 0.9)
        .attr('height', function (d) {
            return heigth_hist - yScale(d.value)
        })
        .style("fill", d => d.value >= range_min ? "#fb8761" : d.value < range_max ? "#4f127b" : "#b5367a")

        bars
        .exit()
        .transition()
        .duration(duration_hist)
        .attr('height', 0)
        .attr('y', heigth_hist)
        .remove();

    yAxis
        .transition()
        .duration(duration_hist)
        .call(d3.axisLeft(yScale));

}

function load_hist(data, size) {

    let margin = {
        top: 10, right: 10, bottom: 20, left: 30
    };

    width_hist = size.width - margin.left - margin.right;
    heigth_hist = size.height - margin.top - margin.bottom;
    var radius = (Math.min(size.width, size.height) / 2) - 10;
    var node;


    svg_hist = d3.select("#hist").append("svg")
        .attr('width', "100%")
        .attr('height', "100%")
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(
            d3.zoom()
                .translateExtent([[0, 0], [width_hist, heigth_hist]])
                .extent([[0, 0], [width_hist, heigth_hist]])
                .on('zoom', zoom)
        )

    div_hist = d3.select("#hist").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // the scale
    x = d3.scaleLinear().range([0, width_hist])
    y = d3.scaleLinear().range([heigth_hist, 0])
    let color = d3.scaleOrdinal(d3.schemeCategory10)
    // for the width of rect
  
    // zoomable rect
    svg_hist.append('rect')
        .attr('class', 'zoom-panel')
        .attr('width', width_hist)
        .attr('height', heigth_hist)

    // x axis
    xAxis = svg_hist.append('g')
        .attr('class', 'xAxis')
        .attr('transform', `translate(0, ${heigth_hist})`);


    // y axis
    yAxis = svg_hist.append('g')
        .attr('class', 'y axis');

    let defs = svg_hist.append('defs')

    bars = svg_hist.append('g')
    .attr('clip-path', 'url(#my-clip-path)')

    // use clipPath
    defs.append('clipPath')
        .attr('id', 'my-clip-path')
        .append('rect')
        .attr('width', width_hist)
        .attr('height', heigth_hist);

    function zoom() {
        if (d3.event.transform.k < 1) {
            d3.event.transform.k = 1
            return
        }

        // the bars transform
        bars.attr("transform", "translate(" + d3.event.transform.x + ",0)scale(" + d3.event.transform.k + ",1)")

    }
    update_hist(data);
};