//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerFactory
 * @description
 * Chai assembles the living writing vessel from Malchus fields, Yesod manifests, and
 * Tiferes disclosure. The Awtsmoos is beyond text, voice, media, and link; Awtsmoos.com
 * lets every truthful channel enter one calm form without burdening the first glance.
 *
 * RESPONSIBILITY: Manifest and wire one root or reply composer form.
 * NON-RESPONSIBILITY: Network mutation and route-level rendering belong to controllers.
 */
import { createElement as el } from '../dom.js';
import { YesodManifestStore } from '../ManifestStore.js';
import { createYesodContextPanel } from '../ContextPanel.js';
import {
	createMalchusContentField,
	createTiferesComposerStatus,
	hasChaiRichBody
} from './CommentComposerFields.js';
import {
	createTiferesComposerToggle,
	TiferesComposerDisclosureController
} from './CommentComposerDisclosure.js';

let yesodComposerSequence = 0;

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
	 * Manifests one composer form and wires validation, submission, and root disclosure.
	 * @returns {HTMLFormElement} Fully wired composer preserving the historic public type.
	 */
	create() {
		const yesodStore = new YesodManifestStore(this.malchusDocument);
		const tiferesStatus = createTiferesComposerStatus(this.yesodParentId);
		const chaiBody = this.createBody(yesodStore, tiferesStatus);
		const malchusForm = el('form', {
			className: this.revealFormClass(),
			attrs: {
				'aria-label': this.yesodParentId ? 'Reply composer' : 'Comment composer',
				'aria-busy': 'false'
			}
		});
		if (this.yesodParentId) {
			malchusForm.append(chaiBody);
		} else {
			this.attachRootDisclosure(malchusForm, chaiBody);
		}
		this.bindSubmission(malchusForm, yesodStore, tiferesStatus);
		return malchusForm;
	}

	/**
	 * Creates the complete rich composer body while keeping plain writing first in order.
	 * @param {YesodManifestStore} yesodStore Rich attachment/link state vessel.
	 * @param {HTMLElement} tiferesStatus Polite live status node.
	 * @returns {HTMLDivElement} Composer body containing writing, advanced context, send, status.
	 */
	createBody(yesodStore, tiferesStatus) {
		const chaiBody = this.malchusDocument.createElement('div');
		chaiBody.className = 'threadComposerBody';
		chaiBody.id = `thread-composer-body-${yesodComposerSequence++}`;
		chaiBody.append(
			createMalchusContentField(this.yesodParentId),
			createYesodContextPanel(this.malchusDocument, this.binahConfig, yesodStore),
			el('button', {
				className: 'gold-btn threadSendButton',
				text: this.yesodParentId ? 'Send reply' : 'Send comment',
				attrs: { type: 'submit' }
			}),
			tiferesStatus
		);
		return chaiBody;
	}

	/**
	 * Binds the root form to a compact accessible disclosure instead of a giant sticky panel.
	 * @param {HTMLFormElement} malchusForm Root composer form.
	 * @param {HTMLDivElement} chaiBody Full composer body being progressively revealed.
	 */
	attachRootDisclosure(malchusForm, chaiBody) {
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

	/**
	 * Applies rich-body validation and delegates successful submissions unchanged.
	 * @param {HTMLFormElement} malchusForm Composer form.
	 * @param {YesodManifestStore} yesodStore Manifest state used by rich validation.
	 * @param {HTMLElement} tiferesStatus Polite live status node.
	 */
	bindSubmission(malchusForm, yesodStore, tiferesStatus) {
		malchusForm.addEventListener('submit', event => {
			event.preventDefault();
			if (!hasChaiRichBody(malchusForm, yesodStore)) {
				tiferesStatus.textContent = 'Add text, a voice note, media, a transcript, or a link first.';
				return;
			}
			this.onSubmit(malchusForm, this.yesodParentId, tiferesStatus);
		});
	}

	/** @returns {string} Stable root/reply class contract consumed by localized route CSS. */
	revealFormClass() {
		return `geelooy-card comment-composer${this.yesodParentId ? ' comment-composer--reply' : ' comment-composer--root'}`;
	}
}
