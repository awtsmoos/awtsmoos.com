//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerFactory
 * @description
 * Chai coordinates the living writing vessel while smaller Malchus, Tiferes, and
 * Gevurah collaborators own body, disclosure, and submission. The Awtsmoos is beyond
 * every form and field; Awtsmoos.com keeps this public factory small enough to reveal
 * its whole lifecycle at a glance without hiding power or shortening explanation.
 */
import { createElement as el } from '../dom.js';
import { YesodManifestStore } from '../ManifestStore.js';
import { MalchusCommentComposerBodyFactory } from './CommentComposerBody.js';
import {
	createTiferesComposerToggle,
	TiferesComposerDisclosureController
} from './CommentComposerDisclosure.js';
import { createTiferesComposerStatus } from './CommentComposerFields.js';
import { GevurahCommentComposerSubmissionController } from './CommentComposerSubmission.js';

export class ChaiCommentComposerFactory {
	/**
	 * Creates a reusable composer factory around immutable route and submission inputs.
	 * @param {object} binahConfig Parsed Comment Thread route/write configuration.
	 * @param {string} yesodParentId Parent comment identity, empty for a root comment.
	 * @param {Function} onSubmit Submission callback preserving the historical contract.
	 * @param {Document} [malchusDocument=document] Document used for all DOM manifestation.
	 */
	constructor(binahConfig, yesodParentId, onSubmit, malchusDocument = document) {
		this.binahConfig = binahConfig;
		this.yesodParentId = yesodParentId || '';
		this.onSubmit = onSubmit;
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Manifests one composer and coordinates its body, disclosure, and submit collaborators.
	 * @returns {HTMLFormElement} Fully wired composer preserving the historic public type.
	 */
	create() {
		const yesodStore = new YesodManifestStore(this.malchusDocument);
		const tiferesStatus = createTiferesComposerStatus(this.yesodParentId);
		const chaiBody = new MalchusCommentComposerBodyFactory({
			document: this.malchusDocument,
			config: this.binahConfig,
			store: yesodStore,
			status: tiferesStatus,
			parentId: this.yesodParentId
		}).create();
		const malchusForm = this.createForm();
		this.composeBody(malchusForm, chaiBody);
		return new GevurahCommentComposerSubmissionController({
			store: yesodStore,
			parentId: this.yesodParentId,
			status: tiferesStatus,
			onSubmit: this.onSubmit
		}).bind(malchusForm);
	}

	/**
	 * Creates the semantic form shell before body/disclosure policy is applied.
	 * @returns {HTMLFormElement} Empty composer form with stable accessibility state.
	 */
	createForm() {
		return el('form', {
			className: this.revealFormClass(),
			attrs: {
				'aria-label': this.yesodParentId ? 'Reply composer' : 'Comment composer',
				'aria-busy': 'false'
			}
		});
	}

	/**
	 * Places replies directly in flow while roots receive progressive disclosure.
	 * @param {HTMLFormElement} malchusForm Composer form being assembled.
	 * @param {HTMLDivElement} chaiBody Complete composer body.
	 * @returns {void} Mutates only the provided form.
	 */
	composeBody(malchusForm, chaiBody) {
		if (this.yesodParentId) {
			malchusForm.append(chaiBody);
			return;
		}
		const tiferesToggle = createTiferesComposerToggle(
			this.malchusDocument,
			chaiBody.id
		);
		malchusForm.append(tiferesToggle, chaiBody);
		new TiferesComposerDisclosureController({
			form: malchusForm,
			toggle: tiferesToggle,
			body: chaiBody
		}).bind();
	}

	/** @returns {string} Stable root/reply class contract consumed by localized route CSS. */
	revealFormClass() {
		return `geelooy-card comment-composer${this.yesodParentId ? ' comment-composer--reply' : ' comment-composer--root'}`;
	}
}
