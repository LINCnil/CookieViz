from mitmproxy import ctx
import mysql.connector
import tldextract
import time
import os

os.system('chown -R mysql:mysql /var/lib/mysql /var/run/mysqld')
os.system('/usr/sbin/apache2ctl start')
os.system('/etc/init.d/mysql start')
os.system('sh ./create_database.sh')


class Collect:
    
    def __init__(self):
        self.db = mysql.connector.connect(
  host="localhost",
  user="user",
  passwd="cookieviz",
  database="CookieViz"
)
        self.cursor = self.db.cursor()
        self.cursor.execute("""CREATE TABLE IF NOT EXISTS `url_referer` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `url_domains` varchar(255) NOT NULL,
        `referer_domains` varchar(255) NOT NULL,
        `date` varchar(255) NOT NULL,
        `is_cookie` tinyint(1) NOT NULL,
        `cookie` LONGTEXT NOT NULL,
        `Cpt` int(11) NOT NULL,
        PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;""")   
        

    def __del__(self):
        self.cursor.close()
        self.db.close()

    def get_base_domain(self, str):
        host = tldextract.extract(str)
        return host.domain + "." + host.suffix

    def set_query(self, url_domain, referer_domain, cookie):
        timestamp = str(round(time.time()))
        query = 'SELECT url_domains,referer_domains, is_cookie,cookie, Cpt FROM url_referer WHERE url_domains = "' + url_domain +'" AND referer_domains = "' + referer_domain + '"'
        self.cursor.execute(query)
        row = self.cursor.fetchone()
        exist = False
        cpt = 0
        if row is not None:
             exist = True
             cpt = row[4]

        if cookie is None:
            if exist is False:
                query = 'INSERT INTO url_referer (url_domains,referer_domains,date, is_cookie,cookie,Cpt) VALUES (%s,%s,%s,%s,%s, 0)'
                self.cursor.execute(query, (url_domain, referer_domain ,timestamp, str(0), ""))
            else:
                query = 'UPDATE url_referer SET cpt = %s, date = %s, cookie = %s  WHERE url_domains = %s AND referer_domains = %s'
                cpt = cpt + 1
                self.cursor.execute(query, (str(cpt), timestamp, "", url_domain ,referer_domain))
        else:
            if exist is False:
                query = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie,Cpt) VALUES (%s,%s,%s,%s,%s,%s)'	
                self.cursor.execute(query, (url_domain, referer_domain ,timestamp, str(1), cookie, str(cpt)))
            else:
                query = 'UPDATE url_referer SET cpt = %s, date = %s, cookie = %s, is_cookie = %s  WHERE url_domains = %s AND referer_domains = %s'
                cpt = cpt + 1
                self.cursor.execute(query, (str(cpt), timestamp, cookie, str(1), url_domain ,referer_domain))

        self.db.commit()


    def update_db(self, request, response):
        host = None
        referer = ""
        cookie = None

        
        host = self.get_base_domain(request.host)
        if "Referer" in request.headers:
            referer = self.get_base_domain(request.headers["Referer"])
        elif "Cookie" in request.headers:
            cookie = str(request.headers["Cookie"])
        self.set_query(host, referer, cookie)
         
    def requestheaders(self, flow):
       self.update_db(flow.request, flow.response)

addons = [
    Collect()
]