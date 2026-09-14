//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file conversion.js
 * @description
 * Renders queued PDF pages at high resolution and downloads each PNG sequentially.
 * One shared hidden canvas keeps memory bounded, while yielding between pages keeps
 * a large local document from monopolizing the browser's interaction thread.
 */

import { dom } from "./dom.js";
import { downloadBlob } from "./download.js";
import { pdfQueue } from "./state.js";

const EXPORT_SCALE = 3;
const PAGE_YIELD_MS = 120;

/**
 * Converts the complete queue to PNG files without uploading source documents.
 *
 * @returns {Promise<void>} Resolves after all queued pages have been downloaded.
 */
export async function startConversion() {
	if (!pdfQueue.length || dom.convertButton.disabled) {
		return;
	}
	setWorking(true);
	let processed = 0;
	const totalPages = pdfQueue.reduce((total, item) => total + item.numPages, 0);
	try {
		for (const item of pdfQueue) {
			for (let pageNumber = 1; pageNumber <= item.numPages; pageNumber += 1) {
				await convertPage(item, pageNumber);
				processed += 1;
				revealProgress(processed, totalPages);
				await new Promise(resolve => setTimeout(resolve, PAGE_YIELD_MS));
			}
		}
		revealDone();
	} finally {
		dom.convertButton.disabled = false;
	}
}

/** @param {object} item Queue record. @param {number} pageNumber One-based page number. @returns {Promise<void>} */
async function convertPage(item, pageNumber) {
	const page = await item.pdfObj.getPage(pageNumber);
	const viewport = page.getViewport({ scale: EXPORT_SCALE });
	const canvas = dom.hiddenCanvas;
	canvas.width = Math.max(1, Math.ceil(viewport.width));
	canvas.height = Math.max(1, Math.ceil(viewport.height));
	await page.render({
		canvasContext: canvas.getContext("2d"),
		viewport
	}).promise;
	const blob = await canvasBlob(canvas);
	downloadBlob(blob, `${item.fileName}_page-${pageNumber}.png`);
}

/** @param {HTMLCanvasElement} canvas Render target. @returns {Promise<Blob>} PNG blob. */
function canvasBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob(blob => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("pdf_page_png_failed"));
			}
		}, "image/png");
	});
}

/** @param {boolean} working Whether conversion is starting. @returns {void} */
function setWorking(working) {
	dom.convertButton.disabled = working;
	dom.convertButton.innerHTML = '<i class="fa-solid fa-spinner"></i> Processing...';
	dom.progressContainer.style.display = "block";
}

/** @param {number} processed Completed pages. @param {number} total Total pages. @returns {void} */
function revealProgress(processed, total) {
	const percent = total > 0 ? (processed / total) * 100 : 0;
	dom.progressBar.style.width = `${Math.min(100, percent)}%`;
}

/** Reveals completion briefly, then restores the ordinary conversion control. */
function revealDone() {
	dom.convertButton.innerHTML = '<i class="fa-solid fa-check"></i> Done!';
	setTimeout(() => {
		dom.convertButton.innerHTML = '<i class="fa-solid fa-bolt"></i> Convert & Download';
		dom.progressBar.style.width = "0%";
		dom.progressContainer.style.display = "none";
	}, 3000);
}
