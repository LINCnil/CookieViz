<?php
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
?>
var w = 1200,
    h = 700,
    max_date = 0,
    vis,
    data_nodes = "",
    data_links = "",
    map_nodes = [],
    map_nodes_bis = [],
    map_links = [],
    force,
    links = [],
    nb_nodes = 0,
    res, 
    fill = {0:"#00f0ff",1:"#ff0000",3:"#1f77b4"},
    min_date = 0;

var vis = d3.select("#chart").append("svg")
    		.attr("width", w)
		.attr("height", h);
	var force = d3.layout.force()
	    .charge(-300)
	    .distance(120)
	    .friction(0.9)
	    .nodes(data_nodes)
	    .links(links)
	    .size([w, h])
	    .start();
res=get_json(max_date);


max_date=draw_points(nb_nodes, max_date, res, fill);
//alert("max_date="+max_date);
/*setInterval(function(vis, w, h, $max_date, $force)
{
//	alert("max_date="+max_date);
	max_date=draw_points_old(vis, max_date);
}, "8000");*/