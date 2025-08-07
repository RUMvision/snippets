/*
This JavaScript code snippet closes the mobile navigation menu if it's still open when returning to the page via the browser's back/forward cache (bfcache).
This improves UX by restoring the expected page state — users typically don't expect menus to remain open when going back.
Helpful for full-screen mobile menus where the selector should be tailored to your situation. 
Test carefully: if your nav includes deep category trees or filters, auto-closing might be disruptive.
*/

window.addEventListener('pageshow', function(e){
  if (!e.persisted) {
	// not bfcache
    return;
  }

  // selector tailored to your site/shop:
  const selector 	= 'button.hamburger-btn.is-open';
  const toggleNav 	= document.querySelector( selector ); 
  if (toggleNav) {
    // mobile hamburger/nav is open, so close it
    toggleNav.click();
  }
});