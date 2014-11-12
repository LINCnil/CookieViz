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



class point
{
	public $id;
	public $url_domains;
	public $referer_domains;
	public $date_time;
	public $url;
	public $referer;
	public $is_cookie;
	public $link;
	public $cpt;
	public $has_link;
	public $size;
	
	public function __construct($line, $i)
	{
		$this->id = $i;
		$this->url_domains = $line["url_domains"];
		$this->referer_domains = $line["referer_domains"];
		$this->date_time = $line["date"];
		$this->url = $line["url"];
		$this->referer = $line["referer"];
		$this->url = $line["url"];
		$this->is_cookie = $line["is_cookie"];
		$this->cpt = 0;
		$this->size = 13 + $line["Cpt"]/10;
		$this->has_link = 0;
	}
	
	public function add_link($referer, $cookie)
	{
		if ($this->is_cookie == 0 && $cookie == 1)
		{
			$this->is_cookie = 1;
		}
		$this->has_link++;
		$this->link[$this->cpt] = $referer;
		$this->cpt++;
	}
	/**
	 * @name as_link_with
	 * @param string target domaine
	 * @return bool false
	 * @return bool true
	 *
	 **/
	public function as_link_with($domain)
	{
		if ($this->has_link != 0)
		{
			foreach ($this->link as $test => $name_to_link)
			{
				if (strcmp($name_to_link, $domain) == 0)
				{	
					return TRUE;
				}
			}
		}	
		return FALSE;
	}
	
	public function increment($line)
	{
		$this->size = $this->size + $line["Cpt"]/10;
		$this->date_time = $line["date"];
	}
}
