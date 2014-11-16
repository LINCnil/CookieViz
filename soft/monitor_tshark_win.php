<?php

/* Copyright (c) 2013, Stéphane Petitcolas
  This file is part of CookieViz

  CookieViz is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  CookieViz is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with CookieViz.  If not, see <http://www.gnu.org/licenses/>.
 */

// Edit the four values below
$PROXY_HOST = NULL; // Proxy server address
$PROXY_PORT = NULL; // Proxy server port
$PROXY_USER = NULL; // Username
$PROXY_PASS = NULL; // Password
// Username and Password are required only if your proxy server needs basic authentication

function esip($ip_addr) {
    
    if (filter_var($ip_addr, FILTER_VALIDATE_IP)) {
        return TRUE;
    } else {
        return FALSE;
    }
    
}

function domain($domainb) {
    
    $bits = explode('/', $domainb);
    if ($bits[0] == 'http:' || $bits[0] == 'https:') {
        $domainb = $bits[2];
    } else {
        $domainb = $bits[0];
    }
    unset($bits);
    $bits = explode('.', $domainb);
    $idz  = count($bits);
    $idz-=3;
    if (strlen($bits[($idz + 2)]) == 2) {
        $url = $bits[$idz] . '.' . $bits[($idz + 1)] . '.' . $bits[($idz + 2)];
    } else if (strlen($bits[($idz + 2)]) == 0) {
        $url = $bits[($idz)] . '.' . $bits[($idz + 1)];
    } else {
        $url = $bits[($idz + 1)] . '.' . $bits[($idz + 2)];
    }
    return $url;
}

function safe_feof($fp, &$start = NULL) {
    $start = microtime(true);

    return feof($fp);
}

function continue_run($fichier) {
    $tabfich = file($fichier);
    if (strcmp($tabfich[0], "1") == 0) {
        return FALSE;
    }
    return TRUE;
}

function generer_mot_de_passe($nb_caractere = 12) {
    $mot_de_passe = "";

    $chaine         = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $longeur_chaine = strlen($chaine);

    for ($i = 1; $i <= $nb_caractere; $i++) {
        $place_aleatoire = mt_rand(0, ($longeur_chaine - 1));
        $mot_de_passe .= $chaine[$place_aleatoire];
    }

    return $mot_de_passe;
}

function init() {
    $fichier = getcwd() . "\soft\.install";
    if (file_exists($fichier)) {
        $fp  = fopen($fichier, 'r');
        $mdp = fgets($fp);
        fclose($fp);
        return $mdp;
    }

    $link   = mysqli_connect('localhost', 'root', 'mdpinit') or die('Impossible de se connecter : ' . mysqli_error());
    $mdp    = generer_mot_de_passe();
    $query  = "GRANT ALL PRIVILEGES ON CookieViz.* TO 'root'@'localhost' IDENTIFIED BY '" . $mdp . "'";
    $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
    $fp     = fopen($fichier, 'w+');
    fwrite($fp, $mdp);
    fclose($fp);
    return $mdp;
}

$mdp = init();
if ($PROXY_HOST != "") {
    if ($PROXY_USER != "" && $PROXY_PASS != "") {
        print "Connected with proxy auth\n";
        $auth = base64_encode("$PROXY_USER:$PROXY_PASS");
        stream_context_set_default(
                [
                    'http' => [
                        'proxy'           => "tcp://$PROXY_HOST:$PROXY_PORT",
                        'request_fulluri' => true,
                        'timeout'         => 1,
                        'header'          => "Proxy-Authorization: Basic $auth"]
        ]);
    } else {
        print "Connected with proxy whitout auth\n";
        stream_context_set_default(
                [
                    'http' => [
                        'proxy'           => "tcp://$PROXY_HOST:$PROXY_PORT",
                        'request_fulluri' => true,
                        'timeout'         => 1]
        ]);
    }
}
$start   = NULL;
$timeout = 9;
error_reporting(E_ALL);
$link    = mysqli_connect('localhost', 'root', $mdp) or die('Impossible de se connecter : ' . mysqli_error());
print "Connected successfully\n";
mysqli_select_db('CookieViz') or die('Impossible de sélectionner la base de données' . mysqli_error());
$fichier = getcwd() . "\soft\.run";
$fp      = fopen($fichier, 'w');
fwrite($fp, '0');
fclose($fp);
//print 'tshark -i '.$argv[1].' -R "http" -T fields -e http.host -e http.cookie -e http.referer'; 

$handle     = popen('"' . getcwd() . '\wireshark\App\Wireshark\tshark.exe" -i ' . $argv[1] . ' -R "http" -T fields -e http.host -e http.cookie -e http.referer', 'r');
stream_set_timeout($handle, 1);

