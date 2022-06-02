const psl = require('psl');
const getFavicons = require('get-website-favicon');

const favicons_table_column = {
    "favicons": [
        "website"
    ]
}

const favicons_stored = [];

function extractHostname(url, keep_protocol) {
    let hostname;

    if (!url) return "";

    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}


function processFaviconRequest(requestdetails) {
    if (!db) return;

    //Parsing all cookies
    let initiator = psl.get(extractHostname(requestdetails.initiator));
    let request_url = psl.get(extractHostname(requestdetails.url));

    function checkFavicon(request) {
        favicons_stored.push(request);
        let txn = db.transaction(["favicons"], 'readonly');
        let objectStore = txn.objectStore('favicons');
        var index = objectStore.index('website');
        
        index.get(request).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                return;
            } else {
                getFavicons(request).then(data => {
                    if (data.icons.length > 0) {
                        WriteToDb("favicons", { website: request, favicon: data.icons[0].src });
                    } else {
                        WriteToDb("favicons", { website: request, favicon: null });
                    }
                });
            }
        };
    }

    if (initiator && !favicons_stored.includes(initiator)) checkFavicon(initiator);
    if (request_url && !favicons_stored.includes(request_url)) checkFavicon(request_url);
}

function initFaviconCrawler() {
    // Read cookie
    chrome.webRequest.onBeforeSendHeaders.addListener(processFaviconRequest, {
        urls: ["*://*/*"]
    }, []
    );
}

function deleteFaviconCrawler() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(processFaviconRequest);
}

async function get_all_favicons() {
    return new Promise((resolve, reject) => {
        const favicons = {};
        let txn = db.transaction(["favicons"], 'readonly');
        const objectStore = txn.objectStore("favicons");
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                favicons[cursor.value.website]= cursor.value.favicon;
                cursor.continue();
            } else {
                resolve(favicons);
            }
        }
    });
}


// Template for plugins
const plugins_favicon = {
    name: "favicons",
    description: "This plugins stores favicons of every website that send/receive requests",
    author: "linc",
    tables: favicons_table_column,
    init: initFaviconCrawler,
    delete: deleteFaviconCrawler,
    data: {
        "get_all_favicons": get_all_favicons
    }
}



// Entry point of plugins
export function plugins() {
    return plugins_favicon;
}


