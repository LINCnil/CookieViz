var filter_node = null;
var nb_visited = 0;
var nb_visited_with_cookie = 0;
var nb_third = 0;
var most_third = [0, 0];
var rest_third = [0, 0];

window.addEventListener(
    'DOMContentLoaded',
    initCookieViz
);

function initCookieViz() {

    window.nwjsHeader = document.querySelector('#navigation-bar');
    window.nwjsCookieViz = document.querySelector('#cookieviz');
    window.nwjsLegend = document.querySelector('#legend-bar');
    window.nwjsHist = document.querySelector('#hist');
    window.nwjsTreemap = document.querySelector('#treemap');

    setTimeout(
        function () {
            setTimeout(
                function () {
                    nwjsCookieViz.style.opacity = 1;
                }, 600
            );
            nwjsHeader.style.opacity = 1;
            config.analyses.forEach(function (plug) {
                import("../../analyses/" + plug + ".mjs").then(loaded_plug => {
                    loaded_plugins[loaded_plug.plugins().name] = loaded_plug.plugins().data;
                    if (Object.keys(loaded_plugins).length == config.analyses.length) LoadViz(); //we are ready
                });
            });
        }, 300
    );
}


function getDistrib(links) {
    const distrib = Object.keys(links)
        .map((x) => ({ site: x, value: Object.keys(links[x]).length }))
        .sort((a, b) => b.value - a.value);

    const threshold_max = Math.round(distrib.length * 0.8);
    const threshold_min = Math.round(distrib.length * 0.2);

    var range_min = 0;
    var range_max = 0;

    if (distrib[threshold_min])
        range_min = distrib[threshold_min].value;

    if (distrib[threshold_max])
        range_max = distrib[threshold_max].value;

    most_third = [Math.max(...distrib.map(x => x.value)), range_min];
    rest_third = [0, range_min];

    return distrib;
}

function getMostPresent(nodes, links, adstxt_list) {
    const reverse = {};
    const trigger = 1;
    const global_count = nodes.filter(x => x.visited == 1).length;
    const cookies = {};

    // Reverse source and target
    for (const source in links) {
        for (const target in links[source]) {
            if (!(target in reverse)) reverse[target] = [];
            if (!reverse[target].includes(source)) reverse[target].push(source);

            for (const cookie in links[source][target]) {
                if (!(target in cookies)) cookies[target] = [];
                if (!cookies[target].includes(cookie)) cookies[target].push(cookie);
            }
        }
    }

    // Categorize results
    const to_study = Object.keys(reverse)
        .filter(x => 100 * reverse[x].length / global_count >= trigger);


    // Computing region
    const ads_list = to_study
        .filter(x => adstxt_list.includes(x))
        .map(x => ({
            name: x,
            code: x.substring(0, 2),
            cookie: cookies[x],
            ads: 1,
            weight: (100 * reverse[x].length / global_count).toFixed(2)
        })) // percent of third domain presence
        .sort((first, second) => second.weight - first.weight);

    const nonads_list = to_study
        .filter(x => !adstxt_list.includes(x))
        .map(x => ({
            name: x,
            code: x.substring(0, 2),
            cookie: cookies[x],
            ads: 0,
            weight: (100 * reverse[x].length / global_count).toFixed(2)
        })) // percent of third domain presence
        .sort((first, second) => second.weight - first.weight);

    const voronoir = { children: [] };

    voronoir.children.push({ name: "La politique de confidentialité indique une finalité publicitaire", color: "#fb8761", children: ads_list });
    voronoir.children.push({ name: "La politique de confidentialité n'indique pas de finalité publicitaire", color: "#b5367a", children: nonads_list });
    return voronoir;
}

const nodes = [];
const links = [];


async function UpdateViz() {
    let refreshed_nodes = await loaded_plugins.requests.nodes_requests();
    const links_with_cookies = await loaded_plugins.requests.link_requests_with_cookies();
    const adstxt_list = await loaded_plugins.websites.adstxt_list();

    let refreshed_links = [];
    for (const source in links_with_cookies) {
        for (const target in links_with_cookies[source]) {
            const cookie_list = Object.keys(links_with_cookies[source][target]);
            refreshed_links.push({ source: source, target: target, cookie: cookie_list.length });
        }
    }

    if (filter_node != null) {
        const subgraph_links = refreshed_links.filter(x => x.source == filter_node || x.target == filter_node);
        const subgraph_nodeset = new Set();
        subgraph_nodeset.add(filter_node);
        subgraph_links.forEach(x => subgraph_nodeset.add(x.source));
        subgraph_links.forEach(x => subgraph_nodeset.add(x.target));

        const subgraph_nodes = Array.from(subgraph_nodeset)
            .map(x => refreshed_nodes.find(elt => elt.id == x));
        refreshed_nodes = subgraph_nodes;
        refreshed_links = subgraph_links;
    }

    const nodes_to_add = refreshed_nodes.filter(x => !nodes.some(y => y.id == x.id));
    const links_to_add = refreshed_links.filter(x => !links.some(y => y.source.id == x.source && y.target.id == x.target));
    const nodes_to_remove = nodes.filter(x => !refreshed_nodes.some(y => y.id == x.id));
    const links_to_remove = links.filter(x => !refreshed_links.some(y => y.source == x.source.id && y.target == x.target.id));

    // Update graph
    nodes_to_add.forEach(x => nodes.push(x));
    links_to_add.forEach(x => links.push(x));
    nodes_to_remove.forEach(x => nodes.splice(nodes.findIndex(y => y.id == x.id), 1));
    links_to_remove.forEach(x => links.splice(nodes.findIndex(y => y => y.source.id == x.source && y.target.id == x.target), 1));

    if (nodes_to_add.length > 0 ||
        links_to_add.length > 0 ||
        nodes_to_remove > 0 ||
        links_to_remove.length) {
        const favicons = await loaded_plugins.favicons.get_all_favicons();
        updateValues(favicons, refreshed_nodes, refreshed_links);

        update_graph(nodes, links);
        update_hist(getDistrib(links_with_cookies), nwjsHist.getBoundingClientRect());
        update_voronoi(getMostPresent(refreshed_nodes, links_with_cookies, adstxt_list));
    }
}

function updateValues(favicons, nodes, links) {
    nodes.forEach(x => (x.id in favicons) ? x.icon = favicons[x.id] : null);

    if (filter_node == null) {
        nb_visited = nodes.filter(x => x.visited == 1).length;
        const thirds = Array.from(new Set(links.map(x => x.target)));
        const firsts = Array.from(new Set(links.map(x => x.source)));
        nb_visited_with_cookie = Math.round(100 * firsts.length / nb_visited);
        nb_third = thirds.length;
        autocomplete(document.getElementById("searchVisited"), firsts);
        autocomplete(document.getElementById("searchThird"), thirds);
    }

}

async function LoadViz() {
    load_graph([], [], nwjsCookieViz.getBoundingClientRect(), -200, 1);
    load_voronoi([], nwjsHist.getBoundingClientRect());
    load_hist([], nwjsHist.getBoundingClientRect());
    document.querySelector('#cookieviz').style.opacity = 1;
    stop_interval = setInterval(UpdateViz, 1000);
}

var app = angular.module('cookieVizApp', []);

app.controller('cookieVizCtrl', function ($scope, $interval) {

    $interval(function () {
        $scope.nb_visited = nb_visited;
        $scope.nb_third = nb_third;
        $scope.nb_visited_with_cookie = nb_visited_with_cookie;
        $scope.most_third = most_third;
        $scope.rest_third = rest_third;
    }, 500);
});