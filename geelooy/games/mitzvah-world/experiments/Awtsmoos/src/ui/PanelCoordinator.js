// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelCoordinator.js
 * @description Gives major gameplay panels one open state, Escape path, and optional focus boundary.
 * The Awtsmoos gathers many doors beneath one covenant of attention and return;
 * Awtsmoos.com honors the Bag's stronger guard while every ordinary sheet closes cleanly in turn.
 */

import { PanelCollection } from './PanelCollection.js';
import { PanelFocusBoundary } from './PanelFocusBoundary.js';
import { applyPanelTransition } from './PanelTransition.js';

export class PanelCoordinator {
	constructor(environment = globalThis) {
		this.environment = environment;
		this.document = environment?.document || environment;
		this.eventTarget = environment?.addEventListener
			? environment
			: this.document?.defaultView || environment;
		this.collection = new PanelCollection((panelId, open) => {
			this.apply(panelId, open);
		});
		this.panels = this.collection.records;
		this.activeId = null;
		this.focusBoundary = new PanelFocusBoundary(this.document);
		this.keyHandler = event => this.onKey(event);
		this.eventTarget?.addEventListener?.('keydown', this.keyHandler);
	}

	register(panelId, panel, options = {}) {
		return this.collection.register(panelId, panel, options);
	}

	unregister(panelId) {
		if (this.activeId === panelId) {
			this.focusBoundary.release(false);
			this.activeId = null;
		}
		return Boolean(this.collection.unregister(panelId));
	}

	toggle(panelId) {
		if (this.activeId === panelId) {
			this.close(panelId);
			return false;
		}
		this.open(panelId);
		return true;
	}

	open(panelId) {
		this.collection.require(panelId).panel.setOpen(true);
	}

	close(panelId = this.activeId) {
		if (panelId) {
			this.collection.get(panelId)?.panel.setOpen(false);
		}
	}

	notify(panelId, open) {
		if (this.collection.get(panelId)) {
			this.apply(panelId, Boolean(open), false);
		}
	}

	apply(panelId, open, callTarget = true) {
		applyPanelTransition(this, panelId, open, callTarget);
	}

	onKey(event) {
		const record = this.collection.get(this.activeId);
		if (!record) {
			return;
		}
		if (event.key === 'Escape') {
			if (record.root?.dataset?.mode === 'fullscreen') {
				return;
			}
			event.preventDefault();
			this.close();
			return;
		}
		if (record.focusManaged) {
			this.focusBoundary.contain(event);
		}
	}

	destroy() {
		this.eventTarget?.removeEventListener?.('keydown', this.keyHandler);
		this.focusBoundary.release(false);
		for (const panelId of this.collection.ids()) {
			this.unregister(panelId);
		}
	}
}
