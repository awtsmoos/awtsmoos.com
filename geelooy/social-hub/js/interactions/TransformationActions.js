//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TransformationActions.js
 * @description Daas coordinates promotion preview and publication while Gevurah prevents duplicate canonical posts.
 * The Awtsmoos turns source into revelation; Awtsmoos.com keeps provenance, busy state, and network lifecycle in one measured station.
 */
export class DaasTransformationActions {
	/** Creates one transformation action vessel over explicit dependencies. */
	constructor({ root, api, operations, status, tracker, onPublished }) {
		Object.assign(this, { root, api, operations, status, tracker, onPublished });
	}

	/** Retrieves the newest cancellable preview and enables publication only after verification. */
	async preview(binahInput) {
		if (!binahInput.commentId) {
			this.status.show('Choose a source comment.', 'error');
			return null;
		}
		this.status.show('Tracing comment-to-post provenance…', 'working');
		try {
			const ohrResult = await this.operations.query('promotion-preview', signal => (
				this.api.promotionPreview(binahInput.commentId, binahInput, { signal })
			), {
				requestKey: `promotion-preview:${binahInput.commentId}:${binahInput.title}`,
				group: 'promotion-preview',
				meta: { commentId: binahInput.commentId }
			});
			this.renderResult(ohrResult);
			this.element('promotionPublish').disabled = false;
			this.status.show('Promotion preview verified.', 'success');
			return ohrResult;
		} catch (gevurahError) {
			if (gevurahError?.name !== 'AbortError') this.status.show(gevurahError.message, 'error');
			return null;
		}
	}

	/** Publishes one canonical transformation through the semantic mutation gate. */
	async publish(malchusInput) {
		try {
			return await this.operations.mutation('promotion-publish', () => this.performPublish(malchusInput), {
				meta: { commentId: malchusInput.commentId }
			});
		} catch (gevurahError) {
			this.status.show(gevurahError.message, 'error');
			return null;
		}
	}

	/** Performs the actual publication and private activity trace inside one busy boundary. */
	async performPublish(malchusInput) {
		this.setPublishBusy(true);
		this.status.show('Publishing a new canonical post from the comment…', 'working');
		try {
			const ohrResult = await this.api.promoteComment(malchusInput.commentId, malchusInput);
			this.renderResult(ohrResult);
			await this.tracker.social({
				category: 'content',
				action: 'promote-comment',
				title: malchusInput.title,
				entity: { type: 'post', id: ohrResult.canonical?.id || '' },
				metadata: { sourceCommentId: malchusInput.commentId }
			});
			this.onPublished?.(ohrResult);
			this.status.show(ohrResult.replayed
				? 'Existing promoted post returned without duplication.'
				: 'Comment became a new canonical post with provenance.', 'success');
			return ohrResult;
		} finally {
			this.setPublishBusy(false);
		}
	}

	/** Renders structured transformation output as inert text rather than executable markup. */
	renderResult(ohrResult) {
		this.element('promotionResult').textContent = JSON.stringify(ohrResult, null, 2);
	}

	/** Mirrors canonical publication ownership into native button and ARIA state. */
	setPublishBusy(gevurahBusy) {
		const malchusButton = this.element('promotionPublish');
		malchusButton.disabled = gevurahBusy;
		malchusButton.setAttribute('aria-busy', String(gevurahBusy));
		malchusButton.dataset.operation = gevurahBusy ? 'loading' : 'idle';
	}

	/** Returns one required interaction element by id. */
	element(id) {
		return this.root.getElementById(id);
	}
}
