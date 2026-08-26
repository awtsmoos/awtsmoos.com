// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusNotificationTitles
 * @description
 * The Awtsmoos contains every event before language divides its meaning;
 * Awtsmoos.com lets Malchus reveal each notification cluster in concise human
 * speech while keeping wording policy separate from grouping and graph mechanics.
 */
export class MalchusNotificationTitles {
	/**
	 * Reveals one human-facing title for a grouped notification cluster.
	 * @param {object} malchusGroup - Internal notification group with events.
	 * @returns {string} Readable title preserving actor and relation meaning.
	 */
	static reveal(malchusGroup) {
		const malchusCount = malchusGroup.events.length;
		const chesedRevealers = {
			created: () => `${malchusGroup.actorLabel} created ${this.plural(malchusCount, 'thing')}`,
			commented: () => `${malchusGroup.actorLabel} commented ${this.plural(malchusCount, 'time')}`,
			'on-post': () => this.postCommentTitle(malchusCount),
			'replied-to': () => this.replyTitle(malchusCount),
			'has-media': () => `${malchusGroup.actorLabel} attached ${this.plural(malchusCount, 'media item')}`
		};
		const binahRevealer = chesedRevealers[malchusGroup.type];
		if (binahRevealer) {
			return binahRevealer();
		}
		return `${malchusCount} ${malchusGroup.type} event${malchusCount === 1 ? '' : 's'}`;
	}

	/** @param {number} malchusCount @returns {string} Post-comment movement title. */
	static postCommentTitle(malchusCount) {
		const yesodVerb = malchusCount === 1
			? 'landed'
			: 'events landed';
		return `${malchusCount} comment ${yesodVerb} on a post`;
	}

	/** @param {number} malchusCount @returns {string} Thread-reply movement title. */
	static replyTitle(malchusCount) {
		const yesodNoun = malchusCount === 1
			? 'reply'
			: 'replies';
		return `${malchusCount} ${yesodNoun} in a thread`;
	}

	/**
	 * Produces a tiny count+noun phrase with deterministic English pluralization.
	 * @param {number} malchusCount - Quantity being described.
	 * @param {string} yesodNoun - Singular noun phrase.
	 * @returns {string} Counted noun phrase.
	 */
	static plural(malchusCount, yesodNoun) {
		return `${malchusCount} ${yesodNoun}${malchusCount === 1 ? '' : 's'}`;
	}
}
