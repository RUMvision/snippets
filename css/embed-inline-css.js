/*
Embed custom inline CSS by injecting it via JS 
can be convenient to quickly change some styles for yourselves 
to actually change and save your changes, use DevTools overrides
*/

var styles = `
    body { 
        font-family: Georgia,Cambria,"Times New Roman",Times,serif;
    }
`;

var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)