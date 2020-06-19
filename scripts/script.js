/* eslint-disable no-var */
/* eslint-disable prefer-const */
const TOAST_TIMER = 2000;

/**
 * Copy the contents of the output element
 * @param {string} message
 * @return {void}
 */
function showToast(message) {
	var toast = document.getElementById("js-toast");
	var toastText = toast.firstElementChild.firstElementChild;
	toastText.innerText = message;
	toast.classList.add("show");
	setTimeout(function() {
		toast.classList.remove("show");
	}, TOAST_TIMER);
	return;
}

const MAX_FILE_SIZE = 1024 * 1024;

/**
 * Open the system file selector and upload a stream of chars with a filename
for each file
 * @param {blob[]} files
 * @param {string[]} targets
 * @return {string[]} fileNames
 */
function upload(files, targets) { // eslint-disable-line no-unused-vars
	const output = [];
	for (let index = 0; index < files.length; index++) {
		const file = files[index];
		const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function(event) {
			const fileContents = event.target.result;
			if (fileContents.length < MAX_FILE_SIZE) {
				document.getElementById(targets[index]).value = fileContents;
			} else {
				showToast("File must be smaller than 1MB");
			}
		};
		output.push(file.name);
	}
	return output;
}


/**
 * Download a stream of chars and set a filename
 * @param {string} filename
 * @param {string} chars
 * @return {void} none
 */
function download(filename, chars) { // eslint-disable-line no-unused-vars
	if (filename.length > 0 && chars.length > 0) {
		const blob = new Blob([chars], { type: "application/octet-stream" });
		const blobURL = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = filename;
		link.href = blobURL;
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} else {
		showToast("Give the file a name and some content");
	}
	return;
}

/**
 * @param {string} stringToCopy
 * @return {void}
 */
async function copyToClipboard(stringToCopy) {
	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(stringToCopy);
			showToast("Successfully Copied");
		} catch (err) {
			showToast("Failed to Copy");
		}
	}
	return;
}

/**
 * Copy the contents of the output element
 * @return {void}
 */
function copy() { // eslint-disable-line no-unused-vars
	var stringToCopy = document.getElementById("output").value;
	copyToClipboard(stringToCopy);
	window.getSelection().removeAllRanges();
	return;
}


/**
 * Searchbox
 */
function search() { // eslint-disable-line no-unused-vars
	// Declare variables
	let txtValue;
	let input = document.getElementById("input");
	let filter = input.value.toUpperCase();
	let ul = document.getElementById("search-results");
	let li = ul.getElementsByTagName("li");
	let shown = 0;
	// Loop through all list items, and hide those who don't match the search
	// query
	for (let i = 0; i < li.length; i++) {
		let a = li[i].getElementsByTagName("a")[0];
		txtValue = a.textContent || a.innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			li[i].style.display = "";
			shown += 1;
		} else {
			li[i].style.display = "none";
		}
	}
	let label = document.getElementById("input-label");
	label.innerHTML = "Search: (showing " + shown + ")";
}


/**
 * Get a list of templates in the form [name, url]
 *
 * @param {string[]} list list of templates
 * @return {Array.<Array.<string>>} list of templates in the form
 * [name, url, author, full-name, isBase24?]
 */
function schemesOrTemplatesFromList(list) {
	const words = [];
	for (let index = 0; (index < list.length); index += 1) {
		if (list[index].length > 3 && list[index][0] !== "#") {
			let parts = list[index].split(":");
			let url = parts.slice(1).join(":");
			let urlP = url.split("/");
			words.push([parts[0], url, urlP[urlP.length - 2], urlP[urlP.length - 1],
				urlP[urlP.length - 1].includes("base24")]);
		}
	}
	return words;
}

/**
 * Get a list of random words from an online words-list
 */
async function populateTemplates() { // eslint-disable-line no-unused-vars
	let file = await grabFile("https://cdn.jsdelivr.net/gh/Base24/base24-templates-source@master/list.yaml");
	let templates = schemesOrTemplatesFromList(file);
	let ul = document.getElementById("search-results");
	let appendContent = "";
	for (let i = 0; i < templates.length; i++) {
		appendContent += ("<li><a href=\""+ templates[i][1].trim() +
		"\"><div class=\"border c-accent--"+ Math.floor(Math.pow(i, 2.9) % 4) +
		"\" ><div><h3>"+ templates[i][0] +"</h3><p>Base: "+
		(templates[i][4]? "<b>24&#xf42e;</b>": "<b>16</b>") +" | Author: "+
		templates[i][2] +"</p></div></div></a></li>");
	}
	ul.innerHTML = appendContent;
	let label = document.getElementById("input-label");
	label.innerHTML = "Search: (showing " + templates.length + ")";
}

/**
 * Get a list of random words from an online words-list
 */
