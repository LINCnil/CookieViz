var databaseName = 'CookieViz2';
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
        throw transaction.message;
    }
    console.log( "error:" + error.message);
    throw error.message;
}

// Handler that avoid WebSQL disk error
function popQueries(request_table) {
    db.transaction(async function (tx) {
        for (const [table, queries] of Object.entries(request_table)) {
            while (queries.length > 0 ){              
                let query_str = 'INSERT INTO ' + table + ' (';
                let value_str = 'VALUES (';
                let key_values = queries.shift();
                let query_values = [];
                for (const [key, value] of Object.entries(key_values)) {
                    query_str += '`' +key + '`,';
                    value_str += '?,'
                    query_values.push(value);
                }

                let full_query = query_str.substring(0, query_str.length - 1) +  ') ' + value_str.substring(0, value_str.length - 1)  + ')'; // Remove last , character
                //console.log(full_query);
                //console.log(query_values);
                tx.executeSql(full_query, query_values);
            }
        }
    }, errorHandler);
}

// WebSQL query helper
async function getFromQuery(request_table, columms, where, groupbys, counts, filter_fn) {
    return new Promise((resolve, reject) => {
        db.transaction(async function (tx) {
            // Prepare query
            let query_str = 'SELECT ';
            for (const columm of columms) {
                query_str += '`' + columm + '`,';
            }

            if (Array.isArray(counts) && counts.length > 0) {
                for (const count of counts) {
                    query_str += ' COUNT(`' + count + '`), ';
                }
                query_str = query_str.substring(0, query_str.length - 1);
            }

            query_str = query_str.substring(0, query_str.length - 1) + ' ';



            query_str += ' FROM '+ request_table + ' ';
            if (where != null) {
                query_str += 'WHERE ' + where + ' ';
            }

            if (Array.isArray(groupbys) && groupbys.length > 0) {
                query_str += 'GROUP BY ';
                for (const groupby of groupbys) {
                    query_str += '`' + groupby + '`,';
                }
                query_str = query_str.substring(0, query_str.length - 1);
            }

            // Launch query
            tx.executeSql(query_str, [], function (tx, results) {
                const json_result = [];
                for (var i = 0; i < results.rows.length; i++) {
                    json_result.push(results.rows.item(i));
                }

                if (filter_fn){
                    resolve(filter_fn(json_result));
                    return;
                } 
                resolve(json_result);
            });
        }, errorHandler);
    });
}


// Handler that helps handling WebSQL
function createTables(tables) {
    db.transaction(async function (tx) {
        for (const [table, columns] of Object.entries(tables)) {
            let query_str = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
            for (const column of columns) {
                query_str += '`' +column + '`,'
            }
            let full_query = query_str.substring(0, query_str.length - 1) +  ')';
            //console.log(full_query);
            tx.executeSql(full_query);
        }
    }, errorHandler);
}

function deleteTables(tables) {
    db.transaction(function (tx) {
        for (const [table, columns] of Object.entries(tables)) {
            let query_str = 'DELETE FROM ' + table;
            tx.executeSql(query_str);
        }
    }, errorHandler);
}


