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
var w = $("#chart").width(),
    h = $("#chart").height(),
    max_date = 0,
    vis,
    data_nodes = "",
    data_links = "",
    map_nodes = [],
    map_nodes_bis = [],
    map_links = [],
    force,
    links = [],
    params = [],
    nb_nodes = 0,
    res,
    domain = "",
    fill = {0: "#646464", 1: "#fe2020", 3: "#1f77b4"},
    min_date = 0,
    cpt = 0;
params = extractUrlParams();
if (params["domain"]) {
    domain = params["domain"];
}
is_open = false;
$("#show_menu").click(function ($is_open) {
    if (is_open === false) {
        $("#show_menu").text("Fermer Menu");
        $("#menu").animate({top: '0px'}, 500);
        $("#show_menu").animate({top: '40px'}, 500);
        $("#show_menu").css({background: '#ffffff', color: "#000000"}, 300);
        is_open = true;
    }
    else {

        $("#show_menu").text("Ouvrir Menu");
        is_open = false;
        $("#show_menu").animate({top: '0px'}, 500);
        $("#show_menu").css({background: '#000000', color: "#ffffff"}, 300);
        $("#menu").animate({top: '-50px'}, 500);
    }

});
only_cookie = false;
$("#cookie").click(function ($data_nodes, $data_links, $map_nodes_bis, $map_links, $graph, $cpt) {
    location.href = "index.php";
});
$("#reset").click(function () {
    reset_graph();
});
$("#zoomin").click(function () {
    zoom_in();
});
$("#zoomout").click(function () {
    zoom_out();
});
$("#droite").click(function () {
    x_axis(1);
});
$("#gauche").click(function () {
    x_axis(2);
});
$("#haut").click(function () {
    y_axis(1);
});
$("#bas").click(function () {
    y_axis(2);
});

$("#center_to_point").click(function () {
    delete_point();
});
$("#expand").click(function ($domain, $max_date) {
    max_date = "";
    domain = $("#context_menu").attr("domain");
    $("#context_menu").css({"visibility": "hidden"});
});
$("#info").click(function ($domain, $max_date) {
    //$("#title").html("<b>"+domain+"</b>");

    res = get_info($("#context_menu").attr("domain"));
    $("#window_content").html("");
    $("#window_content").html(res);
    $("#infos").fixheadertable({
        caption: $("#context_menu").attr("domain"),
        showhide: false,
        height: document.body.clientHeight * (20 / 100),
        sortable: true,
        zebra: true
    });
    $("#info_window").animate({"top": "70%"});
    $("#close_window").css({"visibility": "visible"});
    $("#context_menu").css({"visibility": "hidden"});
});
$("#close_window").click(function ($domain, $max_date) {
    $("#close_window").css({"visibility": "hidden"});
    $("#info_window").animate({"top": "95%"});
    $("#window_content").html("");

});
$("#chart").click(function ($domain, $max_date) {
    if ($("#context_menu").attr("domain") != "") {
        $("#context_menu").css({"visibility": "hidden"});
    }
});
graph = new draw_points("#chart", w, h);
res = get_json(max_date, domain);
data_nodes = res.inf_nodes;
data_links = res.inf_links;
if (res.max_date != "") {
    if (max_date != res.max_date) {
        max_date = res.max_date;
    }
}
cpt = load_nodes_bis(data_nodes, data_links, map_nodes_bis, map_links, graph, cpt);
setInterval(function ($domain, $cpt) {
    res = get_json(max_date, domain);
    data_nodes = [];
    data_links = [];
    data_nodes = res.inf_nodes;
    data_links = res.inf_links;
    if (res.max_date != "") {
        if (max_date != res.max_date) {
            max_date = res.max_date;
        }
    }
    cpt = load_nodes_bis(data_nodes, data_links, map_nodes_bis, map_links, graph, cpt);
}, 4000);
