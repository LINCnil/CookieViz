const psl = require('psl');

var current_page = null;
var new_page = null;

// Requests tables forms
const requests_table_column = {
    //Standard request fields
    request_table: ['page', 'url', 'referer', 'cookie']
}

// Crawler analyses
function getBaseDomain(full_url) {
    if (full_url == null) return null;
    return psl.parse(full_url).domain;
}

function extractCookies(cookies) {
    if (!cookies) return {};
    return cookies.split(/; */).reduce((obj, str) => {
        if (str === "") return obj;
        const eq = str.indexOf('=');
        const key = eq > 0 ? str.slice(0, eq) : str;
        let val = eq > 0 ? str.slice(eq + 1) : null;
        if (val != null) try {
            val = decodeURIComponent(val);
        } catch (ex) {
            //console.log(ex); 
        }
        obj[key] = val;
        return obj;
    }, {});
}

// Parsing cookie header
function parseCookies(cookie_header_strs) {
    const cookies = {};

    if (Array.isArray(cookie_header_strs)) {
        for (const cookie_header_str of cookie_header_strs) {
            Object.assign(cookies, extractCookies(cookie_header_str));
        }
        return cookies;
    }
    return extractCookies(cookie_header_strs);
}



function parseHeader(table, headerdetails) {
    const results = {};

    for (var i = 0; i < headerdetails.length; i++) {
        const header = headerdetails[i];
        const name = header.name.toLowerCase();
        if (!table.includes(name)) {
            continue;
        }
        if (name in results) {
            if (!Array.isArray(results[name])) {
                // Transform this place into an array
                results[name] = [results[name]];
            }

            results[name].push(header.value);
        } else {
            results[name] = header.value;
        }
    }
    return results;
}

function processRequest(requestdetails) {
    const headers = parseHeader(['cookie', 'referer'], requestdetails.requestHeaders);

    if (!current_page && requestdetails.initiator) {
        if (new URL(requestdetails.initiator).hostname == new_page.hostname) {
            current_page = new_page;
            new_page = null;
        }
    }

    if (!current_page) return;

    const referer = 'referer' in headers ? new URL(headers['referer']).hostname : null;

    WriteToDb("request_table", { page: current_page.hostname, url: new URL(requestdetails.url).hostname, referer: referer, cookie: headers['cookie'], timestamp: requestdetails.timeStamp });
}

function initRequestsCrawler() {
    // Read cookie
    nwjsBrowser.request.onBeforeSendHeaders.addListener(processRequest, {
        urls: ["*://*/*"]
    }, ['requestHeaders', 'extraHeaders']
    );

    nwjsBrowser.addEventListener("new_page", function () {
        current_page = null;
        new_page = new URL(nwjsBrowser.src);
    });
}

function deleteRequestsCrawler() {
    nwjsBrowser.request.onBeforeSendHeaders.removeListener(processRequest);
}


function getNodes(table, index) {
    if (!db) return;

    return new Promise((resolve, reject) => {

        let txn = db.transaction([table], 'readonly');

        function get_requested() {
            return new Promise((resolve, reject) => {
                const objectStore = txn.objectStore(table);

                if (index){
                    objectStore = objectStore.index(index);
                }

                let visited = new Set();
                let requested = new Set();

                objectStore.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        const page = getBaseDomain(cursor.value.page);
                        const referer = getBaseDomain(cursor.value.referer);
                        const url = getBaseDomain(cursor.value.url);

                        visited.add(page);
                        requested.add(referer);
                        requested.add(url);
                        cursor.continue();
                    } else {
                        resolve([Array.from(visited), Array.from(requested)]);
                    }
                }
            });
        }

        get_requested().then((values) => {
            const visited = values[0];
            resolve([...new Set(values.flat())]
                .filter(x => x)
                .map(x => ({ 'id': x, 'visited': visited.includes(x) ? 1 : 0 })));
        });
    });
}

function getAllNodes(table, index) {
    if (!db) return;

    let txn = db.transaction([table], 'readonly');
    let objectStore = txn.objectStore("request_table");

    const promises = index.map (x =>
        new Promise((resolve, reject) => {
            let url = new Set();
            const index = objectStore.index(x);
            index.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if(cursor) {
                    url.add(getBaseDomain(cursor.key));
                    cursor.continue();
                }else{
                    resolve([...url]);
                }

            }
        })
    );

    return new Promise((resolve, reject) => {
        Promise.all(promises).then((values)=>{
            const visited = values[0];
            resolve([...new Set(values.flat())]
                .filter(x => x)
                .map(x => ({ 'id': x, 'visited': visited.includes(x) ? 1 : 0 })));
        });
    });
}

function getLinks(table, index) {
    if (!db) return;

    let txn = db.transaction([table], 'readonly');

    return new Promise((resolve, reject) => {
        let links = [];
        let objectStore = txn.objectStore(table);

        if (index){
            objectStore = objectStore.index(index);
        }

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const source = getBaseDomain(cursor.value.referer);
                const target = getBaseDomain(cursor.value.url);
                const page = getBaseDomain(cursor.value.page);
                if (source && target && source != target) {
                    const link = links.find(x => x.source == source && x.target == target);
                    const cookies = parseCookies(cursor.value.cookie);
                    if (link){
                        Object.assign(link.cookie,cookies);
                        if(!link.page.includes(page)){
                            link.page.push(page);
                        }
                        
                    }else{
                        links.push({ source: source, target: target, cookie: cookies, page : [page]});
                    }
                        
                }
                cursor.continue();
            } else {
                resolve(links);
            }
        }
    });
}


// Entry point of the analyzes
const requests = {
    name: "requests",
    description: "This plugins analyzes requests and stores cookies",
    author: "linc",
    init: initRequestsCrawler,
    delete: deleteRequestsCrawler,
    tables: requests_table_column,
    data: {
        "link_requests": getLinks.bind(null, "request_table"),
        "nodes_requests": getAllNodes.bind(null, "request_table", ["page", "referer", "url"]),
        "nodes_requests_with_cookies": getNodes.bind(null, "request_table", "cookie"),
        "link_requests_with_cookies": getLinks.bind(null, "request_table", "cookie"),
    }
}

export function plugins() {
    return requests;
}