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


require "point.php";

class point_map
{
	var $load_query;
	var $map;
	var $reference;
	var $last_date;
	var $domain;
	function __construct($domain)
	{
		$this->domain = $domain;
			$this->load_query = "SELECT * FROM url_referer GROUP BY url_domains, referer_domains, date ORDER BY date ASC";
			$this->load();
	}
	
	function load()
	{
		$result = mysql_query($this->load_query) or die ("Echec de la requête : ".$this->load_query." ". mysql_error());
		$i = 0;
		while ($line = mysql_fetch_assoc($result))
		{
			if ($line["url_domains"] != "")
			{
				if (!isset($this->map[$line["url_domains"]]))
				{
					$this->map[$line["url_domains"]] = new point($line, $i);
					$i++;
				}
				else
				{
					$this->map[$line["url_domains"]]->increment($line);
				}				
				if (isset($line["referer_domains"]) && $line["referer_domains"] != "")
				{
					$this->map[$line["url_domains"]]->add_link($line["referer_domains"], $line["is_cookie"]);
				}
			}
		}
	}
	function get_map()
	{
		return $this->map;
	}
}
?>