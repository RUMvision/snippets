/*
Google Fonts
by Paul Calvano

result: 
description;sites;percentage of all sites		
thirdPartyImport;1,901,406.00;11.70%		
Imported in CSS;1,901,406.00;11.70%
All Implementations;8,566,027.00;52.69%		

explanation:
52% of sites use Google Fonts						
22.2% of sites using Google Fonts are importing URLs via CSS						
All Google Fonts imports are occuring via third party CSS. (ie, there are no first party CSS files importing Google fonts)						
*/

SELECT 
  "Imported in CSS" AS description,
  COUNT(DISTINCT page) AS sites
FROM  `httparchive.scratchspace.2024_11_01_mobile_imports_in_css`
WHERE NET.HOST(importedUrl) = "fonts.googleapis.com"
      OR ((importedUrl NOT LIKE "http%://%" OR NET.REG_DOMAIN(importedUrl) IS NULL) AND NET.HOST(url) = "fonts.googleapis.com")

UNION ALL 

SELECT 
  importUrlClassification AS description,
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
WHERE 
        NET.HOST(importedUrl) = "fonts.googleapis.com"
        OR ((importedUrl NOT LIKE "http%://%" OR NET.REG_DOMAIN(importedUrl) IS NULL) AND NET.HOST(url) = "fonts.googleapis.com")
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
  AND NET.HOST(url) = "fonts.googleapis.com"