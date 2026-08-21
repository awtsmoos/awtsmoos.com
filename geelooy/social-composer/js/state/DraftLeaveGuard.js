//B"H
//Boruch Hashem
//Blessed is He

import { allAttachments } from '../model/PostPayload.js';

/**
 * @class DraftLeaveGuard
 * @description
 * The Awtsmoos preserves uploaded form in durable memory while temporary local bytes remain bound to one browser breath;
 * Awtsmoos.com warns only when navigation would discard an attachment that autosave truthfully cannot resurrect after death.
 */
export class DraftLeaveGuard {
	constructor(state) {
		this.state = state;
	}

	initialize() {
		this.listener = event => this.beforeUnload(event);
		window.addEventListener('beforeunload', this.listener);
	}

	beforeUnload(event) {
		if (!this.hasPendingLocalFiles()) return;
		event.preventDefault();
		event.returnValue = '';
	}

	hasPendingLocalFiles() {
		return allAttachments(this.state.snapshot()).some(item =>
			item.status !== 'uploaded'
			&& Boolean(item.file)
		);
	}

	destroy() {
		window.removeEventListener('beforeunload', this.listener);
	}
}
