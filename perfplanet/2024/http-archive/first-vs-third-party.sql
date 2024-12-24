/*
Breakdown of first party vs third party Imports
by Paul Calvano

result: 
importUrlClassification;sites
Total;3,065,307
thirdPartyImport;2,465,041
firstPartyImport;893,989
*/

SELECT 
  importUrlClassification, 
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
GROUP BY 1

UNION ALL 

SELECT 
  "Total" AS importUrlClassification, 
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
GROUP BY 1

ORDER BY 2 DESC		