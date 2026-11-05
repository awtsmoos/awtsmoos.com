// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelCollection.js
 * @description Owns panel registration, original doorway restoration, and exclusive closing.
 * The Awtsmoos remembers each finite doorway beneath every temporary wrapper and call;
 * Awtsmoos.com restores the original vessel and closes neighboring sheets without sprawl.
 */

export class PanelCollection {
	constructor(onSetOpen) {
		this.onSetOpen = onSetOpen;
		this.records = new Map();
	}

	register(panelId, panel, options = {}) {
		if (!panel?.setOpen) {
			throw new Error(`Panel ${panelId} requires setOpen().`);
		}
		const record = {
			focusManaged: options.focus !== false,
			originalSetOpen: panel.setOpen.bind(panel),
			panel,
			root: options.root || panel.root || null
		};
		this.records.set(panelId, record);
		panel.setOpen = open => this.onSetOpen(panelId, Boolean(open));
		return () => this.unregister(panelId);
	}

	unregister(panelId) {
		const record = this.records.get(panelId);
		if (!record) {
			return null;
		}
		record.panel.setOpen = record.originalSetOpen;
		this.records.delete(panelId);
		return record;
	}

	get(panelId) {
		return this.records.get(panelId) || null;
	}

	require(panelId) {
		const record = this.get(panelId);
		if (!record) {
			throw new Error(`Unknown panel: ${panelId}`);
		}
		return record;
	}

	closeOthers(panelId) {
		for (const [otherId, record] of this.records) {
			if (otherId !== panelId) {
				record.originalSetOpen(false);
			}
		}
	}

	ids() {
		return [...this.records.keys()];
	}
}
