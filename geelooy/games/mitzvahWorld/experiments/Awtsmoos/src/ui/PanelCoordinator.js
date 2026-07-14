// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelCoordinator.js
 * @description Wraps every major panel so external buttons and shortcuts share one state.
 * The Awtsmoos renews many interfaces without confusion; Awtsmoos.com gives each sheet
 * one coordinated doorway, including its own close button, Escape, touch, and shortcuts.
 */

export class PanelCoordinator {
	constructor() {
		this.panels = new Map();
		this.activeId = null;
		this.keyHandler = event => this.onKey(event);
		addEventListener('keydown', this.keyHandler);
	}

	register(panelId, panel) {
		if (!panel?.setOpen) {
			throw new Error(`Panel ${panelId} requires setOpen().`);
		}
		const originalSetOpen = panel.setOpen.bind(panel);
		const record = {
			originalSetOpen,
			panel
		};
		this.panels.set(panelId, record);
		panel.setOpen = open => this.apply(panelId, Boolean(open));
		return () => this.unregister(panelId);
	}

	unregister(panelId) {
		const record = this.panels.get(panelId);
		if (!record) return;
		record.panel.setOpen = record.originalSetOpen;
		this.panels.delete(panelId);
		if (this.activeId === panelId) this.activeId = null;
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
		const record = this.requirePanel(panelId);
		record.panel.setOpen(true);
	}

	close(panelId = this.activeId) {
		if (!panelId) return;
		this.panels.get(panelId)?.panel.setOpen(false);
	}

	notify(panelId, open) {
		const record = this.panels.get(panelId);
		if (!record) return;
		if (open) this.apply(panelId, true, false);
		else if (this.activeId === panelId) this.activeId = null;
	}

	apply(panelId, open, callTarget = true) {
		const record = this.requirePanel(panelId);
		if (open) {
			for (const [otherId, other] of this.panels) {
				if (otherId !== panelId) other.originalSetOpen(false);
			}
			if (callTarget) record.originalSetOpen(true);
			this.activeId = panelId;
			return;
		}
		if (callTarget) record.originalSetOpen(false);
		if (this.activeId === panelId) this.activeId = null;
	}

	requirePanel(panelId) {
		const record = this.panels.get(panelId);
		if (!record) throw new Error(`Unknown panel: ${panelId}`);
		return record;
	}

	onKey(event) {
		if (event.key !== 'Escape' || !this.activeId) return;
		event.preventDefault();
		this.close();
	}

	destroy() {
		removeEventListener('keydown', this.keyHandler);
		for (const panelId of [...this.panels.keys()]) {
			this.unregister(panelId);
		}
	}
}
