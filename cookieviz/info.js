async function get_info(domain_click)
{
	return new Promise((resolve, reject) => {
		try{
			db.transaction(async function (tx) {
				tx.executeSql("SELECT * FROM url_referer WHERE referer_domains='" + domain_click + "'", [], function (tx, results) {
					let result = '<table id="infos">';
					result += "<thead>";
					result += "<tr>";
					result += "<th>From</th>";
					result += "<th>To</th>";
					result += "<th>Cookies</th>";
					result += "</tr>";
					result += "</thead>";
					result += "<tbody>";
					for (i = 0; i < results.rows.length; i++) {
						const row = results.rows.item(i);
						result += "<tr>";
						if (row["is_cookie"] == "true") {
							result += "<td>" + row["referer_domains"];
							result += "<td>" + row["url_domains"];
							result += "<td>" + row["cookie"];
						}
						result += "<tr>";
					}

					tx.executeSql("SELECT * FROM url_referer WHERE url_domains='" + domain_click + "'", [], function (tx, results) {
						for (i = 0; i < results.rows.length; i++) {
							const row = results.rows.item(i);
							result += "<tr>";
							if (row["is_cookie"] == "true") {
								result += "<td>" + row["referer_domains"];
								result += "<td>" + row["url_domains"];
								result += "<td>" + row["cookie"];
							}
							result += "<tr>";
						}

						result += "</tbody>";
						result += "</table>";
						resolve(result);
					});
				});
			}, errorHandler);
		}catch (error){
			reject(error);
		}
	});
}