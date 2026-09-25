//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabController
 * @description
 * The Awtsmoos coordinates many distinct browsing lives through one visible chrome;
 * Awtsmoos.com reveals one tab at a time while preserving every hidden tab's vessel.
 */

import { createBrowserTabStore } from "./browserTabState.js";
import { createBrowserTabView } from "./browserTabView.js";

/** Coordinates tab state, views, sessions, and the shared Browser toolbar. */
export function createBrowserTabController(options) {
	const store = createBrowserTabStore({ limit: options.limit });
	const records = new Map();
	return {
		activate,
		activeSession: () => records.get(store.active()?.id)?.session || null,
		activeTab: () => store.active(),
		all: () => store.all(),
		attachExisting: content => records.get(store.active()?.id)?.session.attachExisting(content),
		close,
		create,
		cycle,
		destroy
	};

	function create(input = {}) {
		const previous = store.active();
		if (previous) records.get(previous.id)?.session.pause();
		const tab = store.create(input);
		const view = createBrowserTabView({
			active: true,
			documentObject: options.documentObject,
			onActivate: id => activate(id, { focus: true }),
			onClose: id => close(id),
			tab
		});
		const session = options.createSession(tab, patch => update(tab.id, patch));
		records.set(tab.id, { session, view });
		options.tabList.append(view.root);
		activate(tab.id, { focus: Boolean(input.focus) });
		return store.get(tab.id);
	}

	function activate(id, behavior = {}) {
		const previous = store.active();
		if (previous?.id !== id) records.get(previous?.id)?.session.pause();
		const tab = store.activate(id);
		for (const [tabId, record] of records) record.view.setActive(tabId === id);
		records.get(id)?.session.resume();
		syncToolbar(tab);
		if (behavior.focus) records.get(id)?.view.focus();
		return tab;
	}

	function close(id) {
		const record = records.get(id);
		record?.session.destroy();
		record?.view.destroy();
		records.delete(id);
		const result = store.close(id);
		if (!result) return null;
		if (!store.active()) return create({ focus: true });
		return activate(store.active().id, { focus: true });
	}

	function cycle(offset = 1) {
		const tabs = store.all();
		if (!tabs.length) return null;
		const current = Math.max(0, tabs.findIndex(tab => tab.id === store.active()?.id));
		const next = (current + offset + tabs.length) % tabs.length;
		return activate(tabs[next].id, { focus: true });
	}

	function update(id, patch) {
		const tab = store.update(id, patch);
		records.get(id)?.view.setTitle(tab.title);
		if (store.active()?.id === id) syncToolbar(tab);
		return tab;
	}

	function syncToolbar(tab) {
		options.browserSurface.address.value = tab.address === "awtsmoos://new-tab" ? "" : tab.address;
		options.remoteSurface.status.textContent = tab.status || "Ready";
		options.newTabButton.disabled = !store.canCreate();
		options.newTabButton.setAttribute("aria-disabled", String(!store.canCreate()));
		options.pagePanel?.setAttribute("aria-labelledby", `awtsmoos-browser-${tab.id}`);
	}

	function destroy() {
		for (const record of records.values()) {
			record.session.destroy();
			record.view.destroy();
		}
		records.clear();
	}
}
