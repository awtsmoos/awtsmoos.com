//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file dom.js
 * @description
 * Owns the fixed PDF converter DOM contract. Keeping node discovery in one tiny
 * module makes missing markup fail immediately instead of surfacing later as a
 * mysterious conversion error after the user has already selected a document.
 */

/**
 * Returns one required element or rejects the broken page contract immediately.
 *
 * @param {string} id Required DOM id.
 * @returns {HTMLElement} Existing converter node.
 */
function requireElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`pdf_converter_missing_${id}`);
	}
	return element;
}

export const dom = Object.freeze({
	controls: requireElement("controls"),
	convertButton: requireElement("convert-btn"),
	dropZone: requireElement("drop-zone"),
	fileGrid: requireElement("file-grid"),
	fileInput: requireElement("file-input"),
	hiddenCanvas: requireElement("hidden-canvas"),
	progressBar: requireElement("progress-bar"),
	progressContainer: requireElement("progress-container"),
	statusText: requireElement("status-text")
});
