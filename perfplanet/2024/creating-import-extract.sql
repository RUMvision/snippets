/*
Query to Exract All @import occurances in CSS files and classify them						
by Paul Calvano

WARNING:
THIS QUERY PROCESSES 10TB OF DATA
Results are saved to httparchive.scratchspace.2024_11_01_mobile_imports_in_css									
*/

SELECT 
    req.page, 
    rank,
    -- URL of request that contains the CSS import
    url,
    -- Is this a first party or third party CSS file?
    IF(NET.REG_DOMAIN(page) = NET.REG_DOMAIN(url), "firstPartyCSS", "thirdPartyCSS") AS cssUrlClassification,
    -- Is this CSS render blocking?
    JSON_EXTRACT_SCALAR(payload, "$._renderBlocking") AS renderBlocking,
    -- URL that was imported
    importedUrl,
    -- Attempt to classify the import as a first party or third party URL
    CASE
      -- If the imported URL domain name matches the page domain name, then consider it first party
      WHEN NET.REG_DOMAIN(importedUrl) IS NOT NULL AND NET.REG_DOMAIN(importedUrl) = NET.REG_DOMAIN(page) THEN "firstPartyImport"
      -- If the imported URL is a related request, then match the page domain name to the CSS url's domain name
      WHEN NET.REG_DOMAIN(importedUrl) IS NULL AND NET.REG_DOMAIN(url) = NET.REG_DOMAIN(page) THEN "firstPartyImport"
      -- Otherwise it's a third party import.
      ELSE "thirdPartyImport"
    END AS importUrlClassification
  FROM `httparchive.crawl.requests`  AS req,
  -- This regex will extract CSS imports from response bodies
  UNNEST(REGEXP_EXTRACT_ALL(response_body, r'@import\s+(?:url\(\s*["\']?|["\'])([^"\'\)\s]+)(?:["\']?\s*\)|["\'])')) AS importedUrl
  WHERE 
    date = "2024-11-01" 
    AND client = "mobile"
    AND is_root_page = true
    AND type = "css"
    AND response_body LIKE "%@import%"								