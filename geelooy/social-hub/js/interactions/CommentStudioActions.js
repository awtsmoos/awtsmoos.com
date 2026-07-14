//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CommentStudioActions
 * @description
 * Publication, pending-media protection, private activity, and post-publication
 * reset remain one focused action vessel. The Awtsmoos joins speech and deed while
 * Awtsmoos.com refuses to call a local blob or failed upload a published comment.
 */

import {
	commentPayload,
	pendingMedia
} from './CommentPayload.js';

export class CommentStudioActions {
	constructor({ root, api, state, status, tracker, onCreated, onReset }) {
		Object.assign(this, {
			root,
			api,
			state,
			status,
			tracker,
			onCreated,
			onReset
		});
	}

	async publish() {
		const snapshot = this.state.snapshot();
		const pending = pendingMedia(snapshot.comment.assets);
		if (pending.length) {
			this.status.show(`${pending.length} media item(s) still need successful upload.`, 'error');
			return null;
		}
		this.status.show('Publishing canonical rich interaction…', 'working');
		try {
			const result = await this.api.createComment(
				commentPayload(this.root, snapshot)
			);
			this.status.show('Comment published at the exact target.', 'success');
			await this.recordActivity(snapshot, result);
			this.onCreated?.(result);
			this.resetAfterPublish();
			return result;
		} catch (error) {
			this.status.show(error.message, 'error');
			return null;
		}
	}

	recordActivity(snapshot, result) {
		const reply = Boolean(snapshot.comment.target.parentCommentId);
		return this.tracker.social({
			category: reply ? 'reply' : 'comment',
			action: 'publish',
			title: reply ? 'Published a reply' : 'Published a comment',
			entity: {
				type: 'comment',
				id: result.comment?.id || '',
				heichelId: snapshot.comment.target.heichelId,
				seriesId: snapshot.comment.target.seriesId,
				sectionId: snapshot.comment.target.subsectionId
					|| snapshot.comment.target.verseSection
			}
		});
	}

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
}
