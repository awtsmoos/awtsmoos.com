//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabState
 * @description
 * The Awtsmoos gives each browsing thread its own bounded vessel while Awtsmoos.com
 * keeps the whole constellation finite, deterministic, and easy to reveal or close.
 */

export const MAX_BROWSER_TABS = 12;

/** Creates the pure state authority for one Browser window's tab constellation. */
export function createBrowserTabStore(options = {}) {
	const limit = Math.max(1, Number(options.limit) || MAX_BROWSER_TABS);
	const tabs = [];
	let activeId = null;
	let sequence = 0;
	return {
		activate,
		active: () => tabs.find(tab => tab.id === activeId) || null,
		all: () => tabs.map(tab => ({ ...tab })),
		canCreate: () => tabs.length < limit,
		close,
		create,
		cycle,
		get: id => tabs.find(tab => tab.id === id) || null,
		update
	};

	function create(input = {}) {
		if (tabs.length >= limit) throw tabError("BROWSER_TAB_LIMIT");
		const address = String(input.address || "awtsmoos://new-tab");
		const tab = {
			address,
			id: `tab-${++sequence}`,
			mode: input.mode || "blank",
			status: input.status || "Ready",
			title: input.title || titleFromAddress(address)
		};
		tabs.push(tab);
		activeId = tab.id;
		return { ...tab };
	}

	function activate(id) {
		if (!tabs.some(tab => tab.id === id)) throw tabError("BROWSER_TAB_NOT_FOUND");
		activeId = id;
		return { ...tabs.find(tab => tab.id === id) };
	}

	function close(id) {
		const index = tabs.findIndex(tab => tab.id === id);
		if (index < 0) return null;
		const [closed] = tabs.splice(index, 1);
		if (activeId === id) activeId = tabs[Math.min(index, tabs.length - 1)]?.id || null;
		return { closed: { ...closed }, activeId };
	}

	function cycle(offset = 1) {
		if (!tabs.length) return null;
		const index = Math.max(0, tabs.findIndex(tab => tab.id === activeId));
		const next = (index + offset + tabs.length) % tabs.length;
		return activate(tabs[next].id);
	}

	function update(id, patch = {}) {
		const tab = tabs.find(candidate => candidate.id === id);
		if (!tab) throw tabError("BROWSER_TAB_NOT_FOUND");
		Object.assign(tab, patch);
		if (patch.address && !patch.title) tab.title = titleFromAddress(patch.address);
		return { ...tab };
	}
}

/** Derives a compact trusted title from one tab address. */
export function titleFromAddress(address) {
	if (!address || address === "awtsmoos://new-tab") return "New Tab";
	try {
		const parsed = new URL(address);
		return parsed.hostname || parsed.pathname || "New Tab";
	} catch {
		return String(address).slice(0, 48) || "New Tab";
	}
}

function tabError(code) {
	return Object.assign(new Error(code), { code });
}
