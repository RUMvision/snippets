/*
This script is designed to help developers analyze the usage and effectiveness of resource hints in a web page. It checks for various resource hint types (like `preload`, `prefetch`, `preconnect`, `dns-prefetch`, and more) and compares them with the actual resources loaded by the browser. 

By doing so, it determines whether the resource hints were beneficial in optimizing page load times.
*/
const rels = [
  "preload",
  "prefetch",
  "preconnect",
  "dns-prefetch",
  "preconnect dns-prefetch",
  "prerender",
  "modulepreload",
];

// Helper function to normalize hostnames
const normalizeHostname = (url) => {
  try {
    const a = document.createElement('a');
    a.href = url;
    return a.hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
};

// Helper function to normalize full URLs (for resource hints like preload/prefetch)
const normalizeUrl = (url) => {
  try {
    const a = document.createElement('a');
    a.href = url;
    return a.href;  // Return the full normalized URL
  } catch (e) {
    return url;
  }
};

// Function to check if a hint is host-based (preconnect, dns-prefetch)
function isHostHint(element) {
  return ["preconnect"].includes(element.split(" ")[0]); // Exclude "dns-prefetch" from crossorigin check
}

// Determine if crossorigin="anonymous" or "use-credentials" should be used based on resource type
function requiresCrossOriginAttribute(initiatorType, isCrossOrigin, credentialsIncluded) {
  switch (initiatorType) {
    case 'font':
      return 'anonymous';  // Fonts require crossorigin=anonymous
    case 'fetch':
    case 'xmlhttprequest':
      return credentialsIncluded ? 'use-credentials' : 'anonymous';  // Fetch/XHR with credentials needs "use-credentials"
    case 'img':
    case 'script':
    case 'stylesheet':
    case 'iframe':
      return isCrossOrigin ? null : null;  // No crossorigin attribute for cross-origin classic requests unless explicitly needed
    default:
      return null;  // No crossorigin required for other cases
  }
}

// Check if a request is same-origin or cross-origin
function isCrossOriginRequest(hostname, resourceHostname) {
  return hostname !== resourceHostname;
}

// Collect all resource performance entries
const resourceEntries = window.performance.getEntriesByType("resource");
const loadedUrls = new Set(resourceEntries.map((entry) => normalizeUrl(entry.name)));
const loadedHostnames = new Set(resourceEntries.map((entry) => normalizeHostname(entry.name)));

// Array to hold results for the table
let results = [];

// Loop over resource hints and collect data
rels.forEach((element) => {
  const linkElements = document.querySelectorAll(`link[rel="${element}"]`);
  let totalWarnings = 0; // Track the total number of warnings
  const actualHintElements = [];

  // Collect information for each resource hint element
  linkElements.forEach((el) => {
    const href = el.href || el.dataset.href;
    if (!href) return;

    const resourcesMatched = [];
    const normalizedHost = normalizeHostname(href);
    const isCrossOrigin = el.getAttribute('crossorigin') === "anonymous" || el.getAttribute('crossorigin') === "use-credentials";

    if (isHostHint(element)) {
      // For host-based hints (preconnect only, no crossorigin checks for dns-prefetch)

      // Check which resources match this host
      resourceEntries.forEach((entry) => {
        const resourceHost = normalizeHostname(entry.name);
        if (resourceHost === normalizedHost) {  // Ensure only resources from the same host are matched
          const crossOriginRequest = isCrossOriginRequest(normalizedHost, resourceHost);

          // Fetch credentials mode can be checked via network panel (this is simplified here)
          const requiresCredentials = entry.credentials === 'include' || entry.withCredentials === true;

          const requiredCrossOrigin = requiresCrossOriginAttribute(entry.initiatorType, crossOriginRequest, requiresCredentials);
          const resource = {
            url: normalizeUrl(entry.name),
            type: entry.initiatorType,
            warning: false, // Default: no warning
            crossOriginRequired: requiredCrossOrigin
          };

          // Check for misuse of the crossorigin attribute
          if (requiredCrossOrigin && !isCrossOrigin) {
            resource.warning = true;
            totalWarnings++;
            resource.warningMessage = `Missing crossorigin="${requiredCrossOrigin}" on preconnect for ${href}: ${entry.initiatorType} resource loaded.`;
          } else if (isCrossOrigin && requiredCrossOrigin === null) {
            resource.warning = true;
            totalWarnings++;
            resource.warningMessage = `Potential misuse of crossorigin="anonymous" or "use-credentials" on preconnect for ${href}: non-crossorigin ${entry.initiatorType} resources loaded.`;
          }

          resourcesMatched.push(resource);
        }
      });
    } else if (element !== "dns-prefetch") {  // Avoid crossorigin check for dns-prefetch
      // For resource-based hints (preload, prefetch)
      const normalizedUrl = normalizeUrl(href);

      // Check which resources match this full URL
      resourceEntries.forEach((entry) => {
        if (normalizeUrl(entry.name) === normalizedUrl) {
          resourcesMatched.push({
            url: normalizeUrl(entry.name),
            type: entry.initiatorType,
            warning: false // No specific crossorigin issue for resource-based hints
          });
        }
      });
    }

    // Add the link element and matched resources to the results
    actualHintElements.push({
      link: el, // Reference to the actual link element for clickable inspection
      resources: resourcesMatched, // List of resources that benefited from this hint
    });
  });

  // Store result in table format, including the warning count
  results.push({
    'Hint Type': element,
    'Hint Count': linkElements.length,
    'Hints and Beneficial Resources': actualHintElements, // List of link elements and their matched resources
    'Total Warnings': totalWarnings // Total number of warnings for this hint type
  });
});

// Log the results as a table
console.table(results);