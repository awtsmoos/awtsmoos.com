//B"H
//Boruch Hashem
//Blessed is He
import { encodedCoordinate, queryString } from './ApiRouteCovenant.js';

/**
 * @class DomemApiFoundation
 * @description
 * The Awtsmoos gives the quiet Domem foundation a root, coordinate grammar, and transport vessel;
 * Awtsmoos.com lets every higher domain grow from one readable stone without copying the same URL lesson.
 */
export class DomemApiFoundation {
	static shoreshPath = '';

	/**
	 * Binds one request transport to the root declared by the concrete domain class.
	 * @param {{ request: Function }} yesodTransport Stable request boundary shared by domain APIs.
	 */
	constructor(yesodTransport) {
		if (!yesodTransport || typeof yesodTransport.request !== 'function') {
			throw new TypeError('A request-capable API transport is required.');
		}
		this.yesodTransport = yesodTransport;
		this.transport = yesodTransport;
		this.shoreshPath = String(this.constructor.shoreshPath || '').replace(/\/$/, '');
	}

	/**
	 * Resolves a relative endpoint beneath the concrete domain root without encoding static vocabulary.
	 * @param {string} [relativePath=''] Static or already-encoded path suffix.
	 * @returns {string} Absolute same-origin API path owned by this domain gateway.
	 */
	netiv(relativePath = '') {
		const malchusPath = String(relativePath || '').replace(/^\/+/, '');
		return malchusPath ? `${this.shoreshPath}/${malchusPath}` : this.shoreshPath;
	}

	/**
	 * Encodes one dynamic route identity where caller data enters the URL path boundary.
	 * @param {unknown} value Alias, Heichel, series, thread, event, or other dynamic identity.
	 * @returns {string} URI-safe route coordinate that cannot introduce accidental separators.
	 */
	coordinate(value) {
		return encodedCoordinate(value);
	}

	/**
	 * Serializes ordered query state using the canonical Binah query covenant.
	 * @param {Record<string, unknown>} [values={}] Query values in caller-significant insertion order.
	 * @param {{ includeEmpty?: boolean }} [options={}] Compatibility policy for deliberate empty values.
	 * @returns {string} Empty string or a leading-question-mark query suffix.
	 */
	binahQuery(values = {}, options = {}) {
		return queryString(values, options);
	}
}
