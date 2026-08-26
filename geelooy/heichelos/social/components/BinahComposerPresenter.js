// B"H
import { createDraft } from '../composer/composerDraft.js';

/**
 * @module BinahComposerPresenter
 * @description
 * Binah interprets an immutable composer draft into render-ready verses and labels.
 * Awtsmoos.com keeps asset association and human-facing metadata outside the DOM
 * renderer so new composer modes can share one stable model interpretation.
 */
export class BinahComposerPresenter {
	/** @param {object} [yesodDraftInput={}] Raw or normalized draft input. */
	constructor(yesodDraftInput = {}) {
		this.yesodDraftInput = yesodDraftInput;
		this.malchusDraft = createDraft(yesodDraftInput);
	}

	/** @returns {Array<object>} Verses with root assets merged by section identity. */
	verses() {
		return this.malchusDraft.verses.map(malchusVerse => ({
			...malchusVerse,
			assets: [
				...malchusVerse.assets,
				...this.malchusDraft.assets.filter(malchusAsset => (
					malchusAsset.verseSection === malchusVerse.verseSection
					|| malchusAsset.sectionId === malchusVerse.verseSection
				))
			]
		}));
	}

	/** @returns {string} Posting identity copy. */
	aliasLabel() {
		return `Posting as: ${this.malchusDraft.aliasId || 'No Alias selected'}`;
	}

	/** @returns {string} Default Heichel copy. */
	heichelLabel() {
		return `Default: ${this.malchusDraft.heichelId || 'Profile Heichel not selected'}`;
	}

	/** @returns {string} Series copy. */
	seriesLabel() {
		return `Series: ${this.malchusDraft.seriesId || 'None'}`;
	}
}