while (continue_run($fichier) == TRUE && $tmp_buffer = stream_get_line($handle, 0, "\n")) {
    $flag = true;


    $buffer   = str_replace("\n", "", "$tmp_buffer");
    //print "val : ".$buffer." :END\n";
    list($url, $cookie, $referer) = explode("	", $buffer);
    
    $long_url = "http://" . $url . "/";
    
    if (filter_var($long_url, FILTER_VALIDATE_URL)) {        
        $tab_url     = parse_url($long_url);
        $check_url   = esip($tab_url["host"]);
        $url_domains = $tab_url["host"];
        
        if (!$check_url) {
            if ($url_domains != NULL) {
                $url_domain = domain($url_domains);
            } else {
                $url_domain = domain($long_url);
            }
            $url_domains = explode(".", $url_domain);
            $count       = count($url_domains);
            if ($count > 2) {
                $url_domain = $url_domains[$count - 2] . '.' . $url_domains[$count - 1];
            }
        } else {
            $url_domain = $tab_url["host"];
        }
        
        if (strcmp($referer, "") != 0) {
            $tab_referer     = parse_url($referer);
            $referer_domains = $tab_referer["host"];
            $check           = esip($tab_referer["host"]);
            
            if ($check == FALSE) {
                
                if ($referer_domains != "") {
                    $referer_domain = domain($referer_domains);
                } else {
                    $referer_domain = domain($referer);
                }
                
                $referer_domains = explode(".", $referer_domain);
                $count           = count($referer_domains);
                
                if ($count > 2) {
                    $referer_domain = $referer_domains[$count - 2] . '.' . $referer_domains[$count - 1];
                }
                
            } else {
                $referer_domain = $referer_domains;
            }

            if (strcmp($referer_domain, "localhost:81") == 0) {
                $flag = false;
            }
        } else {
            $referer_domain = "";
            if (strcmp($url_domain, "255.250:1900") == 0) {
                $flag = false;
            }
        }
        if ($flag == true && strcmp($url_domain, "") != 0) {
            $path = getcwd() . "\WWW\cookie_viz\ico\\" . $url_domain . ".ico";
            if (!file_exists($path)) {
                $max_try = 0;
                $content = file_get_contents("http://www.google.com/s2/favicons?domain=" . $url_domain);
                //$content = file_get_contents("http://www.".$url_domain."/favicon.ico");
                while ($content == FALSE && $max_try != 3) {
                    $max_try++;
                    $content = file_get_contents("http://www.google.com/s2/favicons?domain=" . $url_domain);
                    //$content = file_get_contents("http://www.".$url_domain."/favicon.ico");
                    //print "http://www.".$url_domain."/favicon.ico";
                }
                if ($content != false) {
                    $fp2 = fopen($path, "w");
                    fwrite($fp2, $content);
                    fclose($fp2);
                }
            }

            $timestamp = time();
            if (strcmp($referer_domain, "") != 0) {
                $query  = 'SELECT url_domains FROM url_referer WHERE url_domains = "' . $referer_domain . '" AND referer_domains = ""';
                $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                if (mysqli_num_rows($result) != 0) {
                    $exist = TRUE;
                } else {
                    $exist = FALSE;
                }
                if ($exist == FALSE) {
                    $query  = 'INSERT INTO url_referer (url_domains,date,is_cookie,cookie) VALUES ("' . $referer_domain . '","' . $timestamp . '", FALSE, "' . $cookie . '")';
                    $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                }
            }
            $exist = FALSE;
            if (strcmp($cookie, "") == 0) {
                $query  = 'SELECT url_domains,referer_domains, is_cookie,cookie, Cpt FROM url_referer WHERE url_domains = "' . $url_domain . '" AND referer_domains = "' . $referer_domain . '" AND is_cookie = FALSE';
                $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                if (mysqli_num_rows($result) != 0) {
                    while ($line = mysqli_fetch_assoc($result)) {
                        $cpt   = $line["Cpt"];
                        $exist = TRUE;
                    }
                }
                if ($exist == FALSE) {
                    $query = 'INSERT INTO url_referer (url_domains,referer_domains,date, is_cookie,cookie) VALUES ("' . $url_domain . '","' . $referer_domain . '","' . $timestamp . '", FALSE, "' . $cookie . '")';
                } else {
                    $cpt++;
                    $query  = 'UPDATE url_referer SET cpt=' . $cpt . ', date =' . $timestamp . '  WHERE url_domains ="' . $url_domain . '" AND referer_domains = "' . $referer_domain . '" AND is_cookie = FALSE';
                    $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                }
            } else {
                $query  = 'SELECT url_domains,referer_domains,is_cookie,cookie, Cpt FROM url_referer WHERE url_domains ="' . $url_domain . '" AND referer_domains = "' . $referer_domain . '" AND is_cookie = TRUE';
                $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                if (mysqli_num_rows($result) != 0) {
                    while ($line = mysqli_fetch_assoc($result)) {
                        $cpt   = $line["Cpt"];
                        $exist = TRUE;
                    }
                }if ($exist == FALSE) {
                    $query = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie) VALUES ("' . $url_domain . '","' . $referer_domain . '","' . $timestamp . '", TRUE, "' . $cookie . '")';
                } else {
                    $cpt++;
                    $query  = 'UPDATE url_referer SET cpt=' . $cpt . ', date =' . $timestamp . ' WHERE url_domains ="' . $url_domain . '" AND referer_domains = "' . $referer_domain . '" AND is_cookie = TRUE';
                    $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
                }
            }

            $result = mysqli_query($query) or die('Échec de la requête : ' . mysqli_error());
        } else {
            print "invalid url\n";
        }
    }
}
pclose($handle);
mysqli_close($link) or die('Impossible de se déconnecter : ' . mysqli_error());
exit();

