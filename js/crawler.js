// Create table and insert one line
db.transaction(function (tx) {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS url_referer (
        id INTEGER PRIMARY KEY,
        url_domains varchar(255) NOT NULL,
        referer_domains varchar(255) NOT NULL,
        date varchar(255) NOT NULL,
        is_cookie tinyint(1) NOT NULL,
        cookie LONGTEXT NOT NULL,
        Cpt int(11) NOT NULL
        )`);
}, errorHandler);

let psl = require('psl');

function extractHostname(url) {
    let hostname;
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

function set_query(url_domain_tx, referer_domain_tx, cookie_tx, tx_db) {
    let timestamp = Date.now();
    let query_select = 'SELECT url_domains,referer_domains, is_cookie,cookie, Cpt FROM url_referer WHERE url_domains = "' + url_domain_tx + '" AND referer_domains = "' + referer_domain_tx + '"';
    let url_domain = url_domain_tx;
    let referer_domain = referer_domain_tx;
    let cookie = cookie_tx;
    tx_db.executeSql(query_select, [], function (tx, results) {
        let len = results.rows.length
        if (len > 0) {
            let cpt = results.rows[0]["Cpt"] + 1;
            let query_insert = 'UPDATE url_referer SET cpt = ' + cpt + ', date = ' + timestamp + ', is_cookie = ' + (cookie == "" ? false : true) + ', cookie ="' + cookie + '" WHERE url_domains = "' + url_domain + '" AND referer_domains = "' + referer_domain + '"';
            tx.executeSql(query_insert);
        } else {
            let query_insert = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie,Cpt) VALUES (?,?,?,?,?,?)'
            tx.executeSql(query_insert, [url_domain, referer_domain, timestamp, cookie == "" ? false : true, cookie, 0]);
        }
    }
        , errorHandler);
}

function processRequest(requestdetails){
    
    if (!Array.isArray(requestdetails.requestHeaders)) return;

    let details = requestdetails;
    db.transaction(function (tx) {
        let host = psl.get(extractHostname(details.url));
        let referer = "";
        let cookie = "";

        for (i = 0; i < details.requestHeaders.length; i++) {
            const header = details.requestHeaders[i];

            if (header.name.toLowerCase() === "referer") {
                referer = psl.get(extractHostname(header.value));
            } else if (header.name.toLowerCase() === "cookie") {
                cookie += header.value;
            } else if (header.name.toLowerCase() === "set-cookie") {
                cookie += header.value;
            }
        }
        set_query(host, referer, cookie, tx);
    }, errorHandler);

}

chrome.webRequest.onBeforeSendHeaders.addListener(processRequest, {
        urls: [ "*://*/*" ]
    }, ['requestHeaders','extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(processRequest, {
        urls: ["*://*/*"]
    }, ['responseHeaders', 'extraHeaders']
);