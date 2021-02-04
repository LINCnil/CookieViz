const psl = require('psl');
const getFavicons = require('get-website-favicon');
var favicons ={};

function extractHostname(url, keep_protocol) {
    let hostname;

    if (!url) return "";
    
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else 
    {
        hostname = url.split('/')[0];
    }
    
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}


function processFaviconRequest(requestdetails) {
    //Parsing all cookies
    let initiator = psl.get(extractHostname(requestdetails.initiator));
    let request_url = psl.get(extractHostname(requestdetails.url));

    function checkFavicon(request) {
        if (request in favicons) {
            return;
        }
        favicons[request] = null;
        getFavicons(request).then(data => {
            db.transaction(function (tx) {
                const insert_query = 'INSERT OR IGNORE INTO favicons (website, favicon) VALUES (?,?)';
                if (data.icons.length > 0) {
                    favicons[request] = data.icons[0].src;
                    tx.executeSql(insert_query, [request, data.icons[0].src]);
                } else {
                    tx.executeSql(insert_query, [request, null]);
                }
            });
        });
    }

    if (initiator) checkFavicon(initiator);
    if (request_url) checkFavicon(request_url);
}

function initFaviconCrawler(){
    db.transaction(function (tx) {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS favicons (
        website varchar(255) UNIQUE NOT NULL,
        favicon varchar(255)
        )`);

    }, errorHandler);

    db.transaction(function (tx) {
        const load_query = 'SELECT * FROM favicons';
        tx.executeSql(load_query, [], async function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                const row = results.rows.item(i);
                favicons[row['website']]= row['favicon'];
            }
        });
    });

    // Read cookie
    chrome.webRequest.onBeforeSendHeaders.addListener(processFaviconRequest, {
        urls: ["*://*/*"]
    }, []
    );
}

function deleteFaviconCrawler(){
    chrome.webRequest.onBeforeSendHeaders.removeListener(processFaviconRequest);
}

async function cleanFaviconTrigger(){
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM favicons", [], function(tx){
                    favicons = {};
                    resolve();
            });
        });
    });
}

async function get_all_favicons(){
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            const load_query = 'SELECT * FROM favicons';
            tx.executeSql(load_query, [], async function (tx, results) {
                const favicons = {};
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    const row = results.rows.item(i);
                    favicons[row['website']]= row['favicon'];
                }
                resolve(favicons);
            });
        });
    }, errorHandler);
}


// Template for plugins
const plugins_favicon = {
    name : "favicons",
    description : "This plugins stores favicons of every website that send/receive requests",
    author:"linc",
    init:initFaviconCrawler,
    delete:deleteFaviconCrawler,
    clean:cleanFaviconTrigger,
    data:{
        "get_all_favicons": get_all_favicons
    }
}



// Entry point of plugins
export function plugins() {
    return plugins_favicon;
}


