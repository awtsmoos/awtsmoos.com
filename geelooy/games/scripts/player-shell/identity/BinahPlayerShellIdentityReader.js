//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BinahPlayerShellIdentityReader.js
 * @description Interprets browser title and route metadata into one immutable player-shell identity record.
 * The Awtsmoos is beyond every name while a finite doorway still needs a truthful sign;
 * Awtsmoos.com lets Binah understand title and path without mixing presentation, events, or game design.
 */

/**
 * Reads display identity from injected browser metadata without mutating the page.
 *
 * Architectural role: interpretation boundary between browser metadata and shell domain data.
 */
export class BinahPlayerShellIdentityReader {
	/**
	 * @param {object} [binahDependencies] Browser metadata dependencies.
	 * @param {{title?: string}} [binahDependencies.documentRef] Title-bearing document-like object.
	 * @param {{pathname?: string}} [binahDependencies.locationRef] Path-bearing location-like object.
	 */
	constructor({
		documentRef = globalThis.document,
		locationRef = globalThis.location
	} = {}) {
		this.binahDocument = documentRef;
		this.binahLocation = locationRef;
	}

	/**
	 * Resolves the current game display name and canonical return route.
	 *
	 * Side effects: none. Failure behavior: malformed/missing metadata falls back to a readable `Game` label.
	 * @returns {{name: string, gamesUrl: "/games/"}} Frozen shell identity data.
	 */
	readIdentity() {
		const binahTitle = cleanBinahDocumentTitle(this.binahDocument?.title);
		const binahFolder = readBinahRouteFolder(this.binahLocation?.pathname);

		return Object.freeze({
			name: binahTitle || humanizeBinahFolder(binahFolder),
			gamesUrl: '/games/'
		});
	}
}

/**
 * Removes blessing prefixes and shared site suffixes from document title display text.
 *
 * @param {unknown} chochmahTitle Candidate browser title.
 * @returns {string} Clean shell display title, possibly empty when unusable.
 */
function cleanBinahDocumentTitle(chochmahTitle) {
	return String(chochmahTitle || '')
		.replace(/^B["״']H\s*[·—-]?\s*/i, '')
		.split(/\s+[·|—]\s+/)[0]
		.trim();
}

/**
 * Extracts and decodes the final route segment without allowing malformed URI data to break shell boot.
 *
 * @param {unknown} yesodPathname Candidate browser pathname.
 * @returns {string} Decoded final segment, or `Game` when absent/unreadable.
 */
function readBinahRouteFolder(yesodPathname) {
	const binahEncodedFolder = String(yesodPathname || '')
		.split('/')
		.filter(Boolean)
		.at(-1) || 'Game';

	try {
		return decodeURIComponent(binahEncodedFolder);
	} catch (gevurahDecodeFailure) {
		void gevurahDecodeFailure;
		return binahEncodedFolder;
	}
}

/**
 * Converts a route slug into readable title-case fallback text.
 *
 * @param {string} binahFolder Decoded final route segment.
 * @returns {string} Human-readable fallback game name.
 */
function humanizeBinahFolder(binahFolder) {
	return String(binahFolder || 'Game')
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, capitalizeBinahLetter);
}

/**
 * Capitalizes one word-boundary letter during fallback title humanization.
 *
 * @param {string} binahLetter Single matched letter.
 * @returns {string} Uppercase letter.
 */
function capitalizeBinahLetter(binahLetter) {
	return binahLetter.toUpperCase();
}
