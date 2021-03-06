/* eslint-disable prefer-const */

if (localStorage.getItem("com.base24") === null) {
	// eslint-disable-next-line no-var
	settingData = {
		"theme": {
			"name": "auto",
			"cPrimary": "#FAFAFA",
			"cSecondary": "#EAEAEB",
			"cText": "#383A42",
			"cBlack": "0",
		},
		"textSize": {
			"name": "med",
			"size": "1",
		},
	};
}

/**
 * Save settingData onto local storage - Over 95% of browsers support this
 * so I'm not going to check for it
 * @return {void}
 */
function save() {
	localStorage.setItem("com.base24", JSON.stringify(settingData));
	return;
}


// Set the checked radio buttons for theme, textSize and iconShape
document.getElementById(settingData.theme.name).checked = true;
document.getElementById(settingData.textSize.name).checked = true;

/**
 *
 * @param {NodeListOf<HTMLElement>} tRadios a list of radio buttons
 * @param {string} type text representation of the type. see first children of
 * settingData
 * @param {json} tConst constant containing variants of the given setting
 */
function saveT(tRadios, type, tConst) {
	let radioIndex = 0;
	for (let iteration = 0, length = tRadios.length; iteration < length;
		iteration++) {
		if (tRadios[iteration].checked) {
			radioIndex = parseInt(tRadios[iteration].value, 10);
			break;
		}
	}
	settingData[type] = tConst[radioIndex];
	save();
	location.reload();
}

/**
 * saveTheme takes the current index of the theme radio button and uses
 * themes to identify the theme to set in localStorage
 */
function saveTheme() { // eslint-disable-line no-unused-vars
	const themes = [
		{},
		{
			"name": "light",
			"cPrimary": "#FAFAFA",
			"cSecondary": "#EAEAEB",
			"cText": "#383A42",
			"cBlack": "0",
		},
		{
			"name": "dark",
			"cPrimary": "#181A1F",
			"cSecondary": "#282C34",
			"cText": "#ABB2BF",
			"cBlack": "0",
		},
		{
			"name": "black",
			"cPrimary": "#000000",
			"cSecondary": "#000000",
			"cText": "#ABB2BF",
			"cBlack": "1",
		},
		{
			"name": "auto",
			"cPrimary": null,
			"cSecondary": null,
			"cText": null,
		},
	];

	saveT(document.getElementsByName("themeR"), "theme", themes);
}

/**
 * saveText takes the current index of the textSize radio button and uses
 * textSizes to identify the text size to set in localStorage
 */
function saveText() { // eslint-disable-line no-unused-vars
	const textSizes = [
		{
		},
		{
			"name": "small",
			"size": "0.75",
		},
		{
			"name": "med",
			"size": "1",
		},
		{
			"name": "large",
			"size": "1.5",
		},
	];
	saveT(document.getElementsByName("textR"), "textSize", textSizes);
}
