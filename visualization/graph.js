const loaded_plugins = {};

var g;
var tooltip;
var node;
var link;
var simulation;
const scale = d3.scaleOrdinal(d3.schemeCategory10);
var linkedByIndex = {};
var zoom_handler;
var svg;
var svg_width;
var svg_height;

function load_graph(nodes, links, size, force, zoom) {
    function zoom_actions() {
        g.attr("transform", d3.event.transform)
    }

    svg_width = size.width;
    svg_height= size.height;
    var transform = d3.zoomIdentity.scale(zoom);

    //add zoom capabilities 
    zoom_handler = d3.zoom()
        .on("zoom", zoom_actions);

    d3.select("#cookieviz").selectAll("*").remove();

    svg = d3.select("#cookieviz")
        .append("svg")
        .attr("width", "90%")
        .attr("height", "500px")
        .attr("viewBox", [-size.width / 2, -size.height, size.width, size.height]); // Calls/inits handleZoom;

    zoom_handler(svg);

    tooltip = d3.select("#cookieviz")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    g = svg.append("g")
        .attr("class", "everything")
        .attr("transform", transform);

    svg.call(zoom_handler)                       // Adds zoom functionality
        .call(zoom_handler.transform, transform);

    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(force))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaTarget(1)
        .on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                }).attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
        
            });

    link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("g");

    update_graph(nodes, links);
}


function update_graph(nodes, links) {


    function releasenode(d) {
        d.fx = null;
        d.fy = null;
    }

    function releasenode(d) {
        d.fx = null;
        d.fy = null;
    }

    function fade(opacity) {
        return d => {
            node.style('stroke-opacity', function (o) {
                const thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('opacity', thisOpacity);
                return thisOpacity;
            });

            link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

        };
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
    }


    // Apply the general update pattern to the nodes.
    node = node.data(nodes, function (d) { return d.id; });
    node.exit().remove();
    node = node.enter().append("g").call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .on('mouseover.tooltip', function (d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
            tooltip.html(d.id)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('mouseover.fade', fade(0.1))
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('dblclick', releasenode)
        .merge(node);

    node.append("circle")
        .attr("r", 12)
        .attr("fill", (d) => { return scale(d.visited); });

    node.append("image")
        .attr("xlink:href", (d) => { return d.icon ? d.icon : "../icons/empty_favicon.png"; })
        .attr("x", "-8")
        .attr("y", "-8")
        .attr("width", "16")
        .attr("height", "16");

    // Apply the general update pattern to the links.
    link = link.data(links, function (d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter().append("line")
        .attr("stroke-width", d => d.cookie ? 2 : 1)
        .attr("stroke", d => d.cookie ? 'red' : '#999')
        .attr('class', 'link')
        .on('mouseover.tooltip', function (d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
        })
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        }).merge(link);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
    linkedByIndex ={};
    links.forEach(d => {
        linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });
}

