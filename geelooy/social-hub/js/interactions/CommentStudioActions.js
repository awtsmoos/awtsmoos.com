//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CommentStudioActions.js
 * @description Gevurah protects canonical comment publication from duplicate taps while keeping media and activity truth explicit.
 * The Awtsmoos joins speech and deed; Awtsmoos.com lets one semantic publication own the gate until its Promise is freed.
 */
import { commentPayload, pendingMedia } from './CommentPayload.js';

export class CommentStudioActions {
	/** Creates one focused publication vessel over shared operations and canonical state. */
	constructor({ root, api, operations, state, status, tracker, onCreated, onReset }) {
		Object.assign(this, { root, api, operations, state, status, tracker, onCreated, onReset });
	}

	/** Validates local media and enters the shared duplicate-safe mutation gate. */
	async publish() {
		const malchusSnapshot = this.state.snapshot();
		const gevurahPending = pendingMedia(malchusSnapshot.comment.assets);
		if (gevurahPending.length) {
			this.status.show(`${gevurahPending.length} media item(s) still need successful upload.`, 'error');
			return null;
		}
		try {
			return await this.operations.mutation('comment-publish', () => this.performPublish(malchusSnapshot), {
				meta: { target: malchusSnapshot.comment.target }
			});
		} catch (gevurahError) {
			this.status.show(gevurahError.message, 'error');
			return null;
		}
	}

	/** Performs the one canonical API mutation, tracking, callbacks, and reset inside a visible busy boundary. */
	async performPublish(malchusSnapshot) {
		this.setBusy(true);
		this.status.show('Publishing canonical rich interaction…', 'working');
		try {
			const ohrResult = await this.api.createComment(commentPayload(this.root, malchusSnapshot));
			this.status.show('Comment published at the exact target.', 'success');
			await this.recordActivity(malchusSnapshot, ohrResult);
			this.onCreated?.(ohrResult);
			this.resetAfterPublish();
			return ohrResult;
		} finally {
			this.setBusy(false);
		}
	}

	/** Records private activity after canonical publication succeeds. */
	recordActivity(malchusSnapshot, ohrResult) {
		const binahReply = Boolean(malchusSnapshot.comment.target.parentCommentId);
		return this.tracker.social({
			category: binahReply ? 'reply' : 'comment',
			action: 'publish',
			title: binahReply ? 'Published a reply' : 'Published a comment',
			entity: {
				type: 'comment',
				id: ohrResult.comment?.id || '',
				heichelId: malchusSnapshot.comment.target.heichelId,
				seriesId: malchusSnapshot.comment.target.seriesId,
				sectionId: malchusSnapshot.comment.target.subsectionId || malchusSnapshot.comment.target.verseSection
			}
		});
	}

	/** Clears only draft-owned comment fields after successful publication. */
	resetAfterPublish() {
		this.state.mutate('comment:published', value => {
			value.comment.content = '';
			value.comment.audioNoteText = '';
			value.comment.mood = '';
			value.comment.assets = [];
			value.comment.references = [];
		});
		this.onReset?.();
	}

	/** Mirrors mutation ownership into native disabled and ARIA busy semantics. */
	setBusy(gevurahBusy) {
		const malchusButton = this.root.getElementById('publishComment');
		if (!malchusButton) return;
		malchusButton.disabled = gevurahBusy;
		malchusButton.setAttribute('aria-busy', String(gevurahBusy));
		malchusButton.dataset.operation = gevurahBusy ? 'loading' : 'idle';
	}
}