async function populateStyles() { // eslint-disable-line no-unused-vars
	let file = await grabFile("https://cdn.jsdelivr.net/gh/Base24/base24-schemes-source@master/list.yaml");
	let templates = schemesOrTemplatesFromList(file);
	let ul = document.getElementById("search-results");
	let appendContent = "";
	for (let i = 0; i < templates.length; i++) {
		appendContent += ("<li><a href=\""+ templates[i][1].trim() +
		"\"><div class=\"border c-accent--"+ Math.floor(Math.pow(i, 2.9) % 4) +
		"\" ><div><h3>"+ templates[i][0] +"</h3><p>Base: "+
		(templates[i][4]? "<b>24&#xf42e;</b>": "<b>16</b>") +" | Author: "+
		templates[i][2] +"</p></div></div></a></li>");
	}
	ul.innerHTML = appendContent;
	let label = document.getElementById("input-label");
	label.innerHTML = "Search: (showing " + templates.length + ")";
}

/**
 * Get a file from a url resource
 *
 * @param {string} url
 * @return {promise} file
 */
async function grabFile(url) {
	return new Promise(function(resolve, reject) {
		const rawFile = new XMLHttpRequest();
		rawFile.open("GET", url);
		rawFile.onloadend = function() {
			if (rawFile.status === 404) {
				reject(Error(url + " replied 404"));
			}
		};
		rawFile.onload = function() {
			resolve(rawFile.responseText.split("\n"));
		};
		rawFile.send(null);
	});
}

/**
 * Try and get the value for an element. If it fails, return the default value
 *
 * @param {string} elementId
 * @param {const} def
 * @return {var} value
 */
function grabValue(elementId, def) {
	let value = def;
	try {
		value = document.getElementById(elementId).value.replace(/\s/g, "");
	} catch (error) {
	}
	return value;
}

/**
 * Try and get the boolean value for an element. If it fails, return the default
 * value
 *
 * @param {string} elementId
 * @param {boolean} def
 * @return {boolean} boolean value
 */
function grabBool(elementId, def) {
	let bool = def;
	try {
		bool = document.getElementById(elementId).checked;
	} catch (error) {
	}
	return bool;
}

/**
 *
 */
async function run() { // eslint-disable-line no-unused-vars
	// Offline template?
	let template;
	if (grabBool("custom-template", false)) {
		template = document.getElementById("custom-template-data").value;
	} else {
		// Get the template - there always seems to be a templates/default.mustache
		// so try that
		let url = grabValue("templates-list", "").split("|");
		template = await grabFile("https://cdn.jsdelivr.net/gh/" + url[0] + "@master/templates/default.mustache");
		if (template[0].includes("Couldn't find the requested file")) {
			showToast("Error: " + url[1] +
				" does not have a default template under templates/!");
		}
	}
	// Offline scheme?
	let scheme;
	if (grabBool("custom-scheme", false)) {
		scheme = document.getElementById("custom-scheme-data").value;
	} else {
		// Try and get the scheme
		// Try scheme.yaml
		let url = grabValue("schemes-list", "Base24/base24-one-dark-scheme")
			.split("|");
		scheme = await grabFile("https://cdn.jsdelivr.net/gh/" + url[0] + "@master/scheme.yaml");
		if (scheme[0].includes("Couldn't find the requested file")) {
			// Try [name].yaml
			scheme = await grabFile("https://cdn.jsdelivr.net/gh/" + url[0] + "@master/" + url[1] + ".yaml");
		}
		// Fail
		if (scheme[0].includes("Couldn't find the requested file")) {
			scheme = await grabFile("https://cdn.jsdelivr.net/gh/" + url[0] + "@master/" + url[1] + ".yaml");
			showToast("Error: Can not find scheme from " + url[1]);
		}
	}
	// Populate file name
	// do mangling - its pretty simple mustache so just find and replace scheme
	// keys with the contents
	template = template.join("\n");
	let schemeName = grabValue("schemes-list", "Base24/base24-one-dark-scheme")
		.split("|")[1];
	document.getElementById("filename").value = grabValue("templates-list", "")
		.split("|")[1] + "|" + schemeName;
	let theme = generateTheme(template, scheme, schemeName);
	document.getElementById("output").value = theme;
}

/**
 * Generate a theme from a template and a scheme
 *
 * @param {string} template the template file
 * @param {string[]} rawScheme list of lines from the scheme to manipulate
 * @param {string} slug scheme-slug
 *
 * @return {string} theme
 */
