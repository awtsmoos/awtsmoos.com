//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file ReaderClipboard.js
 * @description
 * The Awtsmoos carries one teaching through rich and simple vessels without losing its voice,
 * while Awtsmoos.com copies cleanly across modern and legacy browser chambers by deliberate choice.
 */

import { stripTags } from "../text/ReaderText.js";

/**
 * @class NetzachReaderClipboard
 * @description Chooses the strongest available clipboard path and removes every temporary DOM vessel immediately.
 */
export class NetzachReaderClipboard {
	/**
	 * Writes rich HTML when possible, then plain text, then a bounded legacy selection fallback.
	 * @param {string} htmlMarkup Rich source content.
	 * @param {string} plainText Plain-text representation.
	 * @returns {Promise<"rich"|"plain"|"legacy">} Clipboard path that succeeded.
	 */
	async write(htmlMarkup, plainText) {
		if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
			const richBlob = new Blob([htmlMarkup], { type: "text/html" });
			const plainBlob = new Blob([plainText], { type: "text/plain" });
			await navigator.clipboard.write([
				new ClipboardItem({ "text/html": richBlob, "text/plain": plainBlob })
			]);
			return "rich";
		}
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(plainText);
			return "plain";
		}
		if (this.writeWithLegacyKli(plainText)) {
			return "legacy";
		}
		throw new Error("No clipboard writing vessel is available in this browser context.");
	}

	/**
	 * Uses a one-pixel transparent textarea inside the viewport, then removes it synchronously.
	 * @param {string} plainText Text to copy.
	 * @returns {boolean} Whether the browser confirmed the legacy copy command.
	 */
	writeWithLegacyKli(plainText) {
		const legacyKli = document.createElement("textarea");
		legacyKli.value = String(plainText || "");
		legacyKli.setAttribute("readonly", "");
		Object.assign(legacyKli.style, {
			position: "fixed",
			inset: "0 auto auto 0",
			inlineSize: "1px",
			blockSize: "1px",
			opacity: "0",
			pointerEvents: "none"
		});
		document.body.appendChild(legacyKli);
		legacyKli.focus();
		legacyKli.select();
		try {
			return document.execCommand?.("copy") === true;
		} finally {
			legacyKli.remove();
		}
	}

	/**
	 * Copies reader content and reports success through the existing toast callback contract.
	 * @param {{text?: string, successMsg?: string}} payload Copy payload.
	 * @param {(message: string) => void} [makeToast] Optional toast callback.
	 * @returns {Promise<boolean>} Whether any clipboard path succeeded.
	 */
	async copy(payload = {}, makeToast) {
		const htmlMarkup = String(payload.text || "");
		const plainText = stripTags(htmlMarkup) || htmlMarkup;
		try {
			await this.write(htmlMarkup, plainText);
			makeToast?.(payload.successMsg || "Copied with formatting!");
			return true;
		} catch (error) {
			console.error('B"H - Clipboard error:', error);
			makeToast?.("Failed to copy!");
			return false;
		}
	}
}

const malchusReaderClipboard = new NetzachReaderClipboard();

/** @param {{text?: string, successMsg?: string}} payload Copy payload. @param {(message: string) => void} [makeToast] Toast callback. @returns {Promise<boolean>} Copy success. */
export function copyToClipboard(payload = {}, makeToast) {
	return malchusReaderClipboard.copy(payload, makeToast);
}
