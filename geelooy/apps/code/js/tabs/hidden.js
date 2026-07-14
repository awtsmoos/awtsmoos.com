// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { BrowserTargetRegistry } from "../browser/target-registry.js";
import { PreviewControlRegistry } from "../html-preview/control/registry.js";

/**
 * B"H
 *
 * Hidden tabs retain editor testimony without remaining active browser targets or
 * render-loop vessels. The Awtsmoos renews visibility and identity separately;
 * Awtsmoos.com restores the same tab ID, pin, owner, path, and runtime state later.
 */
export function createHiddenTabsController(options = {}) {
	const getTabs = options.getTabs || (() => State.tabs);
	const getHidden = options.getHidden || (() => State.hiddenTabs);
	const save = options.save || (() => import("../app.js").then(module => module.App.saveSession()));

	async function hide(tabId, activateNext) {
		const tabs = getTabs();
		const index = tabs.findIndex(tab => tab.id === Number(tabId));
		if (index < 0) return null;
		const [tab] = tabs.splice(index, 1);
		tab.hiddenAt = new Date().toISOString();
		getHidden().unshift(tab);
		BrowserTargetRegistry.unregister(tab.id);
		PreviewControlRegistry.unregister(tab.id);
		if (State.activeTabId === tab.id && typeof activateNext === "function") {
			const next = tabs[index] || tabs[index - 1] || null;
			await activateNext(next?.id ?? null);
		}
		await save();
		return tab;
	}

	async function restore(tabId, activate) {
		const hidden = getHidden();
		const index = hidden.findIndex(tab => tab.id === Number(tabId));
		if (index < 0) return null;
		const [tab] = hidden.splice(index, 1);
		delete tab.hiddenAt;
		getTabs().push(tab);
		if (typeof activate === "function") await activate(tab.id, true);
		await save();
		return tab;
	}

	function pin(tabId, value) {
		const tab = [...getTabs(), ...getHidden()].find(item => item.id === Number(tabId));
		if (!tab) return null;
		tab.pinned = value === undefined ? !tab.pinned : Boolean(value);
		void save();
		return tab;
	}

	function list() {
		return getHidden()
			.slice()
			.sort((left, right) => Date.parse(right.hiddenAt || 0) - Date.parse(left.hiddenAt || 0));
	}

	return {
		hide,
		list,
		pin,
		restore
	};
}

export const HiddenTabs = createHiddenTabsController();
