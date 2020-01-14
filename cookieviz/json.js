
var init_max_date = 0;

async function get_json(max_date, domain) {
    
        const map = await get_map();
        const write_nodes = [];
        const write_links = [];
        var cpt_unique_nodes = 0;
        var cpt_unique_links = 0;
        var color = "#00f0ff";
        var min_date = 0;
        var cpt = 0;

        if (domain == "") {
            for (var key_map in map) {
                const point = map[key_map];
                if (point.date_time > init_max_date) {
                    var group = 1;
                    if (cpt_unique_nodes == 0 && point.url_domains) {
                        write_nodes.push({ name: point.url_domains, group: group, date: point.date_time, size: point.size, link: 0 });
                        if (max_date < point.date_time) {
                            max_date = point.date_time;
                        }
                        cpt_unique_nodes = 1;
                        if (point.has_link != 0) {
                            for (var key_link in point.link) {
                                const name_to_link = point.link[key_link];
                                const point_to_link = map[name_to_link];
                                if (point.id != point_to_link.id) {
                                    if (cpt_unique_links == 0) {
                                        write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                        cpt_unique_links = 1;
                                    } else {
                                        write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                    }
                                }
                            }
                        }
                    } else {
                        if (point.date_time >= init_max_date) {
                            if (point.url_domains) {
                                write_nodes.push({ name: point.url_domains, group: group, date: point.date_time, size: point.size, link: 0 });
                            }
                            if (max_date < point.date_time) {
                                max_date = point.date_time;
                            }
                            if (point.has_link != 0) {
                                for (var key_link in point.link) {
                                    const name_to_link = point.link[key_link];
                                    if (map[name_to_link]) {
                                        const point_to_link = map[name_to_link];
                                        if (point.id != point_to_link.id) {
                                            if (point.is_cookie == 1) {
                                                color = '#ff0000';
                                            } else {
                                                color = '#00f0ff';
                                            }
                                            if (cpt_unique_links == 0) {
                                                write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                                cpt_unique_links = 1;
                                            } else {
                                                write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } else {
            for (var key_map in map) {
                const point = map[key_map];
                if (point.date_time > init_max_date) {
                    group = 1;
                    if (cpt_unique_nodes == 0 && (point.url_domains == domain || (point.url_domains != domain && point.as_link_with(domain) == true))) {
                        write_nodes.push({ name: point.url_domains, group: group, date: point.date_time, size: point.size, link: point.has_link });

                        if (max_date < point.date_time) {
                            max_date = point.date_time;
                        }
                        cpt_unique_nodes = 1;
                        if (point.has_link != 0) {
                            for (var key_link in point.link) {
                                const name_to_link = point.link[key_link];
                                var point_to_link = map[name_to_link];
                                if (map[name_to_link]) {
                                    point_to_link = map[name_to_link];
                                    if (point.id != point_to_link.id) {
                                        if (point_to_link.url_domains == domain || point.url_domains == domain) {
                                            if (cpt_unique_links == 0) {
                                                tmp_point = map[point_to_link.url_domains];
                                                write_nodes.push({ name: tmp_point.url_domains, group: group, date: tmp_point.date_time, size: tmp_point.size, link: point.has_link });
                                                write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                                cpt_unique_links = 1;
                                            } else {
                                                tmp_point = map[point_to_link.url_domains];
                                                if (tmp_point.url_domains) {
                                                    write_nodes.push({ name: tmp_point.url_domains, group: group, date: tmp_point.date_time, size: tmp_point.size, link: point.has_link });

                                                    write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (point.date_time >= init_max_date && (domain == point.url_domains == 0 || (domain == point.url_domains != 0 && point.as_link_with(domain) != 0))) {

                                write_nodes.push({ name: point.url_domains, group: group, date: point.date_time, size: point.size, link: point.has_link });

                                if (max_date > point.date_time) {
                                    max_date = point.date_time;
                                }
                                if (point.has_link != 0) {
                                    for (var key_link in point.link) {
                                        const name_to_link = point.link[key_link];
                                        if (map[name_to_link]) {
                                            var point_to_link = map[name_to_link];
                                            if (point.id != point_to_link.id) {
                                                if (point.is_cookie == 1) {
                                                    color = "#ff0000";
                                                } else {
                                                    color = "#00f0ff";
                                                }
                                                if (point_to_link.url_domains == domain == 0 || point.url_domains == domain) {
                                                    if (cpt_unique_links == 0) {
                                                        tmp_point = map[point_to_link.url_domains];
                                                        write_nodes.push({ name: tmp_point.url_domains, group: group, date: tmp_point.date_time, size: tmp_point.size, link: point.has_link });
                                                    }
                                                    write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                                    cpt_unique_links = 1;
                                                } else {
                                                    tmp_point = map[point_to_link.url_domains];
                                                    write_nodes.push({ name: tmp_point.url_domains, group: group, date: tmp_point.date_time, size: tmp_point.size, link: point.has_link });
                                                    write_links.push({ source: point_to_link.url_domains, target: point.url_domains, value: group, cookie: point.is_cookie });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return { inf_nodes: write_nodes, inf_links: write_links, max_date: max_date, cpt: cpt };
}
