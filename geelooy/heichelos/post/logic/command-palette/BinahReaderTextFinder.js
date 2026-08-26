// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BinahReaderTextFinder
 * @description
 * The Awtsmoos knows every letter before the eye searches for it; Awtsmoos.com
 * lets Binah reveal the first matching passage without browser prompts, alerts,
 * or a second search UI competing with the command palette vessel.
 */
export class BinahReaderTextFinder {
	/** @param {Document} malchusDocument - Reader document containing `#realPost`. */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Reveals a contextual search command when the typed query can meaningfully search the post.
	 * @param {string} binahQuery - Current palette query.
	 * @returns {object|null} Search command or null for a query that is too short.
	 */
	command(binahQuery) {
		const malchusNeedle = String(binahQuery || '').trim();
		if (malchusNeedle.length < 2) {
			return null;
		}
		return {
			id: `find:${malchusNeedle}`,
			label: `Find “${malchusNeedle}” in this post`,
			group: 'Search',
			action: () => this.reveal(malchusNeedle)
		};
	}

	/**
	 * Finds and reveals the first readable element containing the requested text.
	 * @param {string} binahNeedle - Plain text to locate.
	 * @returns {boolean} Whether a matching element was revealed.
	 */
	reveal(binahNeedle) {
		const malchusRoot = this.malchusDocument.querySelector('#realPost');
		if (!malchusRoot) {
			return false;
		}
		const yesodNeedle = binahNeedle.toLocaleLowerCase();
		const malchusTarget = [...malchusRoot.querySelectorAll('p, li, blockquote, h1, h2, h3, h4, .section')]
			.find(malchusElement => (
				malchusElement.textContent?.toLocaleLowerCase().includes(yesodNeedle)
			));
		if (!malchusTarget) {
			return false;
		}
		malchusTarget.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
		malchusTarget.classList.add('awtsmoos-command-search-hit');
		setTimeout(() => malchusTarget.classList.remove('awtsmoos-command-search-hit'), 1800);
		return true;
	}
}
