//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file cards.js
 * @description
 * Renders lightweight PDF queue cards from parsed document testimony. Preview
 * canvases remain DOM nodes instead of serialized HTML, and filenames always enter
 * through textContent so a local filename cannot become markup authority.
 */

import { dom } from "./dom.js";
import { pdfQueue } from "./state.js";

/**
 * Creates one first-page thumbnail and safe metadata card.
 *
 * @param {object} data Parsed PDF queue record.
 * @returns {Promise<void>} Resolves after the preview page has rendered.
 */
export async function createCard(data) {
	const card = document.createElement("article");
	card.className = "file-card";
	card.id = `card-${data.id}`;
	const wrapper = document.createElement("div");
	wrapper.className = "preview-wrapper";
	const canvas = document.createElement("canvas");
	const page = await data.pdfObj.getPage(1);
	const viewport = page.getViewport({ scale: 0.5 });
	canvas.width = Math.max(1, Math.ceil(viewport.width));
	canvas.height = Math.max(1, Math.ceil(viewport.height));
	await page.render({
		canvasContext: canvas.getContext("2d"),
		viewport
	}).promise;
	wrapper.appendChild(canvas);
	card.append(wrapper, info(data), metadata(data));
	dom.fileGrid.appendChild(card);
}

/** Updates the aggregate file/page summary and reveals controls when work exists. */
export function updateControls() {
	if (!pdfQueue.length) {
		dom.controls.classList.remove("visible");
		dom.statusText.textContent = "0 files loaded";
		return;
	}
	const totalPages = pdfQueue.reduce((total, item) => total + item.numPages, 0);
	dom.controls.classList.add("visible");
	dom.statusText.textContent = `${pdfQueue.length} Files (${totalPages} Total Pages)`;
}

/** @param {object} data Queue record. @returns {HTMLElement} Safe filename node. */
function info(data) {
	const element = document.createElement("div");
	element.className = "file-info";
	element.textContent = data.fileName;
	return element;
}

/** @param {object} data Queue record. @returns {HTMLElement} Page-count/status row. */
function metadata(data) {
	const element = document.createElement("div");
	element.className = "file-meta";
	const pages = document.createElement("span");
	pages.textContent = `${data.numPages} Pages`;
	const ready = document.createElement("span");
	ready.className = "ready-state";
	ready.textContent = "Ready";
	element.append(pages, ready);
	return element;
}
