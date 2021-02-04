const getFavicons = require('get-website-favicon');
const JSZip = require("jszip");
const privacy_list = require('./data/adv.json');

async function export_data_analysis() {

    function zipGraphs(zip, nodes, links) {
        const graphs = {};
        for (node of nodes) {
            const subgraph_links = links.filter(x => x.source == node.id || x.target == node.id);
            const subgraph_nodeset = new Set();
            subgraph_nodeset.add(node.id);
            subgraph_links.forEach(x => subgraph_nodeset.add(x.source));
            subgraph_links.forEach(x => subgraph_nodeset.add(x.target));

            const subgraph_nodes = Array.from(subgraph_nodeset)
                .map(x => nodes.find(elt => elt.id == x));

            const blob = new Blob([JSON.stringify({ nodes: subgraph_nodes, links: subgraph_links })], { type: 'application/json' })
            zip.file("data/" + node.id + ".json", blob);
        }
        return graphs;
    }

    function getMostPresent(nodes, links) {
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
            .filter(x => privacy_list[x])
            .filter(x => 100 * reverse[x].length / global_count >= trigger);

        const missing = Object.keys(reverse)
            .filter(x => !privacy_list[x])
            .filter(x => 100 * reverse[x].length / global_count >= trigger);

        const no_to_study_size = Object.keys(reverse)
            .filter(x => !privacy_list[x])
            .filter(x => 100 * reverse[x].length / global_count < trigger)
            .reduce((a, x) => a + reverse[x].length, 0);



        if (missing.length > 0) {
            console.log("warning this list has not been study : ");
            missing.forEach(x => {
                console.log(x + "with the following cookies : " + cookies[x]);
            })
        }

        // Computing region
        const ads_list = to_study
            .filter(x => privacy_list[x].purpose.includes("ads"))
            .map(x => ({
                name: x,
                code: x.substring(0, 2),
                cookie: cookies[x],
                ads: 1,
                privacy: privacy_list[x].privacy ? privacy_list[x].privacy : null,
                weight: (100 * reverse[x].length / global_count).toFixed(2)
            })) // percent of third domain presence
            .sort((first, second) => second.weight - first.weight);

        const nonads_list = to_study
            .filter(x => !privacy_list[x].purpose.includes("ads"))
            .map(x => ({
                name: x,
                code: x.substring(0, 2),
                cookie: cookies[x],
                ads: 0,
                privacy: privacy_list[x].privacy ? privacy_list[x].privacy : null,
                weight: (100 * reverse[x].length / global_count).toFixed(2)
            })) // percent of third domain presence
            .sort((first, second) => second.weight - first.weight);

        const nonstudy_list = [{
            name: "not_study",
            code: "not_study".substring(0, 2),
            cookie: null,
            ads: -1,
            privacy: null,
            weight: 100 * no_to_study_size / global_count
        }];

        const voronoir = { children: [] };

        voronoir.children.push({ name: "La politique de confidentialité indique une finalité publicitaire", color: "#fb8761", children: ads_list });
        voronoir.children.push({ name: "La politique de confidentialité n'indique pas de finalité publicitaire", color: "#b5367a", children: nonads_list });
        return voronoir;
    }

    async function add_favicons(zip, favicons, nodes) {
        let cpt_ico = 0;
        for (const site in favicons) {
            if (!favicons[site] || nodes.filter(node => node.id == site).length == 0) continue;
            let faviconBlob = null;
            try {
                const response = await fetch(favicons[site]);
                if (!response) continue;
                faviconBlob = await response.blob();
            } catch (error) {
                continue;
            }

            if (faviconBlob && faviconBlob.size > 0) {
                const mime_ext = {
                    "image/png": "png",
                    "image/tiff": "tif",
                    "image/vnd.wap.wbmp": "wbmp",
                    "image/x-icon": "ico",
                    "image/x-jng": "jng",
                    "image/x-ms-bmp": "bmp",
                    "image/svg+xml": "svg",
                    "image/webp": "webp",
                    "image/gif": "gif",
                    "image/jpeg": "jpeg"
                }
                const fileext = mime_ext[faviconBlob.type] ? mime_ext[faviconBlob.type] : "ico"
                const icons_path = "icons/" + cpt_ico++ + "." + fileext;
                zip.file(icons_path, faviconBlob, { base64: true });
                nodes.filter(node => node.id == site).forEach(x=> x.icon = icons_path);
            }
        };
    };

    var zip = new JSZip();

    // Generate global graph
    let all_nodes = await loaded_plugins.requests.nodes_requests();
    const link_requests = await loaded_plugins.requests.link_requests();
    const links_with_cookies = await loaded_plugins.requests.link_requests_with_cookies();
    const favicons = await loaded_plugins.favicons.get_all_favicons();

    const links = [];
    const nodes_with_cookies = new Set();
    for (const source in links_with_cookies) {
        if (source.endsWith(".safeframe.googlesyndication.com")) continue; // This url is polluting initatiator
        for (const target in links_with_cookies[source]) {
            const cookie_list = Object.keys(links_with_cookies[source][target]);
            links.push({ source: source, target: target, cookie: cookie_list.length });
            nodes_with_cookies.add(all_nodes.find(x => x.id == source));
            nodes_with_cookies.add(all_nodes.find(x => x.id == target));
        }
    }

    all_nodes
        .filter(x => x.visited == 1)
        .filter(x => !x.id.endsWith(".safeframe.googlesyndication.com")) // This url is polluting initatiator
        .forEach(x => nodes_with_cookies.add(x));
    const nodes = Array.from(nodes_with_cookies);

    await add_favicons(zip, favicons, nodes);

    const blob_global = new Blob([JSON.stringify({ nodes: nodes, links: links })], { type: 'application/json' });
    zip.file("data/global.json", blob_global);
    zipGraphs(zip, nodes, links);

    // Reintegrate all nodes for the analysis
    const distrib = Object.keys(link_requests)
        .map((x) => ({ site: x, value: x in links_with_cookies ? Object.keys(links_with_cookies[x]).length : 0}))
        .sort((a, b) => b.value - a.value);
    const blob_distribution = new Blob([JSON.stringify(distrib)], { type: 'application/json' });
    zip.file("data/distribution.json", blob_distribution);


    const mostPresent = getMostPresent(all_nodes, links_with_cookies);
    const blob_mostpresent = new Blob([JSON.stringify(mostPresent)], { type: 'application/json' });
    zip.file("data/mostpresent.json", blob_mostpresent);

    zip.generateAsync({ type: "blob" })
        .then(function (blob) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = "data.zip";
            a.click();
            window.URL.revokeObjectURL(url);
        });
}