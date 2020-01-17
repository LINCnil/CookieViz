favicons ={};

const getFavicons = require('get-website-favicon')


function getFavicon(domain){
    favicons[domain] = "icons/favicons.png";
    getFavicons(domain).then(data=>{
        if (data.icons.length > 0){
            favicons[domain] = data.icons[0].src;
        }
    });
}

function updateFavicons() {
    db.transaction(async function (tx) {
        tx.executeSql('SELECT url_domains FROM url_referer GROUP BY url_domains', [], async function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                const row = results.rows.item(i);
                const url_domain = row['url_domains'];
                if (!favicons[url_domain]) {
                    // Load favicon for the website
                    getFavicon(url_domain);
                }
            }
        });
    }, errorHandler);
}


setInterval(updateFavicons, 1000);  