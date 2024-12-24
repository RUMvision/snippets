/*
Breakdown of CSS Imports from whether the source was as first or third party CSS file					
by Paul Calvano

result: 
cssUrlClassification;importUrlClassification;sites
firstPartyCSS;thirdPartyImport;1,736,807
firstPartyCSS;firstPartyImport;893,474
thirdPartyCSS;thirdPartyImport;852,127
thirdPartyCSS;firstPartyImport;575
*/

SELECT 
  cssUrlClassification,
  importUrlClassification, 
  COUNT(DISTINCT page) AS sites
FROM  httparchive.scratchspace.2024_11_01_mobile_imports_in_css
GROUP BY 1,2
ORDER BY 3 DESC