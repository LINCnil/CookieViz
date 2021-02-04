const psl = require('psl');
const url_parser = require('url');

// Requests tables forms
const requests_table_column = {
    //Standard request fields
    request_table: ['requestId',
        'root_initiator_baseurl',
        'root_initiator_url',
        'initiator_url',
        'request_baseurl',
        'request_url',
        'referer',
        'referer_baseurl',
        'user-agent',
        'cookie'
    ],
    response_table: [
        'requestId',
        'root_initiator_url',
        'root_initiator_baseurl',
        'initiator_url',
        'request_url',
        'request_baseurl',
        'content-length',
        'set-cookie'
    ],
    cookie_table: ['requestId',
        'root_initiator_url',
        'root_initiator_baseurl',
        'initiator_url',
        'request_url',
        'request_baseurl',
        'referer_baseurl',
        'key',
        'value'],
    set_cookie_table: ['requestId',
        'root_initiator_url',
        'root_initiator_baseurl',
        'initiator_url',
        'request_url',
        'request_baseurl',
        'key',
        'value',
        'expires',
        'max-age',
        'domain',
        'path',
        'secure',
        'httponly',
        'samesite']
}


// Global stack for storing analysis in table
const cookie_queries = [];
const set_cookie_queries = [];
const request_queries = [];
const response_queries = [];
const all_frame_id = {};


// Crawler analyses
function getBaseDomain(full_url){
    if (full_url == null) return null;
    const formated_url = url_parser.parse(full_url);
    return psl.parse(formated_url.host).domain;
}

function getHostName(full_url){
    if (full_url == null) return null;
    const formated_url = url_parser.parse(full_url);
    return formated_url.hostname;
}

