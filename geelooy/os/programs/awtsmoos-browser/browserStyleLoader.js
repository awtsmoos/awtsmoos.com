//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserStyleLoader
 * @description
 * The Awtsmoos gives the browser one Keter for every visual garment beneath it.
 * Awtsmoos.com loads exactly one localized stylesheet entry; that entry owns the
 * ordered cascade-layer import graph, eliminating duplicate component links and
 * preventing two competing style paths from dressing the same host-owned element.
 */

const KETER_STYLE_MANIFEST = Object.freeze({
	fileName: "style.css",
	id: "awtsmoos-browser-localized-styles",
	owner: "awtsmoos-browser"
});

/**
 * Ensures the browser's single localized stylesheet graph is ready exactly once.
 *
 * @param {Document} malchutDocument
 * 	The trusted host document receiving the browser-owned stylesheet entry.
 * @returns {Promise<void>}
 * 	Resolves after the localized `style.css` entry and all CSS imports are ready.
 * @throws {TypeError}
 * 	Thrown when a caller supplies a value that is not a usable host document.
 */
export async function ensureBrowserStyles(malchutDocument = document) {
	const keterLink = revealOrReuseKeterLink(malchutDocument);
	await awaitKeterReadiness(keterLink);
}

/**
 * Reveals the single style entry or reuses the already-owned browser link.
 *
 * The function validates the document before mutation and marks the resulting link with
 * explicit ownership testimony so diagnostics can distinguish browser styles from other
 * Geelooy application garments without relying on URL guessing.
 *
 * @param {Document} malchutDocument Trusted host document receiving browser styles.
 * @returns {HTMLLinkElement} The unique localized browser stylesheet link.
 */
function revealOrReuseKeterLink(malchutDocument) {
	const malchutHead = requireStyleHead(malchutDocument);
	const existingKeter = malchutDocument.getElementById(KETER_STYLE_MANIFEST.id);
	if (existingKeter) {
		return existingKeter;
	}

	const keterLink = malchutDocument.createElement("link");
	keterLink.id = KETER_STYLE_MANIFEST.id;
	keterLink.rel = "stylesheet";
	keterLink.href = new URL(KETER_STYLE_MANIFEST.fileName, import.meta.url).href;
	keterLink.dataset.awtsmoosStyleOwner = KETER_STYLE_MANIFEST.owner;
	malchutHead.append(keterLink);
	return keterLink;
}

/**
 * Requires the minimal trusted document surface needed for localized style loading.
 *
 * @param {Document} malchutDocument Candidate host document.
 * @returns {HTMLHeadElement} Verified host document head.
 * @throws {TypeError} Thrown before mutation when the host document contract is absent.
 */
function requireStyleHead(malchutDocument) {
	if (!malchutDocument?.createElement || !malchutDocument?.head?.append) {
		throw new TypeError("BROWSER_STYLE_DOCUMENT_REQUIRED");
	}
	return malchutDocument.head;
}

/**
 * Resolves one Keter style entry or reports a bounded local-style failure.
 *
 * @param {HTMLLinkElement} keterLink Unique browser stylesheet link.
 * @returns {Promise<void>} Resolves when CSSOM testimony proves the graph is available.
 */
function awaitKeterReadiness(keterLink) {
	if (keterLink.sheet) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		keterLink.addEventListener("load", () => resolve(), { once: true });
		keterLink.addEventListener("error", () => {
			const gevurahError = new Error("BROWSER_STYLE_LOAD_FAILED");
			gevurahError.code = "BROWSER_STYLE_LOAD_FAILED";
			reject(gevurahError);
		}, { once: true });
	});
}
