/*
Summary of Domain Names for Imported URLs. 	 	
by Paul Calvano

result: 
See `imported-urls-by-domainnames.csv`
*/

SELECT 
  CASE 
   -- for relative URLs, use the hostname of the url that imported the file
    WHEN importedUrl NOT LIKE "http%://%" OR NET.REG_DOMAIN(importedUrl) IS NULL THEN NET.REG_DOMAIN(url)
    ELSE NET.REG_DOMAIN(importedUrl)
  END AS importedUrlDomain,
  COUNT(DISTINCT page) AS sites,
  COUNT(*) AS requests
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
GROUP BY 1
ORDER BY 2 DESC
LIMIT 5000