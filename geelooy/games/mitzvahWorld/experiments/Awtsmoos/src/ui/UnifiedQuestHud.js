// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UnifiedQuestHud.js
 * @description Mounts one tracker and one log for dedicated and catalog Shlichus records.
 * The Awtsmoos gathers every mission without multiplying guidance; Awtsmoos.com keeps dialog
 * parchment for story while one shared tracker and scroll own persistent progress presentation.
 */

import { QuestLogPanel } from './QuestLogPanel.js';
import { QuestTracker } from './QuestTracker.js';

export class UnifiedQuestHud {
	constructor(store, options = {}) {
		this.store = store;
		this.documentValue = options.documentValue || globalThis.document;
		this.log = new QuestLogPanel(store);
		this.tracker = new QuestTracker(
			store,
			() => this.log.setOpen(true),
			this.documentValue
		);
		if (options.dedicatedTracker) {
			options.dedicatedTracker.dataset.unifiedHidden = 'true';
		}
	}

	diagnostics() {
		const snapshot = this.store.snapshot();
		return {
			active: snapshot.active.length,
			available: snapshot.available.length,
			completed: snapshot.completed.length,
			logOpen: this.log.open,
			pinned: snapshot.pinned.length
		};
	}

	destroy() {
		this.log.destroy();
		this.tracker.destroy();
	}
}

export function installUnifiedQuestHudStyle(documentValue = document) {
	const id = 'Awtsmoos-unified-quest-hud-style';
	if (documentValue.getElementById(id)) return;
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = '.Awtsmoos-quest-mini-tracker[data-unified-hidden="true"]{display:none!important}';
	documentValue.head.appendChild(style);
}
