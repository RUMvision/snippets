/*
This code loops all images to check if image entropy allows an image to be an LCP candidate.
This can be convenient as Chrome started to [ignore low-entropy images as of v112](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/speed/metrics_changelog/2023_04_lcp.md).

This snippet is build upon [Stoyan Stefanov's snippet and blogpost](https://www.phpied.com/quick-bpp-image-entropy-check/)

With the script you can get a list of the BPP of all images loaded on the site, but excluding images with source "data:image" and third-party images are ignored.

Structure of output
```
[{
	image path: URL of the image
	image entropy: Entropy ratio
	passing BPP check: check if the entropy is above Chrome's 0.05 threshold to allow it to be an LCP candidate 
	LCP candidate: check to see if it was actually part of all LCPs within the current pageload:
		is: it is the current LCP as it matches the final LCP
		was: it is part of the rendered LCPs, but didn't match the final one
		no: not part of rendered LCPs
}]
```
*/

let detectedLCPs = {};
// Start observing the largest contentful paint events
new PerformanceObserver((entryList) => {
  entryList.getEntries().forEach((entry) => {
    if ((entry.url || '').length) {
      detectedLCPs[entry.url] = entry;
    }
  });
}).observe({ type: 'largest-contentful-paint', buffered: true });

// either 
// 1] paste this all in DevTools JS console after page load
// 2] or implement the above in your source code (for example via local overrides) to track all LCPs and execute and then execute the code below in your DevTools JS console
setTimeout(() => {
  // setTimeout to wait for the observer to add entries to detectedLCPs
  const lastLcpUrl = Object.keys(detectedLCPs).pop();	
  console.table(
    [...document.images]
      .filter(
        (img) => img.currentSrc != "" && !img.currentSrc.includes("data:image")
      )
      .map((img) => {
        const performanceEntry = performance.getEntriesByName(img.currentSrc)[0];
        const entropy =
          (performanceEntry?.encodedBodySize * 8) /
          (img.width * img.height);
        
        return {
          "image path": img.currentSrc,
          "image entropy": entropy,
          "passing BPP check": entropy < 0.05 ? "no" : "yes",
          "LCP candidate": detectedLCPs[img.currentSrc] ? ( lastLcpUrl == img.currentSrc ? "is": "was" ): "no",
        };
      })
      .filter((img) => img["image entropy"] !== 0)
  );
}, 1);