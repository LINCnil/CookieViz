favicons ={};

const getFavicons = require('get-website-favicon')
var request = window.indexedDB.open("favicon", 3);


async function getFavicon(domain){
    favicons[domain] = "icons/favicons.png";
    getFavicons(domain).then(data=>{
        if (data.icons.length > 0){
            favicons[domain] = data.icons[0].src;
        }
    });
}

async function get_map() {
    return new Promise((resolve, reject) => {
        const load_query = 'SELECT * FROM url_referer GROUP BY id, url_domains, referer_domains, date ORDER BY date ASC';
        try {
            db.transaction(async function (tx) {

                tx.executeSql(load_query, [], async function (tx, results) {
                    var i = 0;
                    var len = results.rows.length, i;
                    const map = {};

                    for (i = 0; i < len; i++) {
                        const row = results.rows.item(i);
                        if (row['url_domains']) {
                            const url_domains = row['url_domains'];
                            if (url_domains in map) {
                                map[url_domains].increment(row);
                            } else {
                                map[url_domains] = new point(row, i);
                                
                                if (!favicons[url_domains]){
                                    // Load favicon for the website
                                    getFavicon(url_domains);
                                }
                                
                            }
                        }

                        if (row['referer_domains'] != "") {
                            map[row['url_domains']].add_link(row['referer_domains'], row['is_cookie']);
                        }

                    }

                    resolve(map);
                });
            }, errorHandler);
        } catch (error) {
            reject(errorHandler)
        }
    });
}
