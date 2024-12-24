/*
Summary of Hostnames for Imported URLs. 	
by Paul Calvano

result: 
See `imported-urls-by-hostnames.csv`
*/

SELECT 
  cssUrlClassification,
  importUrlClassification, 
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
GROUP BY 1,2
ORDER BY 3 DESC