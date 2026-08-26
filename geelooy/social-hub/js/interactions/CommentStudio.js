//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CommentStudio.js
 * @description Malchus composes destination, words, media, and publication while async lifecycle stays in a separate Daas vessel.
 * The Awtsmoos unites without clutter; Awtsmoos.com keeps the ordinary comment path calm while advanced power may still utter.
 */
import { CommentMediaQueue } from './CommentMediaQueue.js';
import { renderMediaQueue } from './CommentMediaView.js';
import { CommentStudioActions } from './CommentStudioActions.js';
import { CommentStudioFields } from './CommentStudioFields.js';
import { CommentTargetDisclosure } from './CommentTargetDisclosure.js';

export class CommentStudio {
	/** Creates the focused comment sub-vessels over shared state, API, and operations. */
	constructor({ root, api, operations, state, status, tracker, onCreated }) {
		Object.assign(this, { root, api, operations, state, status, tracker, onCreated });
		this.targetDisclosure = new CommentTargetDisclosure({ root });
		this.fields = new CommentStudioFields({
			root,
			state,
			status,
			onTargetChanged: snapshot => this.targetDisclosure.render(snapshot)
		});
		this.media = new CommentMediaQueue({ api, state, status, onChanged: () => this.renderMedia() });
		this.actions = new CommentStudioActions({
			root,
			api,
			operations,
			state,
			status,
			tracker,
			onCreated,
			onReset: () => this.render(this.state.snapshot())
		});
	}

	/** Binds comment controls once and renders the initial state. */
	initialize() {
		this.targetDisclosure.initialize();
		this.fields.bind();
		this.element('commentFiles').addEventListener('change', event => {
			this.media.add(event.target.files);
			event.target.value = '';
		});
		this.element('uploadCommentMedia').addEventListener('click', () => void this.media.uploadAll());
		this.element('publishComment').addEventListener('click', () => void this.actions.publish());
		this.render(this.state.snapshot());
	}

	/** Renders comment fields, target disclosure, and media from one immutable snapshot. */
	render(snapshot) {
		this.fields.render(snapshot);
		this.targetDisclosure.render(snapshot);
		this.renderMedia();
	}

	/** Rebuilds the media queue from canonical SocialHubState. */
	renderMedia() {
		renderMediaQueue({
			document: this.root,
			container: this.element('commentMediaQueue'),
			items: this.state.snapshot().comment.assets,
			onUpdate: (id, field, value) => this.media.update(id, field, value),
			onRemove: id => this.media.remove(id)
		});
	}

	/** Returns one required element by stable Social Hub id. */
	element(id) {
		return this.root.getElementById(id);
	}
}
