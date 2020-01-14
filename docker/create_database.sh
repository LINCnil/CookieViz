#!/bin/bash
set -e

mysql --protocol=socket -uroot  <<EOSQL
CREATE DATABASE CookieViz;

CREATE USER 'user'@'localhost' IDENTIFIED BY 'cookieviz';
GRANT ALL ON CookieViz.* TO 'user'@'localhost';

EOSQL