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

const queries = [];


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

function push_database() {
    db.transaction(async function (tx) {
        while (queries.length > 0) {
            const query = queries.shift();
            await set_query(query, tx);
        }
    }, errorHandler);
}

function set_query(query, tx_db) {
    let query_tx = query;
    let url_domain = query["url_domain"];
    let referer_domain = query["referer_domain"];
    let cookie = query["cookie"];
    let timestamp = query["timestamp"];
    let query_select = 'SELECT url_domains,referer_domains, is_cookie,cookie, Cpt FROM url_referer WHERE url_domains = "' + url_domain + '" AND referer_domains = "' + referer_domain + '"';

    return new Promise((resolve, reject) => {

        function error_sql(error) {
            if (!error) {
                error = transaction.message;
            }

            // Problem happened with this query, leave for now
            queries.push(query_tx);
            reject();
        }

        function sucess_sql1() {
        }

        function sucess_sql2() {
            resolve();
        }

        tx_db.executeSql(query_select, [], function (tx, results) {
            let len = results.rows.length
            if (len > 0) {
                let cpt = results.rows[0]["Cpt"] + 1;
                let query_insert = 'UPDATE url_referer SET cpt =?, date = ?, is_cookie = ?, cookie = ? WHERE url_domains = ? AND referer_domains = ?';
                tx.executeSql(query_insert, [cpt, timestamp, cookie == "" ? false : true, cookie, url_domain, referer_domain], sucess_sql2, error_sql);
            } else {
                let query_insert = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie,Cpt) VALUES (?,?,?,?,?,?)'
                tx.executeSql(query_insert, [url_domain, referer_domain, timestamp, cookie == "" ? false : true, cookie, 0], sucess_sql2, error_sql);
                
            }
        }
            , sucess_sql1, error_sql);
    });
}

function processRequest(requestdetails) {

    if (!Array.isArray(requestdetails.requestHeaders)) return;

    let details = requestdetails;

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

    queries.push({ url_domain: host, referer_domain: referer, cookie: cookie, timestamp: Date.now() });
}

chrome.webRequest.onBeforeSendHeaders.addListener(processRequest, {
    urls: ["*://*/*"]
}, ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(processRequest, {
    urls: ["*://*/*"]
}, ['responseHeaders', 'extraHeaders']
);

setInterval(push_database, 1000);