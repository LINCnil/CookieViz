/*Copyright (c) 2013, Stéphane Petitcolas
This file is part of CookieViz

CookieViz is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CookieViz is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with CookieViz.  If not, see <http://www.gnu.org/licenses/>.
*/


function extractUrlParams(){	
	var t = location.search.substring(1).split('&');
	var f = [];
	for (var i=0; i<t.length; i++){
		var x = t[ i ].split('=');
		f[x[0]]=x[1];
	}
	return f;
}
function generate(layout, text, severity) {
    var n = noty({
	    text: text,
	    type: severity,
	    dismissQueue: true,
	    layout: layout,
	    timeout: '10000',
	    theme: 'defaultTheme'
	});
    console.log('html: '+n.options.id);
}


function rescale() 
{
	//generate("top", "scale", "error");
    trans=d3.event.translate;
    scale=d3.event.scale;
	scale_tmp=scale/10;
	//generate("top", "scale ="+scale+" scale_tmp"+scale_tmp,"error");
    vis.attr("transform", "translate(" + trans + ")"  + " scale(" + scale/10 + ")");
}	
function load_nodes_bis(data_nodes, data_links, map_nodes_bis, map_links, graph, cpt)
{
    var change = false;
    for (key in data_nodes)
    {
	d = data_nodes[key];
	if (typeof map_nodes_bis[data_nodes[key].name] ==  'undefined')
	{
//	    generate("topRight", "addNode :"+data_nodes[key].name, "warning");
	    graph.addNode(d, cpt);
	    change = true;
	    map_nodes_bis[data_nodes[key].name] = cpt;
	    cpt++;
	}
	else
	    {
//		generate("topLeft", "GrowNode :"+data_nodes[key].name+" To :"+d.size, "warning");
		var num;
		num = map_nodes_bis[d.name];
		graph.growNode(d, num);
		change = true;
	    }
    }
    for (key in data_links)
	{
	    d = data_links[key];
	    if (d.source && d.target && typeof map_links[d.source+d.target] == 'undefined')
		{
//		    generate("topLeft", "addLink between :"+d.source+" To :"+d.target, "error");
		    graph.addLink(data_links[key], map_nodes_bis);
		    map_links[d.source+d.target] = true
		    change = true;
		}
	}
    if (change == true)
	{
	    graph.refresh();
	}
    return cpt;
}
function show_context_menu(d)
{

	if (typeof (d3.event.x) == 'undefined' || typeof(d3.event.y) == 'undefined')
    {   
        x = d.x;
        y = d.y;
    }
    else
    {
		x = d3.event.x;
		y = d3.event.y;
    }

    $("#context_menu").css({"visibility" : "visible", "left" : x+"px", "top": y+"px"});
    $("#context_menu").attr("domain", d.name);

}
function x_axis(val)
{
	graph.redraw(2+val);
}
function y_axis(val)
{
	graph.redraw(4+val);
}
function zoom_in()
{
	graph.redraw(1);
}

function zoom_out()
{
	graph.redraw(2);
}

