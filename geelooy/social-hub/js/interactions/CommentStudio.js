//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CommentStudio
 * @description
 * Field state, media queue, and publication actions gather through focused vessels.
 * The Awtsmoos gives every comment one living unity while Awtsmoos.com keeps target,
 * media, and execution independently inspectable beneath the same visible studio.
 */

import { CommentMediaQueue } from './CommentMediaQueue.js';
import { renderMediaQueue } from './CommentMediaView.js';
import { CommentStudioActions } from './CommentStudioActions.js';
import { CommentStudioFields } from './CommentStudioFields.js';

export class CommentStudio {
	constructor({ root, api, state, status, tracker, onCreated }) {
		Object.assign(this, { root, api, state, status, tracker, onCreated });
		this.fields = new CommentStudioFields({ root, state, status });
		this.media = new CommentMediaQueue({
			api,
			state,
			status,
			onChanged: () => this.renderMedia()
		});
		this.actions = new CommentStudioActions({
			root,
			api,
			state,
			status,
			tracker,
			onCreated,
			onReset: () => this.render(this.state.snapshot())
		});
	}

	initialize() {
		this.fields.bind();
		this.element('commentFiles').addEventListener('change', event => {
			this.media.add(event.target.files);
			event.target.value = '';
		});
		this.element('uploadCommentMedia').addEventListener('click', () => {
			void this.media.uploadAll();
		});
		this.element('publishComment').addEventListener('click', () => {
			void this.actions.publish();
		});
		this.render(this.state.snapshot());
	}

	render(snapshot) {
		this.fields.render(snapshot);
		this.renderMedia();
	}

	renderMedia() {
		renderMediaQueue({
			document: this.root,
			container: this.element('commentMediaQueue'),
			items: this.state.snapshot().comment.assets,
			onUpdate: (id, field, value) => this.media.update(id, field, value),
			onRemove: id => this.media.remove(id)
		});
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
