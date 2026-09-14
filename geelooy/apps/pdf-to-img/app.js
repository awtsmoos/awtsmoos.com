//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file app.js
 * @description
 * Binds the PDF converter's small browser interaction surface. Drag/drop and file
 * input both enter the same parser path, while conversion remains an explicit user
 * action after local page counts and first-page previews have succeeded.
 */

import { startConversion } from "./conversion.js";
import { dom } from "./dom.js";
import { handleFiles } from "./files.js";

/** Mounts local file selection, drag/drop, and conversion actions exactly once. */
function mountPdfConverter() {
	dom.dropZone.addEventListener("click", () => dom.fileInput.click());
	dom.dropZone.addEventListener("dragover", event => {
		event.preventDefault();
		dom.dropZone.classList.add("drag-over");
	});
	dom.dropZone.addEventListener("dragleave", () => {
		dom.dropZone.classList.remove("drag-over");
	});
	dom.dropZone.addEventListener("drop", event => {
		event.preventDefault();
		dom.dropZone.classList.remove("drag-over");
		void handleFiles(event.dataTransfer?.files || []);
	});
	dom.fileInput.addEventListener("change", event => {
		void handleFiles(event.target.files || []);
	});
	dom.convertButton.addEventListener("click", () => {
		void startConversion();
	});
}

mountPdfConverter();
