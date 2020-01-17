var databaseName = 'CookieViz';
var versionNumber = '1.0';
var textDescription = 'Base de stockage des cookies';
var estimatedSizeOfDatabase = 2 * 1024 * 1024;

var db = openDatabase(
    databaseName,
    versionNumber,
    textDescription,
    estimatedSizeOfDatabase
);

function errorHandler(transaction, error) {
    if (!error){
        console.log( "error:" + transaction.message);
        return;
    }
    console.log( "error:" + error.message);
    throw error.message;
}

async function reset_graph(reload) {
    return new Promise((resolve, reject) => {
        db.transaction(async function (tx) {
            tx.executeSql("DELETE FROM url_referer", [], function (tx, results) {
                if (reload){
                    document.location.reload(true);
                }
                resolve();
            }
            );
        }, function(transaction, error){
            errorHandler(transaction, error);
            reject(error);
        } );
    });
}