<?php
/*Copyright (c) 2013, Stéphane Petitcolas
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

require "connect.php";

if(isset($_GET["domain"]))
{
	$domain = mysql_real_escape_string($_GET["domain"]);
	
}
else
{
	exit;
}

echo '<table id="infos">';
 echo "<thead>";
 echo "<tr>";
 echo "<th>From</th>";
 echo "<th>To</th>";
 echo "<th>Cookies</th>";
 echo "</tr>";
 echo "</thead>";
 echo "<tbody>";
$query="SELECT * FROM url_referer WHERE referer_domains='".$domain."'GROUP BY url_domains, referer_domains";
$result = mysql_query($query) or die ("Echec de la requête : ".$query." ". mysql_error());
while ($line = mysql_fetch_assoc($result))
{
	echo "<tr>";
	if ($line["is_cookie"] == 1)
	{
		echo "<td>".$line["referer_domains"];
		echo "<td>".$line["url_domains"];
		echo "<td>".$line["cookie"];
	}
	echo "</tr>";
}
$query="SELECT * FROM url_referer WHERE url_domains='".$domain."'GROUP BY url_domains, referer_domains";
$result = mysql_query($query) or die ("Echec de la requête : ".$query." ". mysql_error());
while ($line = mysql_fetch_assoc($result))
{
	echo "<tr>";
	if ($line["is_cookie"] == 1)
	{
		echo "<td>".$line["referer_domains"];
		echo "<td>".$line["url_domains"];
		echo "<td>".$line["cookie"];
	}
	echo "</tr>";
}
echo "</tbody>";
echo "</table>";
require "disconnect.php";
?>