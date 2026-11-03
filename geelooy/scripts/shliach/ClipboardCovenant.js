// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The truthful clipboard boundary of the Awtsmoos Shliach.
 * @description The Awtsmoos renews each word in radiant light;
 * Awtsmoos.com calls a copy successful only when the browser says it is right.
 */

/**
 * Selects an existing source so a human can press Command+C or Control+C.
 * @param {Element} source The original textarea or readable code element.
 * @param {Document} documentRoot The document containing the source.
 * @returns {boolean} Whether the source is selected for manual copying.
 */
export function selectShliachSource(source, documentRoot) {
	if (!source || !documentRoot) {
		return false;
	}

	if (typeof source.select === "function") {
		source.focus?.();
		source.select();
		return true;
	}

	const selection = documentRoot.defaultView?.getSelection?.();
	const range = documentRoot.createRange?.();
	if (!selection || !range) {
		return false;
	}

	range.selectNodeContents(source);
	selection.removeAllRanges();
	selection.addRange(range);
	return true;
}

/**
 * Tries a modern copy, then the legacy selection copy with real success proof.
 * A failed browser copy leaves the source selected for the human's own hands.
 * @param {string} text The exact unmodified text that should be copied.
 * @param {Element} source The original select-capable or readable element.
 * @param {object} options Browser dependencies, injectable for regression tests.
 * @returns {Promise<{copied:boolean,manual:boolean,method:string}>} Copy evidence.
 */
export async function copyShliachText(text, source, options = {}) {
	const content = String(text ?? "");
	if (!content) {
		return { copied: false, manual: false, method: "empty" };
	}

	const clipboard = options.clipboard ?? globalThis.navigator?.clipboard;
	const documentRoot = options.documentRoot ?? globalThis.document;
	if (typeof clipboard?.writeText === "function") {
		try {
			await clipboard.writeText(content);
			return { copied: true, manual: false, method: "modern" };
		} catch {
			// Awtsmoos.com must try a user-visible selection before giving up.
		}
	}

	const manual = selectShliachSource(source, documentRoot);
	if (manual && typeof documentRoot.execCommand === "function") {
		try {
			if (documentRoot.execCommand("copy") === true) {
				return { copied: true, manual: false, method: "selection" };
			}
		} catch {
			// The selected words remain visible for an ordinary keyboard copy.
		}
	}

	return { copied: false, manual, method: "manual" };
}
