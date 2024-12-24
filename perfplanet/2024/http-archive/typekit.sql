/*
Typekit
by Paul Calvano

result: 
description;sites;percentage of all sites
Imported in CSS;44445;0.27%
thirdPartyImport;44445;0.27%
All Implementations;606074;3.73%	

explanation:
3.73% of sites use Typekit						
7.33% of sites using Typekit are importing URLs via CSS						
All Typekit imports are occuring via third party CSS. (ie, there are no first party CSS files importing them)												
*/

SELECT 
  "Imported in CSS" AS description,
  COUNT(DISTINCT page) AS sites
FROM  `httparchive.scratchspace.2024_11_01_mobile_imports_in_css`
WHERE NET.HOST(importedUrl) = "use.typekit.net"
      OR ((importedUrl NOT LIKE "http%://%" OR NET.REG_DOMAIN(importedUrl) IS NULL) AND NET.HOST(url) = "use.typekit.net")

UNION ALL 

SELECT 
  importUrlClassification AS description,
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
WHERE 
        NET.HOST(importedUrl) = "use.typekit.net"
        OR ((importedUrl NOT LIKE "http%://%" OR NET.REG_DOMAIN(importedUrl) IS NULL) AND NET.HOST(url) = "use.typekit.net")
GROUP BY 1      

UNION ALL 

SELECT 
  "All Implementations" AS description, 
  COUNT(DISTINCT page) AS sites
FROM `httparchive.crawl.requests` 
WHERE 
  date = "2024-11-01" 
  AND client = "mobile"
  AND is_root_page = true
  AND NET.HOST(url) = "use.typekit.net"