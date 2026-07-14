//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CommentStudioFields
 * @description
 * Exact target, text, transcript, mood, deep-link copying, and visible coordinate
 * remain one focused field vessel. The Awtsmoos gives every response its place while
 * Awtsmoos.com synchronizes the same coordinate into state and shareable navigation.
 */

import { targetFromFields } from './CommentPayload.js';

export const TARGET_FIELDS = Object.freeze([
	['commentHeichelId', 'heichelId'],
	['commentSeriesId', 'seriesId'],
	['commentEntityType', 'entityType'],
	['commentEntityId', 'entityId'],
	['commentVerseSection', 'verseSection'],
	['commentSubsectionId', 'subsectionId'],
	['commentParentId', 'parentCommentId'],
	['commentParentSectionId', 'parentSectionId']
]);

export class CommentStudioFields {
	constructor({ root, state, status }) {
		Object.assign(this, { root, state, status });
	}

	bind() {
		for (const [id, field] of TARGET_FIELDS) {
			this.element(id).addEventListener('input', event => {
				this.state.setTarget(field, event.target.value);
				this.renderTarget();
			});
		}
		for (const [id, field] of [
			['commentContent', 'content'],
			['commentTranscript', 'audioNoteText'],
			['commentMood', 'mood']
		]) {
			this.element(id).addEventListener('input', event => {
				this.state.setComment(field, event.target.value);
			});
		}
		this.element('copyTargetLink').addEventListener('click', () => {
			void this.copyTarget();
		});
	}

	render(snapshot) {
		for (const [id, field] of TARGET_FIELDS) {
			this.element(id).value = snapshot.comment.target[field] || '';
		}
		this.element('commentContent').value = snapshot.comment.content || '';
		this.element('commentTranscript').value = snapshot.comment.audioNoteText || '';
		this.element('commentMood').value = snapshot.comment.mood || '';
		this.renderTarget();
	}

	renderTarget() {
		const target = targetFromFields(this.root);
		this.element('targetCoordinate').textContent = [
			target.heichelId || 'heichel?',
			target.seriesId || 'root',
			`${target.entityType}:${target.entityId || '?'}`,
			target.subsectionId || target.verseSection || 'root',
			target.parentCommentId ? `reply:${target.parentCommentId}` : ''
		].filter(Boolean).join(' / ');
	}

	async copyTarget() {
		const target = targetFromFields(this.root);
		const query = new URLSearchParams({
			alias: this.state.snapshot().identity.aliasId,
			heichel: target.heichelId,
			series: target.seriesId,
			type: target.entityType,
			entity: target.entityId,
			verse: target.verseSection,
			subsection: target.subsectionId,
			reply: target.parentCommentId
		});
		const url = `${location.origin}/social-hub/?${query}#interact`;
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(url);
		} else {
			this.element('targetCoordinate').textContent = url;
		}
		this.status.show('Exact interaction target copied.', 'success');
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
