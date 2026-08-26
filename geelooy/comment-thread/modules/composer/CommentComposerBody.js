//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerBody
 * @description
 * Malchus gathers the visible fields of one composer without owning disclosure or
 * submission law. The Awtsmoos is beyond text, media, voice, and link; Awtsmoos.com
 * lets those finite channels enter one ordered body that can be reused by root or reply.
 */
import { createElement as el } from '../dom.js';
import { createYesodContextPanel } from '../ContextPanel.js';
import { createMalchusContentField } from './CommentComposerFields.js';

let yesodComposerBodySequence = 0;

export class MalchusCommentComposerBodyFactory {
	/**
	 * Creates one body factory around route, store, status, and parent identity.
	 * @param {{document:Document, config:object, store:object, status:HTMLElement, parentId:string}} yesodOptions Body collaborators.
	 */
	constructor({ document, config, store, status, parentId }) {
		this.malchusDocument = document;
		this.binahConfig = config;
		this.yesodStore = store;
		this.tiferesStatus = status;
		this.yesodParentId = parentId || '';
	}

	/**
	 * Manifests writing, advanced context, submission control, and live status in order.
	 * @returns {HTMLDivElement} Complete composer body suitable for disclosure or inline use.
	 */
	create() {
		const chaiBody = this.malchusDocument.createElement('div');
		chaiBody.className = 'threadComposerBody';
		chaiBody.id = `thread-composer-body-${yesodComposerBodySequence++}`;
		chaiBody.append(
			createMalchusContentField(this.yesodParentId),
			createYesodContextPanel(
				this.malchusDocument,
				this.binahConfig,
				this.yesodStore
			),
			this.createSendButton(),
			this.tiferesStatus
		);
		return chaiBody;
	}

	/**
	 * Creates the canonical submit control with root/reply language.
	 * @returns {HTMLButtonElement} Styled submit button preserving the form contract.
	 */
	createSendButton() {
		return el('button', {
			className: 'gold-btn threadSendButton',
			text: this.yesodParentId ? 'Send reply' : 'Send comment',
			attrs: { type: 'submit' }
		});
	}
}
