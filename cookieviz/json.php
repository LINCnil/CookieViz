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
along with CookieViz.  If not, see <http://www.gnu.org/licenses/>.*/


require "connect.php";
require "load_point.php";
$domain="";
$init_max_date=0;

if(isset($_GET["max_date"]))
{
	$init_max_date = 	mysql_real_escape_string($_GET["max_date"]);
	if (!is_numeric($init_max_date))
	{
		$init_max_date="";
	}
}

if(isset($_GET["domain"]))
{
	$domain = mysql_real_escape_string($_GET["domain"]);
}

$max_date = $init_max_date;
$point_map = new point_map($domain);
$map = $point_map->get_map();
$write_nodes='[';
$write_links='[';
$cpt_unique_nodes=0;
$cpt_unique_links=0;
$color = "#00f0ff";
$min_date=0;
$cpt=0;
if (isset($map))
{
	if (strcmp($domain, "") == 0)
	{
		foreach ($map as $url_domain => $point)
		{
 		if ($point->date_time > $init_max_date)
		{
			$group=1;
		if ($cpt_unique_nodes == 0 && !isset($is_writen[$point->url_domains]))  
		{
			$write_nodes.='{"name":"'.$point->url_domains.'","group":'.$group.', "date":"'.$point->date_time.'", "size":'.$point->size.', "link":"0"}';
			$is_writen[$point->url_domains] = TRUE;
			if ($max_date < $point->date_time)
			{	
				$max_date=$point->date_time;
			}	
			$cpt_unique_nodes = 1;
			if ($point->has_link != 0)
			{
				foreach ($point->link as $id => $name_to_link)
				{
					$point_to_link = $map[$name_to_link];
					if ($point->id != $point_to_link->id)
					{
						if ($cpt_unique_links == 0)
						{
							$write_links.='{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';		
							$cpt_unique_links = 1;
						}
						else
						{
							$write_links.=',{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';
						}
					}
				}
			}
		}
		else
		{
			if ($point->date_time >= $init_max_date)
			{
				if (!isset($is_writen[$point->url_domains]))
				{
					$write_nodes.=',{"name":"'.$point->url_domains.'","group":'.$group.', "date":"'.$point->date_time.'", "size":'.$point->size.', "link":"0"}';
					$is_writen[$point->url_domains] = TRUE;
				}
				if ($max_date < $point->date_time)
				{	
					$max_date=$point->date_time;
				}			      
				if ($point->has_link != 0)
				{
					foreach ($point->link as $id => $name_to_link)
					{
						if (isset($map[$name_to_link]))
						{
							$point_to_link = $map[$name_to_link];
							if ($point->id != $point_to_link->id)
							{
								if ($point->is_cookie == TRUE)
								{
									$color = "#ff0000";
								}
								else
								{
									$color = "#00f0ff";
								}
								if ($cpt_unique_links == 0)
								{
									$write_links.='{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';			
									$cpt_unique_links = 1;
								}
								else
								{
									$write_links.=',{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';
								}
							}
						}
					}
				}
			}
		}}
		}
	}
	else
	{
		foreach ($map as $url_domain => $point)
		{
 		if ($point->date_time > $init_max_date)
		{
			$group=1;
		if ($cpt_unique_nodes == 0 && (strcmp($domain, $point->url_domains) == 0  || (strcmp($domain, $point->url_domains) != 0 && $point->as_link_with($domain) == TRUE) ))  
		{
			if (!isset($is_writen[$point->url_domains]))
			{
				$write_nodes.='{"name":"'.$point->url_domains.'","group":'.$group.', "date":"'.$point->date_time.'", "size":'.$point->size.', "link":"'.$point->has_link.'"}';
				$is_writen[$point->url_domains] =  TRUE;
			}
			if ($max_date < $point->date_time)
			{	
				$max_date=$point->date_time;
			}	
			$cpt_unique_nodes = 1;
			if ($point->has_link != 0)
			{
				foreach ($point->link as $id => $name_to_link)
				{
					if (isset($map[$name_to_link]))
					{
						$point_to_link = $map[$name_to_link];
						if ($point->id != $point_to_link->id)
						{
							if (strcmp($point_to_link->url_domains, $domain) == 0 || strcmp($point->url_domains, $domain) == 0)
							{
								if ($cpt_unique_links == 0)
								{
									$tmp_point = $map[$point_to_link->url_domains];
									if (!isset($is_writen[$tmp_point->url_domains]))
                        						{
										$write_nodes.=',{"name":"'.$tmp_point->url_domains.'","group":'.$group.', "date":"'.$tmp_point->date_time.'", "size":'.$tmp_point->size.', "link":"'.$point->has_link.'"}';
										$is_writen[$tmp_point->url_domains] = TRUE;
									}
									$write_links.='{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';			
									$cpt_unique_links = 1;
								}
								else
								{
									$tmp_point = $map[$point_to_link->url_domains];
									if (!isset($is_writen[$tmp_point->url_domains]))
                                                                        {
										$write_nodes.=',{"name":"'.$tmp_point->url_domains.'","group":'.$group.', "date":"'.$tmp_point->date_time.'", "size":'.$tmp_point->size.', "link":"'.$point->has_link.'"}';
										$is_writen[$tmp_point->url_domains] = TRUE;
                                                                        }
									$write_links.=',{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';
								}
							}	
						}
					}
				}
			}
		}
		else
		{
			if ($point->date_time >= $init_max_date && (strcmp($domain, $point->url_domains) == 0  || (strcmp($domain, $point->url_domains) != 0 && $point->as_link_with($domain) != 0) ))  
			{
				if (!isset($is_writen[$point->url_domains]))
                        	{			
					$write_nodes.=',{"name":"'.$point->url_domains.'","group":'.$group.', "date":"'.$point->date_time.'", "size":'.$point->size.', "link":"'.$point->has_link.'"}';
					$is_writen[$point->url_domains] =  TRUE;
				}
				if ($max_date > $point->date_time)
				{	
					$max_date=$point->date_time;
				}			      
				if ($point->has_link != 0)
				{
					foreach ($point->link as $id => $name_to_link)
					{
						if (isset($map[$name_to_link]))
						{
							$point_to_link = $map[$name_to_link];
							if ($point->id != $point_to_link->id)
							{
								if ($point->is_cookie == TRUE)
								{
									$color = "#ff0000";
								}
								else
								{
									$color = "#00f0ff";
								}
								if (strcmp($point_to_link->url_domains, $domain) == 0 || strcmp($point->url_domains, $domain) == 0)
								{														
									if ($cpt_unique_links == 0 )
									{
										$tmp_point = $map[$point_to_link->url_domains];
										if (!isset($is_writen[$tmp_point->url_domains]))
                                                                        	{
											$write_nodes.=',{"name":"'.$tmp_point->url_domains.'","group":'.$group.', "date":"'.$tmp_point->date_time.'", "size":'.$tmp_point->size.', "link":"'.$point->has_link.'"}';
											$is_writen[$tmp_point->url_domains] = TRUE;
                                                                        	}
										$write_links.='{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';			
										$cpt_unique_links = 1;
									}
									else
									{
										$tmp_point = $map[$point_to_link->url_domains];
										if (!isset($is_writen[$tmp_point->url_domains]))
                                                                                {
											$write_nodes.=',{"name":"'.$tmp_point->url_domains.'","group":'.$group.', "date":"'.$tmp_point->date_time.'", "size":'.$tmp_point->size.', "link":"'.$point->has_link.'"}';
											$is_writen[$tmp_point->url_domains] = TRUE;
                                                                                }
										$write_links.=',{"source":"'.$point_to_link->url_domains.'","target":"'.$point->url_domains.'","value":'.$group.', "cookie":"'.$point->is_cookie.'"}';
									}
								}
							}
						}
					}
				}
			}
		}}
		}
	}
}
$write_nodes.=']';
$write_links.=']';

require "disconnect.php";
print '{"inf_nodes":'.$write_nodes.',"inf_links":'.$write_links.',"max_date":"'.$max_date.'","cpt":'.$cpt.'}';
//print '{"inf_nodes":'.$write_nodes.',"inf_links":'.$write_links.'}';
?>