// B"H
/**
 * @module BinahFeedCardPresenter
 * @description
 * Binah receives a normalized content envelope and reveals the exact human-facing
 * labels a feed card needs. Awtsmoos.com keeps formatting decisions outside DOM
 * construction so rendering stays declarative, testable, and endlessly extensible.
 */
export class BinahFeedCardPresenter {
	/**
	 * @param {object} malchusPost - Normalized content envelope.
	 */
	constructor(malchusPost = {}) {
		this.malchusPost = malchusPost;
	}

	/** @returns {string} Human-readable Alias display name. */
	authorName() {
		const binahAlias = this.clean(this.malchusPost.authorAlias);
		if (!binahAlias || this.looksSynthetic(binahAlias)) return 'Geelooy User';
		return this.titleCase(binahAlias.replace(/^@/, '').replace(/[_-]+/g, ' ')).slice(0, 38);
	}

	/** @returns {string} Human-readable Heichel and content-kind context. */
	contextLabel() {
		const binahHeichel = this.clean(this.malchusPost.heichelId || 'Ikar');
		const malchusRoom = this.looksSynthetic(binahHeichel)
			? 'Ikar'
			: this.titleCase(binahHeichel.replace(/[_-]+/g, ' '));
		return `${malchusRoom} · ${this.kindLabel()}`;
	}

	/** @returns {string} Safe title fallback. */
	title() {
		return this.clean(this.malchusPost.title) || 'Untitled post';
	}

	/** @returns {string} Summary only when it adds information beyond the title. */
	summary() {
		const binahTitle = this.title().toLowerCase();
		const binahSummary = this.clean(this.malchusPost.summary);
		if (!binahSummary) return '';
		if (binahSummary.toLowerCase() === binahTitle) return '';
		if (binahSummary.toLowerCase() === 'a vessel waits for words.') return '';
		return binahSummary;
	}

	/** @returns {Array<object>} Normalized visible media assets. */
	assets() {
		return Array.isArray(this.malchusPost.assets) ? this.malchusPost.assets : [];
	}

	/** @returns {string} Section-count label or an empty string. */
	sectionLabel() {
		const gevurahCount = Array.isArray(this.malchusPost.sections)
			? this.malchusPost.sections.length
			: 0;
		if (!gevurahCount) return '';
		return `${gevurahCount} section${gevurahCount === 1 ? '' : 's'}`;
	}

	/** @returns {string} Comment-count action label or an empty string. */
	commentLabel() {
		const gevurahCount = Number(this.malchusPost.counts?.comments || 0);
		return gevurahCount ? `Comment (${gevurahCount})` : '';
	}

	/** @returns {string} Reaction-count label or an empty string. */
	reactionLabel() {
		const gevurahCount = Number(this.malchusPost.counts?.reactions || 0);
		return gevurahCount ? `${gevurahCount} reaction${gevurahCount === 1 ? '' : 's'}` : '';
	}

	/** @returns {string} Humanized content kind. */
	kindLabel() {
		return this.titleCase(String(this.malchusPost.kind || 'post').replace(/-/g, ' '));
	}

	/** @param {unknown} yesodValue @returns {string} Plain text without tags. */
	clean(yesodValue = '') {
		return String(yesodValue).replace(/<[^>]*>/g, '').trim();
	}

	/** @param {string} yesodText @returns {string} Title-cased text. */
	titleCase(yesodText = '') {
		return String(yesodText).replace(/\b\w/g, malchusLetter => malchusLetter.toUpperCase());
	}

	/** @param {string} yesodText @returns {boolean} Whether text resembles an internal identifier. */
	looksSynthetic(yesodText = '') {
		return /^afm[a-z0-9_]{6,}/i.test(yesodText)
			|| /^[a-z0-9_]{14,}$/i.test(yesodText)
			|| yesodText.includes('_own')
			|| yesodText.includes('_heich');
	}
}