function extractCookies(cookies) {
    if(!cookies) return {};
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

function getRootInitiator(initiator_url, frameId, parentFrameId) {
    // Store parent frame id
    all_frame_id[frameId] = { url: initiator_url, parentFrameId: parentFrameId };

    // Check for parent id url
    if (parentFrameId > 0) {
        let parent_id = all_frame_id[parentFrameId];
        if(!parent_id) return initiator_url;
        let root_id = parent_id;
        while (root_id != null && root_id.parentFrameId > 0) {
            parent_id = root_id;
            root_id = all_frame_id[root_id.parentFrameId];
        }
        return root_id? root_id.url : parent_id.url;
    }

    return initiator_url;
}

function parseHeader(table, headerdetails){
    const results = {};
    
    for (var i = 0; i < headerdetails.length; i++) {
        const header = headerdetails[i];
        const name = header.name.toLowerCase();
        if (!table.includes(name)){
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
        let initiator_url = requestdetails.initiator;
        let request_url = requestdetails.url;
        let requestId = requestdetails.requestId;
        let initiator_baseurl = getBaseDomain(initiator_url);
        let request_baseurl = getBaseDomain(request_url);
        let referer_baseurl = null;
        
        // Parsing cookie header
        function parseCookies(cookie_header_strs) {
            const cookies = [];
            
            if (Array.isArray(cookie_header_strs)){
                for (const cookie_header_str of cookie_header_strs) {
                    cookies.push(extractCookies(cookie_header_str));
                }
            }else{
                cookies.push(extractCookies(cookie_header_strs));
            }
    
            for (const cookie of cookies) {
                for (const [key, value] of Object.entries(cookie)) {
                    cookie_queries.push({
                        requestId: requestId,
                        root_initiator_url: root_initiator_url,
                        root_initiator_baseurl: root_initiator_baseurl,
                        initiator_url: initiator_url,
                        request_url: request_url,
                        request_baseurl: request_baseurl,
                        referer_baseurl: referer_baseurl,
                        key: key,
                        value: value
                    });
                }
            }
        }


    
    if (initiator_baseurl == null || request_baseurl == null) return; // This is a not web requests


    // Checking if request is well formed
    let root_initiator_url = getRootInitiator(initiator_url, requestdetails.frameId, requestdetails.parentFrameId);
    let root_initiator_baseurl = getBaseDomain(root_initiator_url);
    const headers = parseHeader(requests_table_column['request_table'], requestdetails.requestHeaders);
    headers['requestId'] = requestId;
    headers['initiator_url'] = initiator_url;    
    headers['request_url'] = request_url;
    headers['request_baseurl'] = request_baseurl;
    headers['root_initiator_url'] = root_initiator_url;
    headers['root_initiator_baseurl'] = root_initiator_baseurl;
    headers['referer_baseurl'] = getBaseDomain(headers['referer']);
    if ('referer' in headers) referer_baseurl = getBaseDomain(headers['referer']);
    if ('cookie' in headers) parseCookies(headers['cookie']);

    request_queries.push(headers);

    popQueries({request_table : request_queries,
        cookie_table : cookie_queries
    });
}

function processResponse(responsedetails) {
    let initiator_url = responsedetails.initiator;
    let request_url = responsedetails.url;
    let requestId = responsedetails.requestId;
    let request_baseurl = getBaseDomain(request_url);

        // Parsing set cookie header
        function parseSetCookies(set_cookie_header_strs) {
            const set_cookies = [];

            if (Array.isArray(set_cookie_header_strs)){
                for (const set_cookie_header_str of set_cookie_header_strs) {
                    set_cookies.push(extractCookies(set_cookie_header_str));
                }
            }else{
                set_cookies.push(extractCookies(set_cookie_header_strs));
            }
            
            for (const set_cookie of set_cookies) {
                //Specific set cookies attributes
                const set_cookie_query = {
                    requestId: requestId,
                    root_initiator_url: root_initiator_url,
                    root_initiator_baseurl: root_initiator_baseurl,
                    initiator_url: initiator_url,
                    request_url: request_url,
                    request_baseurl: request_baseurl
                };
                const set_cookies_attributes = ['expires', 'max-age', 'domain', 'path', 'secure', 'httponly', 'samesite'];
    
                for (const [key, value] of Object.entries(set_cookie)) {
                    const variable = key.toLowerCase();
                    if (set_cookies_attributes.includes(variable)) {
                        set_cookie_query[variable] = value;
                    } else {
                        set_cookie_query['key'] = variable;
                        set_cookie_query['value'] = value;
                    }
                }
                set_cookie_queries.push(set_cookie_query);
            }
        }

        if (initiator_url == null || request_baseurl == null) return; // This is a none web requests


    // Checking if request is well formed
    let root_initiator_url = getRootInitiator(initiator_url, responsedetails.frameId, responsedetails.parentFrameId);
    let root_initiator_baseurl = getBaseDomain(root_initiator_url);
    const headers = parseHeader(requests_table_column['response_table'], responsedetails.responseHeaders);
    headers['requestId'] = requestId;
    headers['initiator_url'] = initiator_url;
    headers['request_url'] = request_url;
    headers['request_baseurl'] = request_baseurl;
    headers['root_initiator_url'] = root_initiator_url;
    headers['root_initiator_baseurl'] = root_initiator_baseurl;
    if ('set-cookie' in headers) parseSetCookies(headers['set-cookie']);

    response_queries.push(headers);

    popQueries({
        response_table: response_queries,
        set_cookie_table: set_cookie_queries
    });
}

function initRequestsCrawler() {
    createTables(requests_table_column);

    // Read cookie
    chrome.webRequest.onBeforeSendHeaders.addListener(processRequest, {
        urls: ["*://*/*"]
    }, ['requestHeaders', 'extraHeaders']
    );

    // Store cookie
    chrome.webRequest.onHeadersReceived.addListener(processResponse, {
        urls: ["*://*/*"]
    }, ['responseHeaders', 'extraHeaders']
    );
}

function deleteRequestsCrawler() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(processRequest);
    chrome.webRequest.onHeadersReceived.removeListener(processRequest);
}

function cleanRequestsTable() {
    deleteTables(requests_table_column);
}

function linkByInitiatorAndRequest(results){
    const filter_result = {};
    for (const result of results) {
        const source = getHostName(result["root_initiator_url"]);
        const target = result["request_baseurl"];

        if (!(source in filter_result)) filter_result[source] = {};
        if (!(target in filter_result[source])) filter_result[source][target] = {};

        const cookies = extractCookies(result["cookie"]);

        for (var key in cookies) {
            if (!(key in filter_result[source][target])){
                filter_result[source][target][key] = cookies[key];
            }
        }
    }

    return filter_result;
}

function nodeByRequest(results){
    const setVisited = new Set();
    const setThird = new Set();
    for (const result of results) {
        setVisited.add(getHostName(result["root_initiator_url"]));
        setThird.add(result["request_baseurl"]);
    }

    return []
    .concat(Array.from(setVisited).map(x => ({'id':x, 'visited':1})))
    .concat(Array.from(setThird).map(x => ({'id':x, 'visited':0})));
}


function groupByRequestAndKey(results){
    const filter_result = {};
    for (const result of results) {
        const request_baseurl = result["request_baseurl"];
        if (!(request_baseurl in filter_result))  filter_result[request_baseurl] = [];
        filter_result[request_baseurl].push(result["key"]);
    }

    return filter_result;
}


// Entry point of the analyzes
const requests = {
    name: "requests",
    description: "This plugins analyzes requests and stores cookies",
    author: "linc",
    init: initRequestsCrawler,
    delete: deleteRequestsCrawler,
    clean: cleanRequestsTable,
    data: {
        "link_requests":  getFromQuery.bind(null, 'request_table', ['request_baseurl', 'root_initiator_url', 'cookie'], "request_baseurl != root_initiator_baseurl", ['root_initiator_url', 'request_baseurl', 'cookie'], null, linkByInitiatorAndRequest),
        "nodes_requests":  getFromQuery.bind(null, 'request_table', ['request_baseurl', 'root_initiator_baseurl', 'root_initiator_url'], "request_baseurl != root_initiator_baseurl  and `root_initiator_baseurl` IS NOT NULL", ['root_initiator_url', 'request_baseurl'], null, nodeByRequest),
        "nodes_requests_with_cookies":  getFromQuery.bind(null, 'request_table', ['request_baseurl', 'root_initiator_url'], "request_baseurl != root_initiator_baseurl  and `cookie` IS NOT NULL", ['root_initiator_url', 'request_baseurl'], null, nodeByRequest),
        "link_requests_with_cookies":  getFromQuery.bind(null, 'request_table', ['request_baseurl', 'root_initiator_url', 'cookie'], "request_baseurl != root_initiator_baseurl and `cookie` IS NOT NULL and `root_initiator_baseurl` IS NOT NULL", ['root_initiator_url', 'request_baseurl', 'cookie'], null, linkByInitiatorAndRequest),
    }
}

export function plugins() {
    return requests;
}