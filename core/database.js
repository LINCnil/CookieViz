var databaseName = 'CookieViz2';
var versionNumber = '1';

var DBOpenRequest = null;
var db = null;
function initDb() {
    DBOpenRequest = indexedDB.open(
        databaseName,
        versionNumber
    );

    //check if the Database failed to open
    DBOpenRequest.onerror = (event) => {
        console.error('Error loading database.');
    };

    //check if the database openned successfully
    DBOpenRequest.onsuccess = (event) => {
        console.log('Your database is created');
        db = DBOpenRequest.result;
    };

    // create the tables object store and indexes
    DBOpenRequest.onupgradeneeded = (event) => {
        let local_db = event.target.result;
        loaded_plugins.forEach(plugin => {
            Object.keys(plugin.tables).forEach(table => {
                let idb_table = local_db.createObjectStore(table, {
                    autoIncrement: true
                });
                Object.keys(plugin.tables[table]).forEach(key => {
                    const table_name = plugin.tables[table][key];
                    idb_table.createIndex(table_name, table_name, { unique: false })
                }
                )
            })
        })
    }
}



// Handler that avoid WebSQL disk error
function WriteToDb(table, values, index) {
    if (!db) return;
    const txn = db.transaction(table, 'readwrite');
    const objectStore = txn.objectStore(table);
    return objectStore.put(values,index);
}

function cleanDB(tables) {
    if (!db) return;
    for (const table in tables){
        const txn = db.transaction([table], 'readwrite');
        var objectStore = txn.objectStore(table);
        objectStore.clear();
        objectStore.onsuccess = function(event) {
            console.log(table +"cleared !");
        };
    }
}