//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDataRuntime.js
 * @description The Awtsmoos gives declared movie data a browser vessel while its garment arrives through proper CSS light;
 * Awtsmoos.com mounts data, validation, preview, and export without treating styles or natural language as module insight.
 */
import { mountMovieDataDock } from './MovieDataDock.js';

const STYLE_SELECTOR = '[data-awtsmoos-movie-style]';
let stylesReady = null;

/**
 * @param {object} options App identity, projector, export callback, and optional initial movie.
 * @returns {Promise<object|null>} Mounted runtime, or null outside a DOM environment.
 */
export async function installMovieDataRuntime(options = {}) {
	if (typeof document === 'undefined') {
		return null;
	}
	await domReady();
	await ensureMovieStyles();
	return mountMovieDataDock(options);
}

/** @returns {Promise<void>} Resolves after the canonical stylesheet settles without blocking runtime forever. */
export function ensureMovieStyles() {
	if (typeof document === 'undefined') {
		return Promise.resolve();
	}
	if (stylesReady) {
		return stylesReady;
	}
	stylesReady = settleStylesheet(existingStyleLink() || createStyleLink());
	return stylesReady;
}

/** @returns {HTMLLinkElement|null} Existing canonical stylesheet link. */
function existingStyleLink() {
	return document.querySelector(STYLE_SELECTOR);
}

/** @returns {HTMLLinkElement} Newly appended canonical stylesheet link. */
function createStyleLink() {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = new URL('./movie-dock.css', import.meta.url).href;
	link.dataset.awtsmoosMovieStyle = 'canonical-data';
	document.head.append(link);
	return link;
}

/** @param {HTMLLinkElement} link Stylesheet vessel. @returns {Promise<void>} Settled readiness. */
function settleStylesheet(link) {
	if (link.sheet) {
		return Promise.resolve();
	}
	return new Promise(resolve => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			link.removeEventListener('load', finish);
			link.removeEventListener('error', finish);
			resolve();
		};
		link.addEventListener('load', finish, { once: true });
		link.addEventListener('error', finish, { once: true });
		setTimeout(finish, 2000);
	});
}

/** @returns {Promise<void>} Resolves when body/head mounting is safe. */
function domReady() {
	if (document.readyState !== 'loading') {
		return Promise.resolve();
	}
	return new Promise(resolve => {
		document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
	});
}
