<!-- Copyright (c) 2013, Stéphane Petitcolas
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
-->

<?php
// Edit the four values below
$PROXY_HOST = ""; // Proxy server address
$PROXY_PORT = "8080";    // Proxy server port
$PROXY_USER = "";    // Username
$PROXY_PASS = "";   // Password
// Username and Password are required only if your proxy server needs basic authentication

function safe_feof($fp, &$start = NULL) {
 $start = microtime(true);

 return feof($fp);
}
function continue_run($fichier)
{
  $tabfich=file($fichier);
  if (strcmp($tabfich[0],"1") == 0)
  {

    return FALSE;
  }
  return TRUE;
}
if ($PROXY_HOST != "")
{
	if ($PROXY_USER != "")
	{
		$auth = base64_encode("$PROXY_USER:$PROXY_PASS");
		stream_context_set_default(
		 [
	   	 'http' => [
	      	 'proxy' => "tcp://$PROXY_HOST:$PROXY_PORT",
	         'request_fulluri' => true,
		 'timeout' => 1,
		 'header' => "Proxy-Authorization: Basic $auth"
		  // Remove the 'header' option if proxy authentication is not required
			]]);
	}
	else
	{
		 stream_context_set_default(
                 [
                 'http' => [
                 'proxy' => "tcp://$PROXY_HOST:$PROXY_PORT",
                 'request_fulluri' => true,
                 'timeout' => 1
                  // Remove the 'header' option if proxy authentication is not required
                        ]]);

	}
}

$start = NULL;
$timeout = 9;
error_reporting(E_ALL);
$link = mysql_connect('localhost', 'user', '') or die('Impossible de se connecter : ' . mysql_error());
print "Connected successfully\n";
mysql_select_db('CookieViz') or die('Impossible de sélectionner la base de données'. mysql_error());
$fichier=getcwd()."\soft\.run";
$fp = fopen($fichier,'w');
fwrite($fp, '0');
fclose($fp);
$handle = popen('mitmdump -v', 'r');
stream_set_timeout($handle, 1);
while (continue_run($fichier) == TRUE)
{
    $flag = true;
    $tmp_buffer = "";
    $tmp_buffer = fgets($handle);
    if ($tmp_buffer != "\n")
    {
	$buffer = str_replace("\n", "", "$tmp_buffer");
	if (strpos($buffer, ' ') != false)
	{
		list($ip, $type, $url) = explode(" ", $buffer);
	}
	else
	{
		$url="";
	}
	if ($url != "")
    	{
		$referer="";
    		$cookie="";
    		while (($tmp_buffer = fgets($handle)))
    		{
			$buffer = "";
    			$buffer = str_replace("\n", "", "$tmp_buffer");
			if (strpos($buffer, ':') != false)
			{
				
				list($id_tmp, $value) = explode(": ", $buffer);
				$id = str_replace("    ", "", "$id_tmp");
				if (strcmp($id,"Referer")==0)
				{
					$referer = $value;
				}
				else if (strcmp($id,"Cookie") == 0 || strcmp($id,"Set-Cookie") == 0)
				{
					$cookie = htmlentities($value);
				}
			}
			else
			{
				break;
			}
		}
	  	$long_url= $url;
	  	$url_tmp = explode("/", $url);
	  	$url_tmp_bis = $url_tmp[0]."//".$url_tmp[2];
	  	$url_domains = explode(".", $url_tmp[2]);
	  	$count = count($url_domains);
	  	if ($count > 2)
	  	{
	  		$url_domain_tmp=$url_domains[$count-2].'.'.$url_domains[$count-1];
	  	}
	  	else if($count == 2)
	  	{
			$url_domain_tmp = $url_domains[0].'.'.$url_domains[1];
	  	}
		else
		{
			$url_domain_tmp = $url_domains[0];
		}
	  	$url_domain = str_replace("/", "", "$url_domain_tmp");
		if (strcmp($url_domain,"localhost") != 0)
		{
			if (strcmp($referer,"") != 0)
	  		{
				$referer_host = explode("/",$referer);
				$referer_domains = explode(".", $referer_host[2]);
		  		$count = count($referer_domains);
		  		if ($count > 2)
				{
					$referer_domain=$referer_domains[$count-2].'.'.$referer_domains[$count-1];
				}
				else
				{
					$referer_domain=$referer_domains[$count-1];
				}
				$referer_domain=str_replace("/","",$referer_domain);
		  		if (strcmp($referer_domain,"localhost:81") == 0)
		  		{
					$flag = false;
		  		}
	  		}
	  		else
	  		{
				$referer_domain = "";
		  		if (strcmp($url_domain,"255.250:1900") == 0)
		  		{
					$flag = false;
		  		}		
	  		}
	  		if ($flag == true && strcmp($url_domain, "")!= 0)
	  		{
				$path="/Users/seicnil/Sites/last_cookie_viz/ico//".$url_domain.".ico";
				if (!file_exists($path))
				{
					$max_try=0;
					$content = file_get_contents("http://www.google.com/s2/favicons?domain=".$url_domain);
					while ($content == FALSE && $max_try!= 3)
					{	
						$max_try++;
						$content = file_get_contents("http://www.google.com/s2/favicons?domain=".$url_domain);
					}
					if ($content != "")
					{
						$fp2=fopen($path,"w");
						fwrite($fp2, $content);
						fclose($fp2);
					}
				}
				$exist=FALSE;
		  		$timestamp = time();
				$query = 'SELECT url_domains,referer_domains, is_cookie,cookie, Cpt FROM url_referer WHERE url_domains = "'.$url_domain.'" AND referer_domains = "'.$referer_domain.'"';
				$result = mysql_query($query) or die('Échec de la requête : ' . mysql_error());
				if (mysql_num_rows($result) != 0)
				{
					while ($line = mysql_fetch_assoc($result))
               				{
						$cpt = $line["Cpt"];
              					$exist=TRUE;
               				}
				}
				if (strcmp($cookie, "") == 0)
		  		{
					if ($exist == FALSE)
					{
						$query = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie) VALUES ("'.$url_domain.'","'.$referer_domain.'","'.$timestamp.'", FALSE, "'.$cookie.'")';
					}
					else
					{
						$cpt++;
						$query = 'UPDATE url_referer SET cpt='.$cpt.', date ='.$timestamp.', cookie ="'.$cookie.'"  WHERE url_domains ="'.$url_domain.'" AND referer_domains = "'.$referer_domain.'"';
					}
		  		}
		  		else
		  		{
					if ($exist == FALSE)
					{
						$query = 'INSERT INTO url_referer (url_domains,referer_domains,date,is_cookie,cookie) VALUES ("'.$url_domain.'","'.$referer_domain.'","'.$timestamp.'", TRUE, "'.$cookie.'")';	
					}
					else
					{
						$cpt++;
						$query = 'UPDATE url_referer SET cpt='.$cpt.', date ='.$timestamp.', cookie ="'.$cookie.'", is_cookie = TRUE  WHERE url_domains ="'.$url_domain.'" AND referer_domains = "'.$referer_domain.'"';
					}	
		  		}	
  				$result = mysql_query($query) or die('Échec de la requête : ' . mysql_error());
			}
	  		}
		}
	 }
}
    pclose($handle);
    mysql_close($link) or die('Impossible de se déconnecter : ' . mysql_error());
    exit();

