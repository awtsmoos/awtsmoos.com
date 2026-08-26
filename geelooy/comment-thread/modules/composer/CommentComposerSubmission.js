//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerSubmission
 * @description
 * Gevurah guards the boundary between a rich local draft and the mutation callback.
 * The Awtsmoos is beyond empty and full; Awtsmoos.com keeps validation and submission
 * wiring in one focused vessel so composer manifestation stays visually and logically clear.
 */
import { hasChaiRichBody } from './CommentComposerFields.js';

export class GevurahCommentComposerSubmissionController {
	/**
	 * Creates one submission binder around manifest state and the historic callback seam.
	 * @param {{store:object, parentId:string, status:HTMLElement, onSubmit:Function}} yesodOptions Submission collaborators.
	 */
	constructor({ store, parentId, status, onSubmit }) {
		this.yesodStore = store;
		this.yesodParentId = parentId || '';
		this.tiferesStatus = status;
		this.onSubmit = onSubmit;
	}

	/**
	 * Binds one composer form without changing its existing FormData or callback contract.
	 * @param {HTMLFormElement} malchusForm Composer form receiving submit behavior.
	 * @returns {HTMLFormElement} The same form for fluent factory composition.
	 */
	bind(malchusForm) {
		malchusForm.addEventListener('submit', event => {
			event.preventDefault();
			if (!hasChaiRichBody(malchusForm, this.yesodStore)) {
				this.tiferesStatus.textContent = 'Add text, a voice note, media, a transcript, or a link first.';
				return;
			}
			this.onSubmit(
				malchusForm,
				this.yesodParentId,
				this.tiferesStatus
			);
		});
		return malchusForm;
	}
}