function generateTheme(template, rawScheme, slug) {
	let scheme = {};
	for (let i = 0; i < rawScheme.length; i++) {
		let parts = rawScheme[i].split(":");
		if (parts.length > 1) {
			parts[1] = parts[1].trim();
			for (let j = 0; j < 2; j++) {
				if (parts[j].slice(0, 1) === "\"" || parts[j].slice(0, 1) === "'") {
					parts[j] = parts[j].slice(1, parts[j].length -2);
				}
			}
			scheme[parts[0]] = parts[1];
		}
	}
	scheme["scheme-type"] = "16";
	// Base16 here:
	scheme["scheme-name"] = scheme["scheme"];
	scheme["scheme-author"] = scheme["author"];
	scheme["scheme-slug"] = slug;
	let bases = ["base00", "base01", "base02", "base03", "base04", "base05",
		"base06", "base07", "base08", "base09", "base0A", "base0B", "base0C",
		"base0D", "base0E", "base0F"];
	for (let i = 0; i < bases.length; i++) {
		scheme[bases[i] + "-hex"] = scheme[bases[i]];
	}
	// Base24 (with fallbacks)
	let extended_bases = ["base10", "base11", "base12", "base13", "base14",
		"base15", "base16", "base17"];
	let base_map = {"base10": "base00", "base11": "base00", "base12": "base08",
		"base13": "base0A", "base14": "base0B", "base15": "base0C",
		"base16": "base0D", "base17": "base0E"};
	for (let i = 0; i < extended_bases.length; i++) {
		if (scheme.hasOwnProperty(extended_bases[i])) {
			scheme[extended_bases[i] + "-hex"] = scheme[extended_bases[i]];
			scheme["scheme-type"] = "24";
		} else {
			scheme[extended_bases[i] +"-hex"] = scheme[base_map[
				extended_bases[i]] +"-hex"];
		}
	}
	let all_bases = bases.concat(extended_bases);
	for (let i = 0; i < all_bases.length; i++) {
		let all_base = all_bases[i];
		// HEX
		scheme[all_base + "-hex-r"] = scheme[all_base + "-hex"].substring(0, 2);
		scheme[all_base + "-hex-g"] = scheme[all_base + "-hex"].substring(2, 4);
		scheme[all_base + "-hex-b"] = scheme[all_base + "-hex"].substring(4, 6);
		// RGB 0-255
		scheme[all_base + "-rgb-r"] = parseInt(scheme[all_base + "-hex-r"],
			16).toString(10);
		scheme[all_base + "-rgb-g"] = parseInt(scheme[all_base + "-hex-g"],
			16).toString(10);
		scheme[all_base + "-rgb-b"] = parseInt(scheme[all_base + "-hex-b"],
			16).toString(10);
		// RGB 0.0-1.0
		scheme[all_base + "-dec-r"] = (parseInt(scheme[all_base + "-rgb-r"]) /
			255).toString(10);
		scheme[all_base + "-dec-g"] = (parseInt(scheme[all_base + "-rgb-g"]) /
			255).toString(10);
		scheme[all_base + "-dec-b"] = (parseInt(scheme[all_base + "-rgb-b"]) /
			255).toString(10);
	}
	for (let key in scheme) {
		template = template.replace(new RegExp("{{" + key + "}}", "g"),
			scheme[key]);
	}
	return template;
}


/**
 * Copy the contents of the output element
 * @return {void}
 */
function copy() { // eslint-disable-line no-unused-vars
	var stringToCopy = document.getElementById("output").value;
	copyToClipboard(stringToCopy);
	window.getSelection().removeAllRanges();
	return;
}


/**
 * Download the generated theme
 */
function downloadTheme() { // eslint-disable-line no-unused-vars
	download(document.getElementById("filename").value,
		document.getElementById("output").value);
	return;
}


/**
 * 'upload' a custom template
 */
function uploadTemplate() { // eslint-disable-line no-unused-vars
	upload(document.getElementById("template").files, ["custom-template-data"]);
}

/**
 * 'upload' a custom scheme
 */
function uploadScheme() { // eslint-disable-line no-unused-vars
	upload(document.getElementById("scheme").files, ["custom-scheme-data"]);
}


/**
 * Get a list of random words from an online words-list
 *
 */
async function populateSchemeAndTemplates() { // eslint-disable-line no-unused-vars
	const templatesSchemes = [
		["https://cdn.jsdelivr.net/gh/Base24/base24-templates-source@master/list.yaml",
			"templates-list"],
		["https://cdn.jsdelivr.net/gh/Base24/base24-schemes-source@master/list.yaml",
			"schemes-list"]];
	for (let j = 0; j < 2; j++) {
		let file = await grabFile(templatesSchemes[j][0]);
		let templates = schemesOrTemplatesFromList(file);
		let ul = document.getElementById(templatesSchemes[j][1]);
		let appendContent = "";
		for (let i = 0; i < templates.length; i++) {
			appendContent += ("<option value=\"" + templates[i][2] + "/" +
				templates[i][3] + "|" + templates[i][0] + "\">" +
				templates[i][0] + "</option>");
		}
		ul.innerHTML = appendContent;
	}
}
