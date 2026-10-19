//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos gives each DOM vessel a name before the browser shows its light;
* Awtsmoos.com keeps simple element-building apart so larger meanings stay bright.
* @module ShliachSpotlightElements
*/

/**
* Creates a DOM vessel with the requested class.
* @param {Document} documentRoot The living document.
* @param {string} tagName The element name.
* @param {string} className The optional class name.
* @returns {HTMLElement} The created vessel.
*/
export function element(documentRoot, tagName, className = "") {
	const node = documentRoot.createElement(tagName);
	if (className) {
		node.className = className;
	}
	return node;
}

/**
* Creates an ordinary internal or same-origin link vessel.
* @param {Document} documentRoot The living document.
* @param {string} className The class applied to the link.
* @param {string} href The destination URL or path.
* @returns {HTMLAnchorElement} The linked vessel.
*/
export function internalLink(documentRoot, className, href) {
	const link = element(documentRoot, "a", className);
	link.href = href;
	return link;
}

/**
* Creates a text-bearing DOM vessel without parsing arbitrary HTML.
* @param {Document} documentRoot The living document.
* @param {string} tagName The element name.
* @param {string} className The class name.
* @param {string} value The visible text.
* @returns {HTMLElement} The completed text vessel.
*/
export function text(documentRoot, tagName, className, value) {
	const node = element(documentRoot, tagName, className);
	node.textContent = value;
	return node;
}
