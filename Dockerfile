# 
#This file is part of CookieViz

#CookieViz is free software: you can redistribute it and/or modify
#it under the terms of the GNU General Public License as published by
#the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.

#CookieViz is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU General Public License for more details.

#You should have received a copy of the GNU General Public License
#along with CookieViz.  If not, see <http://www.gnu.org/licenses/>.



FROM ubuntu:18.10
LABEL Name=cookieviz Version=0.0.1

# Update Ubuntu Software repository
RUN apt-get update && apt-get -y upgrade

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3-dev python3-pip libffi-dev libssl-dev \
    apache2 mysql-server php-mysql python3-mysql.connector python3-tldextract php mitmproxy && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 80 8080

# Copy this repo into place.
ADD cookieviz /var/www/cookieviz

# Update the default apache site with the config we created.
ADD docker/apache-config.conf /etc/apache2/sites-enabled/000-default.conf

WORKDIR /app
ADD docker/create_database.sh .
ADD docker/docker_mitmdump.py .

CMD ["mitmdump", "-s", "./docker_mitmdump.py"]
