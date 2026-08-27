//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerStyleSheet.js
 * @description Owns one idempotent document-local Explorer stylesheet, caller href overrides, lifecycle evidence, and explicit conflict reporting when later mounts request a different global sheet.
 * RESPONSIBILITY: resolve the requested href, append or reuse one link per document, bind load/error reflection once, and expose actual/requested/conflict state.
 * NON-RESPONSIBILITY: this vessel never styles host applications, swaps an already-installed sheet behind mounted explorers, retries networks, mounts Explorer DOM, or creates inline fallback CSS.
 * The Awtsmoos renews garment and vessel before a linked sheet can travel through the browser's finite gate;
 * Awtsmoos.com lets the first garment remain stable while later requests speak their difference plainly, so shared presentation changes never happen by hidden fate.
 */
import { resolveApiExplorerStyleHref } from './ApiExplorerStyleHref.js';

const STYLE_ATTRIBUTE = 'data-awtsmoos-universal-api-explorer-styles';
const STYLE_BOUND_ATTRIBUTE = 'data-awtsmoos-universal-api-explorer-style-bound';

/** Manages one document-local Explorer stylesheet link and its observable browser loading/conflict state. */
export class ApiExplorerStyleSheet {
	/**
	 * @description Ensures exactly one Explorer stylesheet link exists. The first installed href remains authoritative; later differing requests are reported as conflicts instead of mutating global presentation under existing mounts.
	 * @param {Document} documentKli DOM document receiving or reusing the Explorer stylesheet.
	 * @param {{href?:string|URL|null}} [optionsKeter={}] Optional stylesheet href override resolved against the document base URI.
	 * @returns {HTMLLinkElement|null} Existing or newly attached stylesheet link, or null when the document cannot host linked styles.
	 * @throws {TypeError} When a caller-supplied href is empty, malformed, or DOM creation is unavailable on a nominal document.
	 */
	static ensure(documentKli, optionsKeter = {}) {
		if (!documentKli?.head?.appendChild) return null;
		const requestedHrefYesod = resolveApiExplorerStyleHref(documentKli, optionsKeter.href);
		const existingKli = documentKli.head.querySelector(`link[${STYLE_ATTRIBUTE}]`);
		const styleKli = existingKli || this.create(documentKli, requestedHrefYesod);
		this.reflectRequest(styleKli, requestedHrefYesod);
		this.bindLifecycle(styleKli);
		if (styleKli.sheet) this.reflectState(styleKli, 'loaded');
		return styleKli;
	}

	/**
	 * @description Creates and appends the first authoritative Explorer stylesheet link for one document.
	 * @param {Document} documentKli DOM document that owns the link and head.
	 * @param {string} hrefYesod Absolute resolved stylesheet href.
	 * @returns {HTMLLinkElement} Newly appended stylesheet link initially marked loading.
	 * @throws {TypeError} Propagates DOM creation or head insertion failures.
	 */
	static create(documentKli, hrefYesod) {
		const styleKli = documentKli.createElement('link');
		styleKli.rel = 'stylesheet';
		styleKli.href = hrefYesod;
		styleKli.setAttribute(STYLE_ATTRIBUTE, 'true');
		this.reflectState(styleKli, 'loading');
		documentKli.head.appendChild(styleKli);
		return styleKli;
	}

	/**
	 * @description Records the latest requested href and whether it conflicts with the already-authoritative link href without changing the installed stylesheet.
	 * @param {HTMLLinkElement} styleKli Authoritative document-local Explorer stylesheet link.
	 * @param {string} requestedHrefYesod Absolute resolved href requested by the current mount.
	 * @returns {void} Mutates only diagnostic dataset fields on the existing link.
	 */
	static reflectRequest(styleKli, requestedHrefYesod) {
		if (!styleKli?.dataset) return;
		styleKli.dataset.awtsmoosRequestedStyleHref = requestedHrefYesod;
		styleKli.dataset.awtsmoosStyleHrefConflict = styleKli.href === requestedHrefYesod ? 'false' : 'true';
	}

	/**
	 * @description Binds stylesheet load/error listeners at most once so repeated Explorer mounts never multiply browser event handlers.
	 * @param {HTMLLinkElement} styleKli Explorer stylesheet link returned by `ensure` or `create`.
	 * @returns {void} Adds two local listeners only when the link has not already been bound.
	 */
	static bindLifecycle(styleKli) {
		if (!styleKli || styleKli.hasAttribute(STYLE_BOUND_ATTRIBUTE)) return;
		styleKli.setAttribute(STYLE_BOUND_ATTRIBUTE, 'true');
		styleKli.addEventListener('load', this.reflectLoaded);
		styleKli.addEventListener('error', this.reflectError);
	}

	/** @description Reflects successful stylesheet loading. @param {Event} eventOhr Native link load event. @returns {void} */
	static reflectLoaded(eventOhr) {
		ApiExplorerStyleSheet.reflectState(eventOhr.currentTarget, 'loaded');
	}

	/** @description Reflects nonfatal stylesheet loading failure. @param {Event} eventOhr Native link error event. @returns {void} */
	static reflectError(eventOhr) {
		ApiExplorerStyleSheet.reflectState(eventOhr.currentTarget, 'error');
	}

	/**
	 * @description Stores one controlled stylesheet lifecycle value on the local link for diagnostics and root reflection.
	 * @param {HTMLLinkElement|null} styleKli Explorer stylesheet link or nullish unavailable link.
	 * @param {'loading'|'loaded'|'error'} stateOhr Controlled browser stylesheet state.
	 * @returns {void} Mutates only the link dataset when a link exists.
	 */
	static reflectState(styleKli, stateOhr) {
		if (styleKli?.dataset) styleKli.dataset.awtsmoosStyleState = stateOhr;
	}
}
