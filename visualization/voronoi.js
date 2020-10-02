//begin: constants
var _2PI = 2 * Math.PI;
//end: constants

//begin: layout conf.

//end: layout conf.
const treemapRadius = 150;

//begin: treemap conf.
var _voronoiTreemap = d3.voronoiTreemap();
var hierarchy, circlingPolygon;
//end: treemap conf.

//begin: drawing conf.
var fontScale = d3.scaleLinear();
//end: drawing conf.

//begin: reusable d3Selection
var svg_tree, drawingArea, treemapContainer;
//end: reusable d3Selection

function update_voronoi(rootData) {

  if (!rootData.children) return;
  
  const num_childen = rootData.children.reduce((sum, child)=> sum + child.children.length,0);
  
  if(num_childen == 0){
    svg_tree.style("visibility", "hidden");
    return;
  }else{
    svg_tree.style("visibility", "visible");
  }

  hierarchy = d3.hierarchy(rootData).sum(function (d) { return d.weight; });
  _voronoiTreemap
    .clip(circlingPolygon)
    (hierarchy);

  drawTreemap(hierarchy);
};


function computeCirclingPolygon(radius) {
  var points = 60,
    increment = _2PI / points,
    circlingPolygon = [];

  for (var a = 0, i = 0; i < points; i++, a += increment) {
    circlingPolygon.push(
      [radius + radius * Math.cos(a), radius + radius * Math.sin(a)]
    )
  }

  return circlingPolygon;
};

function load_voronoi(data, size) {
  svgWidth = size.width;
  svgHeight = size.height;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 },
  height = svgHeight - margin.top - margin.bottom,
  width = svgWidth - margin.left - margin.right,
  halfWidth = width / 2,
  halfHeight = height / 2,
  quarterWidth = width / 4,
  quarterHeight = height / 4,
  titleY = 20,
  legendsMinY = height + 50,
  treemapCenter = [halfWidth, halfHeight + 5];

  circlingPolygon = computeCirclingPolygon(treemapRadius);
  fontScale.domain([4, 60]).range([8, 15]).clamp(true);

  svg_tree = d3.select("#treemap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  drawingArea = svg_tree.append("g")
    .classed("drawingArea", true)
    .attr("transform", "translate(" + [margin.left +10 , margin.top+10] + ")");

  treemapContainer = drawingArea.append("g")
    .classed("treemap-container", true)
    .attr("transform", "translate(" + treemapCenter + ")");

  treemapContainer.append("path")
    .classed("world", true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .attr("d", "M" + circlingPolygon.join(",") + "Z");
    
    update_voronoi(data);
}

function drawLegends(rootData) {
  var legendHeight = 13,
    interLegend = 4,
    colorWidth = legendHeight * 6,
    continents = rootData.children.reverse();

  var legendContainer = drawingArea.append("g")
    .classed("legend", true)
    .attr("transform", "translate(" + [0, legendsMinY] + ")");

  var legends = legendContainer.selectAll(".legend")
    .data(continents)
    .enter();

  var legend = legends.append("g")
    .classed("legend", true)
    .attr("transform", function (d, i) {
      return "translate(" + [0, -i * (legendHeight + interLegend)] + ")";
    })

  legend.append("rect")
    .classed("legend-color", true)
    .attr("y", -legendHeight)
    .attr("width", colorWidth)
    .attr("height", legendHeight)
    .style("fill", function (d) { return d.color; });
  legend.append("text")
    .classed("tiny", true)
    .attr("transform", "translate(" + [colorWidth + 5, -2] + ")")
    .text(function (d) { return d.name; });
}


function drawTreemap(hierarchy) {

 
 const div_tooltip = d3.select("#treemap").append("div")
 .attr("class", "tooltip")
 .style("opacity", 0);


  var leaves = hierarchy.leaves();

  var cells = treemapContainer.append("g")
    .classed('cells', true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".cell")
    .data(leaves)
    .enter()
    .append("path")
    .classed("cell", true)
    .attr("d", function (d) { return "M" + d.polygon.join(",") + "z"; })
    .style("fill", function (d) {
      return d.parent.data.color;
    });

  var labels = treemapContainer.append("g")
    .classed('labels', true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".label")
    .data(leaves)
    .enter()
    .append("g")
    .classed("label", true)
    .attr("transform", function (d) {
      return "translate(" + [d.polygon.site.x, d.polygon.site.y] + ")";
    })
    .style("font-size", function (d) {
      return fontScale(d.data.weight)+"px";
    })
    .style("opacity", d => d.data.weight > 2 ? 1 : 0);

  labels.append("text")
    .classed("name", true)
    .html(function (d) {
      return (d.data.weight < 13) ? d.data.code : d.data.name;
    });
  labels.append("text")
    .classed("value", true)
    .text(d => d.data.weight > 4 ? d.data.weight + "%" : null);

  var hoverers = treemapContainer.append("g")
    .classed('hoverers', true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".hoverer")
    .data(leaves)
    .enter()
    .append("path")
    .classed("hoverer", true)
    .attr("d", function (d) { return "M" + d.polygon.join(",") + "z"; });

  hoverers.append("title")
    .text(function (d) { return d.data.name + "\n" + d.value + "%"; });
    

  hoverers
  .on("click", function (d) {
    filter_node = d.data.name;
  });

}