function delete_point() 
{
	location.href = "index.html?max_date&domain="+$("#context_menu").attr("domain");
}	
function draw_points(el, w, h)
{
	this.addNode = function (d, cpt) {
        nodes.push({"cx":d.x,"cy":d.y,"r":d.size,"date":d.date,"name":d.name, "id":cpt, "show":"visible", "link": d.link});
		to_hide[d.name] = "visible";
	}
    this.init_force = function ()
    {
	force = d3.layout.force()
	.nodes(nodes)
	.links(links)
	.charge(-300)
	.distance(100)
	.friction(0.9)
	.size([w,h]);
    }
    this.growNode = function (d, cpt) {
	to_grow[d.name]=d.size;
	}
	this.clearit = function (){
	nodes = [];
	links = [];
    }
	this.redraw = function (val) 
	{
			if (val == 1)
		{
			trans[0]-=100;
			trans[1]-=100;
			scale+=0.2;
		}
		else if (val == 2) 
		{
			trans[0]+=100;
			trans[1]+=100;
			scale-=0.2;
		}
		else if (val == 3)
		{
			trans[0]-=100;
		}
		else if (val == 4) 
		{
			trans[0]+=100;
		}
		else if (val == 5)
		{
			trans[1]+=100;
		}
		else if (val == 6) 
		{
			trans[1]-=100;
		}

		else
		{
			trans=d3.event.translate;
			scale=d3.event.scale;
			//generate("topRight", trans+":"+scale,"warning");
		}
		
	
    vis.attr("transform", "translate(" + trans+ ")"  + " scale(" + scale + ")");
	}

    this.addLink = function (d, map_nodes_bis) {
	if (d.source && d.target)
	    {
		to_redraw[d.source] = map_nodes_bis[d.source];
		to_redraw[d.target] = map_nodes_bis[d.target];
	    }
	var redraw = node.filter(function(d, $to_redraw) {if (typeof to_redraw[d.name] != 'undefined'){return d.id}});
	redraw.remove();
        links.push({"source":map_nodes_bis[d.source],"target":map_nodes_bis[d.target],"cookie":d.cookie,"id":cpt_link});
	cpt_link++;
    }
    this.refresh = function ()
	{
	    force.start();
	    update();
	}

	this.resize = function (w, h)
	{
		var node_svg = d3.select("#svg_display").attr("width", w)
												.attr("height", h);
	}

	var trans=[],
	scale=1;

	trans[0]=1;
	trans[1]=1;
   var vis = d3.select("#chart")
    .append("svg:svg")
		.attr("width", w)
		.attr("height", h)
		.attr("id", "svg_display")
		.attr("pointer-events", "all")
    .append('svg:g')
     .call(d3.behavior.zoom().on("zoom", this.redraw))
    .append('svg:g');
     var nodes = new Array(),
	links = new Array();
	
    var to_hide = [];
    var to_grow = new Object();
	var to_redraw = [];

	var 	force = d3.layout.force()
	.nodes(nodes)
	.links(links)
	.charge(-300)
	.distance(100)
	.friction(0.9)
	.size([w,h]);
    force.on("tick", function(e) {
	    vis.selectAll("g")
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";});
	    vis.selectAll("line.link")
		.attr("x1", function(d) {return d.source.x;})
		.attr("y1", function(d) {return d.source.y;})
		.attr("x2", function(d) {return d.target.x;})
		.attr("y2", function(d) {return d.target.y;})
		      });
    var cpt_link = 0;
    var node;
    var update = function () {

	node = vis.selectAll("g")
	.data(nodes, function(d) {return d.id;});

	
	var link = vis.selectAll("line")
	.data(links, function(d) {return d.id;});

	
	var linkEnter = link.enter().insert("line")
	.attr("class", "link")
	.attr("cookie", function(d) {return d.cookie})
	.attr("stroke", "#ddd")
	.attr("stroke-opacity", 0.8)
	.attr("marker-end","url(#arrow)")
	.style("stroke-width", 2)
	.style("stroke", function(d) {return fill[d.cookie]})
	link.exit().remove();

	var grow = node.filter(function(d, $to_grow) {if (typeof to_grow[d.name] != 'undefined'){return d.id; }});
	grow.selectAll("circle")
	.attr("r", function(d, $to_grow) {return to_grow[d.name]; });

	 var nodeEnter = node.enter().append("svg:g")
	.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";})
	.attr("name", function(d) {return d.name})
	.attr("id", function(d) {return d.id})
	.call(force.drag);
	node.exit().remove();
	
	nodeEnter.append("svg:circle")
	 .attr("cx", function(d) {return d.cx})
	 .attr("cy", function(d) {return d.cy})
	 .attr("r", function(d) {return d.r})
	 .attr("date", function(d) {return d.date})
	.attr("name", function(d) {return d.name})
	.attr("id", function(d) {return d.id})
	.attr("fill", "#00ADEE")
	.attr("stroke", function(d) {if (d.link > 1){return "#fe2020"}else{return "#000000"}})
	.attr("stroke-width", function(d) {if (d.link > 1){return d.link+"px"}else{return "1px"}});
	node.exit().remove();

	 
	 nodeEnter.append("title")
	 .text(function(d) {return (d.name)});
	  node.exit().remove();
	 nodeEnter.append("svg:image")
	.attr("class", "node")
	.attr("xlink:href", function(d) {var ico = "https://www.google.com/s2/favicons?domain="+d.name;return ico})
	.attr("x", "-8")
	.attr("y", "-8")
	.attr("width", "16")
	.attr("height", "16")
	.attr("name", function(d) {return d.name})
	.attr("id", function(d) {return d.id})
	.on("contextmenu", function(d) {show_context_menu(d);});
	 node.exit().remove();

	to_grow = [];
	to_redraw = [];
    }

    // Make it all go
    update();
}
