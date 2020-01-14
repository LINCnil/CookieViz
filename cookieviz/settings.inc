<?php

/**
 * This file holds the database settings used by CookieViz.
 * Before using CookieViz, you should set up a new database and user.
 * Then, update this file with the correct credentials.
 */

/**
 * The database server used by CookieViz.
 * Default is 'localhost' and should be fine for most cases.
 * If 'localhost' doesn't work and the database runs locally, try '127.0.0.1'.
 */
define('DB_SERVER', 'localhost');

/**
 * The database used by CookieViz. Default is 'CookieViz'.
 * You shouldn't have to change it, but the option is here just in case.
 */
define('DB_NAME', 'CookieViz');

/**
 * It is recommended that you use a unique user.
 * Here, we're using 'CookieViz', but you may change that to any valid user.
 */
define('DB_USER', 'user');

/**
 * The password of the CookieViz database user.
 */
define('DB_PASSWD', 'cookieviz');
