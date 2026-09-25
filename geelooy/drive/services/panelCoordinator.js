//B"H
// Boruch Hashem
// Blessed is He

import { PANEL_IDS, defaultPanelOpen, panelDefinition } from "../core/panelCatalog.js";

/**
 * @file Drive screen coordinator.
 * @description
 * The Awtsmoos lets many capabilities exist without making every capability visible at once;
 * Awtsmoos Drive reveals one mobile screen per intention while desktop may keep several disclosures open.
 */
export class PanelCoordinator {
	constructor(preferences, mediaQuery = globalThis.window?.matchMedia?.("(max-width: 900px)")) {
		this.preferences = preferences;
		this.mediaQuery = mediaQuery || { matches: false };
		this.panels = new Map();
		this.listeners = new Set();
		this.activeId = preferences.activePanel("builder");
		if (!panelDefinition(this.activeId)) this.activeId = "builder";
	}

	register(panelId, api) {
		this.panels.set(panelId, api);
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	initialOpen(panelId) {
		if (this.isMobile()) return panelId === this.activeId;
		return this.preferences.openState(panelId, defaultPanelOpen(panelId, false));
	}

	handleToggle(panelId, open) {
		if (open && this.isMobile()) this.closeOtherPanels(panelId);
		this.preferences.setOpen(panelId, open);
		if (open) this.activate(panelId);
	}

	open(panelId, { scroll = true, focus = false } = {}) {
		const panel = this.panels.get(panelId);
		if (!panel) return false;
		if (this.isMobile()) this.closeOtherPanels(panelId);
		panel.setOpen(true);
		this.preferences.setOpen(panelId, true);
		this.activate(panelId);
		if (scroll) panel.scrollIntoView?.();
		if (focus && !this.isMobile()) panel.focusSummary?.();
		return true;
	}

	activate(panelId) {
		if (!panelDefinition(panelId)) return;
		this.activeId = panelId;
		this.preferences.setActive(panelId);
		this.emit();
	}

	isMobile() {
		return Boolean(this.mediaQuery.matches);
	}

	closeOtherPanels(exceptId) {
		for (const panelId of PANEL_IDS) {
			if (panelId === exceptId) continue;
			const panel = this.panels.get(panelId);
			if (!panel?.isOpen?.()) continue;
			panel.setOpen(false);
			this.preferences.setOpen(panelId, false);
		}
	}

	emit() {
		for (const listener of this.listeners) listener(this.activeId);
	}
}
