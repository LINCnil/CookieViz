
class point
{
	id;
	url_domains;
	referer_domains;
	date_time;
	referer;
	is_cookie;
	link ={};
	cpt;
	has_link;
	size;
	
	constructor(line, i)
	{
		this.id = i;
		this.url_domains = line["url_domains"];
		this.referer_domains = line["referer_domains"];
		this.date_time = line["date"];
		this.is_cookie = line["is_cookie"] == "true" ? 1 : 0;
		this.cpt = 0;
		this.size = 13 + line["Cpt"]/10;
		this.has_link = 0;
	};
	
	add_link(referer, cookie)
	{
		if (this.is_cookie == 0 && cookie == 1)
		{
			this.is_cookie = 1;
		}
		this.has_link++;
		this.link[this.cpt] = referer;
		this.cpt++;
	}

	as_link_with(domain)
	{
		if (this.has_link != 0)
		{
			for (var key_map in this.map) {
				const name_to_link = map[key_map];
				if (name_to_link == domain)
				{	
					return true;
				}
			}
		}	
		return false;
	}
	
	increment(line)
	{
		this.size = this.size + line["Cpt"]/10;
		this.date_time = line["date"];
	}
}
