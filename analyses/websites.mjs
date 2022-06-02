const { parseAdsTxt } = require('ads.txt');
const psl = require('psl');

const websites_table_column = {
    websites_visited:[
        "url"
    ],
    websites_adstxt:[
    ]
}

var website = null;
var index = null;

// Data handling
function getVisitedList(){
    if (!db) return;

    let txn = db.transaction(["websites_visited"], 'readonly');

    return new Promise((resolve, reject) => {
        const objectStore = txn.objectStore("websites_visited");

        let urls = [];

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                urls.push(cursor.value.request_url);
                cursor.continue();
            } else {
                resolve(urls);
            }
        }
    });
}

function getAds() {
    if (!db) return;

    let txn = db.transaction(["websites_adstxt"], 'readonly');

    return new Promise((resolve, reject) => {
        const objectStore = txn.objectStore("websites_adstxt");

        let ads = [];

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                ads.push(cursor.value.domain);
                cursor.continue();
            } else {
                resolve(ads);
            }
        }
    });
}


// Crawler analyses
function storeAdsTxt(url){
    fetch(url).then(function(response) {
        if(response.ok) {
          response.text().then(function(ads_txt) {
            let { variables, fields } = parseAdsTxt(ads_txt);
            fields.forEach(field => {
                WriteToDb("websites_adstxt", {domain: field.domain, publisherAccountID: field.publisherAccountID, accountType: field.accountType, certificateAuthorityID: field.certificateAuthorityID});
            });
          });
        }
      })
      .catch(function(error) {
        //In case of error
        console.log("errror:" +error.message);
      });
}

function website_loaded(){
    let full_url= new URL(nwjsBrowser.src);
    let host = psl.parse(full_url.hostname).domain;

    WriteToDb("websites_visited", {request_url:host, full_url:full_url.href});

    //Check if ads.txt/app-ads.txt is present
    let host_name = full_url.protocol+'//'+full_url.hostname;
    storeAdsTxt(host_name+"/ads.txt");
    storeAdsTxt(host_name+"/app-ads.txt");
}

function initWebsitesAnalyses(){
    nwjsBrowser.addEventListener("contentload", website_loaded);
}

function eraseWebsitesAnalyses(){
    nwjsBrowser.removeEventListener("contentload", website_loaded);
}

// Entry point of the analyzes
const websites = {
    name : "websites",
    description : "This plugins stores visited website and there associated ads.txt",
    author:"linc",
    tables:websites_table_column,
    init:initWebsitesAnalyses,
    delete:eraseWebsitesAnalyses,
    data:{
        "visited_list": getVisitedList,
        "adstxt_list": getAds
    }
}

export function plugins() {
    return websites;
}


