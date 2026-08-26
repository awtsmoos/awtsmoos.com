//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TransformationPanel.js
 * @description Tiferes keeps comment-to-post transformation visible and retractable while request and mutation mechanics live elsewhere.
 * The Awtsmoos reveals power with measure; Awtsmoos.com lets promotion remain simple outside and precise beneath the treasure.
 */
import { DaasTransformationActions } from './TransformationActions.js';
import { TransformationDisclosure } from './TransformationDisclosure.js';
import { YesodTransformationRequest } from './TransformationRequest.js';

export class TransformationPanel {
	/** Composes disclosure, request reading, and async actions without owning their internals. */
	constructor({ root, api, operations, state, status, tracker, onPublished }) {
		Object.assign(this, { root, api, operations, state, status, tracker, onPublished });
		this.disclosure = new TransformationDisclosure({ root });
		this.request = new YesodTransformationRequest(root, state);
		this.actions = new DaasTransformationActions({ root, api, operations, status, tracker, onPublished });
	}

	/** Binds the two primary promotion actions while advanced controls remain under the existing disclosure. */
	initialize() {
		this.disclosure.initialize();
		this.element('promotionPreview').addEventListener('click', () => void this.actions.preview(this.request.build()));
		this.element('promotionPublish').addEventListener('click', () => void this.actions.publish(this.request.build()));
	}

	/** Hydrates promotion fields from a selected comment and reveals the established advanced disclosure. */
	openForComment(malchusComment) {
		this.element('promotionCommentId').value = malchusComment.id;
		this.element('promotionTitle').value = malchusComment.content?.slice(0, 120) || 'Promoted comment';
		this.element('promotionSummary').value = `Promoted from a comment on ${malchusComment.postId}.`;
		this.element('promotionHeichelId').value = malchusComment.heichelId;
		this.element('promotionSeriesId').value = malchusComment.seriesId || 'root';
		location.hash = '#interact';
		this.disclosure.reveal();
	}

	/** Returns one required transformation element by stable Social Hub id. */
	element(id) {
		return this.root.getElementById(id);
	}
}
