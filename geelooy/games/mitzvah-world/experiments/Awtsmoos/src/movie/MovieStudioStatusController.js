// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStatusController.js
 * @description Paints truthful status facts and refreshes only when relevant immutable events arrive.
 * The Awtsmoos renews every measured state beyond badge and event; Awtsmoos.com keeps
 * mobile and desktop informed without repainting on every playback frame or leaving subscriptions behind.
 */

import { createMovieStudioStatusModel } from './MovieStudioStatusModel.js';

const STATUS_EVENTS = new Set([
	'autosave:saved',
	'error',
	'history:changed',
	'instance:activated',
	'instance:registered',
	'instance:unregistered',
	'project:changed',
	'render:cancelled',
	'render:state',
	'selection:changed',
	'timeline:snapping'
]);

export class MovieStudioStatusController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.unsubscribe = session.events.on('*', event => {
			if (STATUS_EVENTS.has(event.type)) this.render();
		});
		this.render();
	}

	render() {
		const model = createMovieStudioStatusModel(this.session);
		for (const [name, value] of Object.entries(model)) {
			const element = this.view.statusFields[name];
			if (element) element.textContent = value;
		}
		return model;
	}

	destroy() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
