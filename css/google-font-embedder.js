/*
quickly test how the website would look with a different font
in the prompt, provide the name of an existing Google Font family
*/

(function() {

	function h1(txt, elm) {
        const selectorHeading = document.createElement('h1');
        selectorHeading.style.cssText = `
            font-size: 1.5em;
        `;
        selectorHeading.textContent = txt;
        elm.appendChild(selectorHeading);
	}
	
    function createFontPicker(fonts) {
        const background = document.createElement('div');
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        document.body.appendChild(background);

        picker = document.createElement('div');
		picker.id = 'google-font-picker';
        picker.style.cssText = `
            position: fixed;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 80%;
            background-color: white;
            overflow: auto;
            z-index: 1000;
            padding: 10px;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.5);
            border-radius: 8px;
        `;
        background.appendChild(picker);
		
		h1('Pick your Google font first', picker);

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            padding: 10px 15px;
            font-size: 20px;
            border: none;
            background: none;
            cursor: pointer;
        `;
        closeButton.onclick = () => document.body.removeChild(background);
        picker.appendChild(closeButton);

        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        `;
        picker.appendChild(searchContainer);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Enter or search a font...';
        searchInput.style.cssText = `
            flex-grow: 1;
            padding: 10px;
            box-sizing: border-box;
        `;
        searchContainer.appendChild(searchInput);

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Load Font';
        confirmButton.style.cssText = `
            padding: 10px 15px;
            margin-left: 10px;
        `;
        confirmButton.onclick = () => {
            const fontName = searchInput.value;
            if (fontName) {
                addFontToList(fontName);
            }
        };
        searchContainer.appendChild(confirmButton);

        const fontList = document.createElement('div');
        picker.appendChild(fontList);

        function updateFontList(filterText) {
            fontList.innerHTML = '';
            const filteredFonts = fonts.filter(font => font.toLowerCase().includes(filterText.toLowerCase()));

            if (filteredFonts.length === 0) {
                fontList.innerHTML = '<div style="padding: 10px; color: #888;">No fonts found.</div>';
            } else {
                filteredFonts.forEach(font => {
                    createFontOption(font);
                });
            }
        }

        function createFontOption(font) {
            const fontOption = document.createElement('div');
            fontOption.textContent = font;
            fontOption.style.cssText = `
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #ccc;
            `;
            fontOption.onclick = () => {
                picker.removeChild(picker.querySelector('h1'));
                picker.removeChild(fontList);
                picker.removeChild(searchContainer);
                promptForSelectors(font);
            };
            fontList.appendChild(fontOption);
        }

        function addFontToList(fontName) {
            if (!fonts.includes(fontName)) {
                fonts.push(fontName);
            }
            updateFontList(searchInput.value);
        }

        searchInput.addEventListener('input', () => updateFontList(searchInput.value));

        updateFontList(''); // Initial font list setup
    }

    function promptForSelectors(fontFamily) {
        const tags = ["h1", "h2", "h3", "h4", "p", "table", "ul"];
        const picker = document.createElement('div');
        picker.style.cssText = `
            display: flex;
            flex-direction: column;
            margin: 10px;
        `;
		
        h1('Elements for ' + fontFamily, picker);

        tags.forEach(tag => {
            const count = document.querySelectorAll(tag).length;
			if ( count == 0 ) {
				// no elements, so don't even show this option
				return;
			}
			
            const label = document.createElement('label');
            label.style.cssText = `
                margin: 5px;
            `;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            label.appendChild(checkbox);
            label.append(` ${tag} (${count})`);
            picker.appendChild(label);
        });

        const customSelectorsInput = document.createElement('input');
        customSelectorsInput.type = 'text';
        customSelectorsInput.placeholder = 'Enter custom selectors, comma separated...';
        customSelectorsInput.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            width: calc(100% - 20px);
        `;
        picker.appendChild(customSelectorsInput);

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply Font';
        applyButton.style.cssText = `
            padding: 10px 15px;
            margin-top: 10px;
        `;
        applyButton.onclick = () => {
            const selectedTags = Array.from(picker.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
            const customSelectors = customSelectorsInput.value.split(',').filter(Boolean).map(s => s.trim()).join(', ');
            const allSelectors = ( customSelectors.length ? selectedTags.concat(customSelectors): selectedTags ).join(', ');
            if (allSelectors) {
                applyFont(fontFamily, allSelectors);
                document.body.removeChild(document.querySelector('div[style*="position: fixed"]'));
            }
        };
        picker.appendChild(applyButton);

        document.querySelector('div#google-font-picker').appendChild(picker);
    }

    async function applyFont(fontFamily, selectors) {
        const ucWordsInput = fontFamily.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        const fontUrl = `https://fonts.googleapis.com/css2?family=${ucWordsInput.replace(/\s+/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap`;

        try {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontUrl;
            document.head.appendChild(link);

            const styleElement = document.createElement('style');
            styleElement.innerHTML = `${selectors} { font-family: '${ucWordsInput}', sans-serif!important; }`;
            document.head.appendChild(styleElement);

            console.log(`Font '${ucWordsInput}' applied to ${selectors}.`);
        } catch (err) {
            console.error(`Error loading font '${ucWordsInput}': ${err}`);
        }
    }

    const googleFontFamilies = [
        "Roboto", "Open Sans", "Noto Sans JP", "Montserrat", "Poppins",
        "Inter", "Lato", "Roboto Condensed", "Oswald",
        "Roboto Mono", "Noto Sans", "Raleway", "Josefin Sans", "Nunito Sans",
        "Nunito", "Playfair Display", "Rubik", "Noto Sans KR", "Ubuntu",
        "Roboto Slab", "Merriweather", "Kanit", "PT Sans", "Work Sans",
        "Lora", "Noto Sans TC", "DM Sans", "Mulish", "Fira Sans",
        "Barlow", "Quicksand", "Manrope", "Heebo"
    ];
    createFontPicker(googleFontFamilies);
})();
