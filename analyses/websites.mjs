const psl = require('psl');
const { parseAdsTxt } = require('ads.txt');
const url = require('url');

const websites_queries = [];
const adstxt_queries = [];


// Data handling
async function getVisitedList(){
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            const load_query = 'SELECT request_url FROM websites_visited GROUP BY request_url';
            tx.executeSql(load_query, [], function (tx, results) {
                const visited = [];
                for (var i = 0; i < results.rows.length; i++){
                    const row = results.rows.item(i);
                    visited.push(row['request_url']);
                }
                resolve(visited);
            }, function (err){reject(err)});
        });
    }, errorHandler);
}

async function getAds() {
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            const load_query = 'SELECT domain FROM websites_adstxt GROUP BY domain';
            tx.executeSql(load_query, [], function (tx, results) {
                const ads = [];
                for (var i = 0; i < results.rows.length; i++){
                    const row = results.rows.item(i);
                    ads.push(row['domain']);
                }
                resolve(ads);
            }, function (err){reject(err)});
        });
    }, errorHandler);
}


// Crawler analyses
function storeAdsTxt(host, url){
    fetch(url).then(function(response) {
        if(response.ok) {
          response.text().then(function(ads_txt) {
            let { variables, fields } = parseAdsTxt(ads_txt);
            db.transaction(function (tx) {
                let query_insert = 'INSERT INTO websites_adstxt (host, domain,publisherAccountID,accountType,certificateAuthorityID) VALUES (?,?,?,?,?)';
                fields.forEach(field => tx.executeSql(query_insert, [host, field.domain, field.publisherAccountID, field.accountType, field.certificateAuthorityID]));
            }, errorHandler);
          });
        }
      })
      .catch(function(error) {
        //In case of error
        //console.log("errror:" +error.message);
      });
}

function website_loaded(){
    let full_url= url.parse(nwjsBrowser.contentWindow.window.location.href);
    let host = psl.parse(full_url.host).domain;

    if (!host) return;

    //Store visted website
    db.transaction(function (tx) {
        let query_insert = 'INSERT INTO websites_visited (request_url,full_url) VALUES (?,?)';
        tx.executeSql(query_insert, [host, full_url.href]);
    }, errorHandler);
    
    //Check if ads.txt/app-ads.txt is present
    let host_name = nwjsBrowser.contentWindow.window.location.protocol+'//'+nwjsBrowser.contentWindow.window.location.hostname;
    storeAdsTxt(host_name, host_name+"/ads.txt");
    storeAdsTxt(host_name, host_name+"/app-ads.txt");
}

function initWebsitesAnalyses(){
    // Create table and insert one line
    db.transaction(function (tx) {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS websites_visited (
        request_url varchar(255) NOT NULL,
        full_url varchar(255) NOT NULL
        )`);

        tx.executeSql(`CREATE TABLE IF NOT EXISTS websites_adstxt (
            host varchar(255) NOT NULL,
            domain varchar(255),
            publisherAccountID varchar(255),
            accountType varchar(255),
            certificateAuthorityID varchar(255)
            )`);
    }, errorHandler);

    nwjsBrowser.addEventListener("load", website_loaded);
}

function eraseWebsitesAnalyses(){
    nwjsBrowser.removeEventListener("load", website_loaded);
}

function cleanWebsitesAnalyses() {
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM websites_visited", []);
        tx.executeSql("DELETE FROM websites_adstxt", []);
    }, errorHandler);
}

// Entry point of the analyzes
const websites = {
    name : "websites",
    description : "This plugins stores visited website and there associated ads.txt",
    author:"linc",
    init:initWebsitesAnalyses,
    delete:eraseWebsitesAnalyses,
    clean:cleanWebsitesAnalyses,
    data:{
        "visited_list": getVisitedList,
        "adstxt_list": getAds
    }
}

export function plugins() {
    return websites;
}


