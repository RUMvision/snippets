/*
Typekit Requests by Content Type		
by Paul Calvano

result: 
Hostname;type;sites
use.typekit.net;script;305595
use.typekit.net;font;542093
p.typekit.net;html;19
ping.typekit.net;image;1
primer.typekit.net;text;1
use.typekit.net;other;4394
p.typekit.net;css;296838
p.typekit.net;image;302206
use.typekit.net;image;1
use.typekit.net;text;342
use.typekit.net;css;280302
platform-assets.typekit.net;font;1
use.typekit.net;html;196
fonts.typekit.net;text;6					
*/

SELECT 
  NET.HOST(url),
  type,
  COUNT(DISTINCT page) AS sites,
  COUNT(*) AS requests
FROM `httparchive.crawl.requests` 
WHERE 
  date = "2024-11-01" 
  AND client = "mobile"
  AND is_root_page = true
  AND NET.REG_DOMAIN(url) = "typekit.net"
GROUP BY 1,2