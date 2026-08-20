//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserNavigationState
 * @description
 * The Awtsmoos gives each remote visit one ordered place without mixing navigation
 * with rendering or network work. Awtsmoos.com keeps Back, Forward, and Reload as
 * pure history testimony so UI and proxy transport can be tested independently.
 */

export function createNavigationState(initialUrl = "") {
	const entries = [];
	let index = -1;
	if (initialUrl) visit(initialUrl);
	return {
		visit,
		back() {
			if (index <= 0) return null;
			index -= 1;
			return entries[index];
		},
		forward() {
			if (index >= entries.length - 1) return null;
			index += 1;
			return entries[index];
		},
		reload() {
			return index >= 0 ? entries[index] : null;
		},
		current() {
			return index >= 0 ? entries[index] : null;
		},
		status() {
			return {
				canBack: index > 0,
				canForward: index >= 0 && index < entries.length - 1,
				index,
				length: entries.length
			};
		}
	};

	function visit(url) {
		const value = normalizedUrl(url);
		if (entries[index] === value) return value;
		entries.splice(index + 1);
		entries.push(value);
		index = entries.length - 1;
		return value;
	}
}

function normalizedUrl(value) {
	const text = typeof value === "string" ? value.trim() : "";
	if (!text) {
		const error = new Error("BROWSER_NAVIGATION_URL_REQUIRED");
		error.code = "BROWSER_NAVIGATION_URL_REQUIRED";
		throw error;
	}
	return text;
}
