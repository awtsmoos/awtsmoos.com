//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class TransformationPanel
 * @description
 * Comment-to-post transformation keeps provenance visible while rare controls rest
 * behind a deliberate disclosure. The Awtsmoos reveals power with measure, and
 * Awtsmoos.com lets the ordinary comment path remain clear until promotion is chosen.
 */
import { TransformationDisclosure } from './TransformationDisclosure.js';

function value(root, id) {
	return String(root.getElementById(id)?.value || '').trim();
}

export class TransformationPanel {
	constructor({ root, api, state, status, tracker, onPublished }) {
		Object.assign(this, { root, api, state, status, tracker, onPublished });
		this.disclosure = new TransformationDisclosure({ root });
	}

	initialize() {
		this.disclosure.initialize();
		this.element('promotionPreview').addEventListener('click', () => this.preview());
		this.element('promotionPublish').addEventListener('click', () => this.publish());
	}

	openForComment(comment) {
		this.element('promotionCommentId').value = comment.id;
		this.element('promotionTitle').value = comment.content?.slice(0, 120)
			|| 'Promoted comment';
		this.element('promotionSummary').value = `Promoted from a comment on ${comment.postId}.`;
		this.element('promotionHeichelId').value = comment.heichelId;
		this.element('promotionSeriesId').value = comment.seriesId || 'root';
		location.hash = '#interact';
		this.disclosure.reveal();
	}

	request() {
		return {
			aliasId: this.state.snapshot().identity.aliasId,
			commentId: value(this.root, 'promotionCommentId'),
			title: value(this.root, 'promotionTitle'),
			summary: value(this.root, 'promotionSummary'),
			heichelId: value(this.root, 'promotionHeichelId'),
			seriesId: value(this.root, 'promotionSeriesId') || 'root',
			visibility: value(this.root, 'promotionVisibility') || 'public'
		};
	}

	async preview() {
		const input = this.request();
		if (!input.commentId) {
			this.status.show('Choose a source comment.', 'error');
			return;
		}
		this.status.show('Tracing comment-to-post provenance…', 'working');
		try {
			const result = await this.api.promotionPreview(input.commentId, input);
			this.element('promotionResult').textContent = JSON.stringify(result, null, 2);
			this.element('promotionPublish').disabled = false;
			this.status.show('Promotion preview verified.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	async publish() {
		const input = this.request();
		this.status.show('Publishing a new canonical post from the comment…', 'working');
		try {
			const result = await this.api.promoteComment(input.commentId, input);
			this.element('promotionResult').textContent = JSON.stringify(result, null, 2);
			await this.tracker.social({
				category: 'content',
				action: 'promote-comment',
				title: input.title,
				entity: { type: 'post', id: result.canonical?.id || '' },
				metadata: { sourceCommentId: input.commentId }
			});
			this.onPublished?.(result);
			this.status.show(
				result.replayed
					? 'Existing promoted post returned without duplication.'
					: 'Comment became a new canonical post with provenance.',
				'success'
			);
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	element(id) {
		return this.root.getElementById(id);
	}
}

export {
	value
};
