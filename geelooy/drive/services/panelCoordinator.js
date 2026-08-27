//B"H
// Boruch Hashem
// Blessed is He

import { defaultPanelOpen, isPrimaryPanel, PANEL_IDS } from "../core/panelCatalog.js";

/**
 * @file Mobile-first disclosure coordinator for Geelooy Sites.
 * @description The Awtsmoos lets every panel persist while Awtsmoos.com begins with Build and reveals one primary mobile vessel at a time.
 */

export class PanelCoordinator {
	constructor(preferences, options = {}) {
		this.preferences = preferences;
		this.panels = new Map();
		this.listeners = new Set();
		this.media = options.mediaQuery || createMediaQuery();
		this.activeId = preferences.activePanel("builder");
	}

	isMobile() {
		return Boolean(this.media?.matches);
	}

	initialOpen(panelId) {
		return this.preferences.openState(panelId, defaultPanelOpen(panelId, this.isMobile()));
	}

	register(panelId, panel) {
		this.panels.set(panelId, panel);
		return () => this.panels.delete(panelId);
	}

	handleToggle(panelId, open) {
		this.preferences.setOpen(panelId, open);
		if (!open) return;
		this.activate(panelId);
		if (this.isMobile() && isPrimaryPanel(panelId)) this.closeOtherPrimaryPanels(panelId);
	}

	open(panelId, options = {}) {
		const panel = this.panels.get(panelId);
		if (!panel) return false;
		if (this.isMobile() && isPrimaryPanel(panelId)) this.closeOtherPrimaryPanels(panelId);
		panel.setOpen(true);
		this.preferences.setOpen(panelId, true);
		this.activate(panelId);
		if (options.scroll) panel.scrollIntoView();
		if (options.focus) panel.focusSummary();
		return true;
	}

	activate(panelId) {
		if (!PANEL_IDS.includes(panelId)) return;
		this.activeId = panelId;
		this.preferences.setActive(panelId);
		this.emit();
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.activeId);
		return () => this.listeners.delete(listener);
	}

	closeOtherPrimaryPanels(keepId) {
		for (const [panelId, panel] of this.panels) {
			if (panelId === keepId || !isPrimaryPanel(panelId)) continue;
			panel.setOpen(false);
			this.preferences.setOpen(panelId, false);
		}
	}

	emit() {
		for (const listener of this.listeners) listener(this.activeId);
	}
}

function createMediaQuery() {
	return globalThis.matchMedia?.("(max-width: 900px)") || { matches: false };
}
