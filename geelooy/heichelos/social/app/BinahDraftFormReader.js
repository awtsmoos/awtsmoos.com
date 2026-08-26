// B"H
import { createDraft, toPostPayload } from '../composer/composerDraft.js';

/**
 * @module BinahDraftFormReader
 * @description
 * Binah reads finite form controls back into the immutable social draft model.
 * DOM extraction and API serialization remain outside lifecycle orchestration so
 * future composer fields can evolve without rewriting boot logic.
 */
export class BinahDraftFormReader {
	/**
	 * Merges a submitted form into the current immutable draft.
	 * @param {object} yesodDraft - Current composer draft.
	 * @param {HTMLFormElement|object|null} malchusForm - Form-like object.
	 * @returns {object} New normalized draft.
	 */
	read(yesodDraft, malchusForm) {
		if (!malchusForm) return createDraft(yesodDraft);
		const binahFields = new FormData(malchusForm);
		return createDraft({
			...yesodDraft,
			title: binahFields.get('title') || yesodDraft.title,
			verses: yesodDraft.verses.map(malchusVerse => this.readVerse(malchusVerse, binahFields))
		});
	}

	/**
	 * Reads one verse from form fields without mutating the original verse.
	 * @param {object} yesodVerse - Existing verse.
	 * @param {FormData} binahFields - Submitted form fields.
	 * @returns {object} Updated verse.
	 */
	readVerse(yesodVerse, binahFields) {
		const yesodSection = yesodVerse.verseSection;
		return {
			...yesodVerse,
			title: binahFields.get(`${yesodSection}-title`) || yesodVerse.title,
			body: binahFields.get(`${yesodSection}-body`)
				|| (yesodSection === 'root' ? binahFields.get('root') : yesodVerse.body)
		};
	}

	/**
	 * Converts an immutable draft into the current API payload contract.
	 * @param {object} yesodDraft - Composer draft.
	 * @returns {object} Social-post API payload.
	 */
	toApiPayload(yesodDraft) {
		const binahPayload = toPostPayload(yesodDraft);
		return {
			...binahPayload,
			sections: binahPayload.sections.toString(),
			assets: binahPayload.assets
		};
	}
}
