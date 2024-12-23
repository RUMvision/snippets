/*
Check which Google Font CSS files were downloaded by the browser
which font families were involved
and how often (and for which elements) those font families were used
*/

(function() {
    // Function to extract font families from a URL
    function extractFontFamilies(url) {
        const regex = /family=([^&]*)/; // Regex to capture the font families from the URL
        const match = url.match(regex);
        return match ? decodeURIComponent(match[1]).replace(/\+/g, ' ').split('|').map(fam => fam.split(':')[0]) : [];
    }
    
    // Function to check if the extracted font families are used in any HTML elements
    function checkFontUsage(families, allElements) {
        let usedFamilies = {};
    
        families.forEach(family => {
            Array.from(allElements).forEach(element => {
                const fontFamily = window.getComputedStyle(element).fontFamily;
                if (fontFamily.includes(family)) {
                    usedFamilies[family] = usedFamilies[family] || { usagePercentage: 0, elementCount: [] };
                    usedFamilies[family].elementCount.push(element);
                }
            });
            if (usedFamilies[family]) {
				const elmCount = usedFamilies[family].elementCount.length;
                usedFamilies[family].usagePercentage = Math.round( elmCount / allElements.length * 100);
            }
        });
    
        return usedFamilies;
    }
    
    // Function to scan all resources loaded by the page, extract font families, and check their usage
    function scanGoogleFontsUsage() {
        const entries = performance.getEntriesByType("resource");
        let fontFamilies = {};
        const fontUrlRegex = /fonts\.googleapis\.com\/css2?/; // Regex to match both css and css2 endpoints
    
        entries.forEach(entry => {
            if (fontUrlRegex.test(entry.name)) { // Use regex test to check the URL
                extractFontFamilies(entry.name).forEach(family => {
                    fontFamilies[family] = true;
                });
            }
        });
    
        const allElements = document.querySelectorAll('*'); // Select all elements on the page to check against
        const usedFamilies = checkFontUsage(Object.keys(fontFamilies), allElements);    
    
        console.log('%cGoogle Font Checker', 'font-size: 24px; font-weight: bold;');
        if ( Object.keys(usedFamilies).length == 0 ) {
            return console.log('No files from fonts.googleapis.com found');
        }
        console.table(usedFamilies);
    }
    
    // Check if document is already loaded
    if (document.readyState === 'complete') {
        scanGoogleFontsUsage();
    } else {
        window.addEventListener('load', scanGoogleFontsUsage);
    }
})();
