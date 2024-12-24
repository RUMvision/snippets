/*
Total sites in dataset
by Paul Calvano

result: 
16,257,083
*/

SELECT COUNT(DISTINCT page)  AS sites
FROM `httparchive.crawl.pages`
WHERE 
    date = "2024-11-01"
    AND client = "mobile"
    AND is_root_page = true
	