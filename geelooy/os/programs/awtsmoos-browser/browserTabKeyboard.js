//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabKeyboard
 * @description
 * The Awtsmoos lets intention cross keyboard and pointer without becoming two systems;
 * Awtsmoos.com translates familiar tab chords into the same small controller actions.
 */

/** Classifies one keyboard event into a Browser tab action. */
export function browserTabShortcut(event = {}) {
	const key = String(event.key || "").toLowerCase();
	const command = Boolean(event.metaKey || event.ctrlKey);
	if (!command || event.altKey) return null;
	if (key === "t") return "new";
	if (key === "w") return "close";
	if (key === "tab") return event.shiftKey ? "previous" : "next";
	return null;
}

/** Binds familiar tab shortcuts to one Browser root and returns a disposer. */
export function bindBrowserTabKeyboard(root, actions = {}) {
	const handler = event => {
		const action = browserTabShortcut(event);
		if (!action) return;
		event.preventDefault?.();
		if (action === "new") actions.create?.();
		if (action === "close") actions.close?.();
		if (action === "next") actions.cycle?.(1);
		if (action === "previous") actions.cycle?.(-1);
	};
	root.addEventListener("keydown", handler);
	return () => root.removeEventListener("keydown", handler);
}
