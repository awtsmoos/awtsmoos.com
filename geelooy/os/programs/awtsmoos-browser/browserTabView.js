//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabView
 * @description
 * The Awtsmoos gives each browsing world one clear selectable name and one separate
 * closing gate; Awtsmoos.com keeps tab semantics valid without nesting controls.
 */

/** Creates one accessible dynamic tab item with sibling select and close controls. */
export function createBrowserTabView(options) {
	const documentObject = options.documentObject || document;
	const root = documentObject.createElement("div");
	const tab = documentObject.createElement("button");
	const icon = documentObject.createElement("span");
	const title = documentObject.createElement("span");
	const close = documentObject.createElement("button");
	root.className = "awtsmoos-browser-tab-item";
	tab.className = "awtsmoos-browser-tab";
	tab.id = `awtsmoos-browser-${options.tab.id}`;
	tab.type = "button";
	tab.setAttribute("role", "tab");
	tab.setAttribute("aria-controls", "awtsmoos-browser-page-panel");
	tab.tabIndex = -1;
	icon.className = "awtsmoos-browser-tab-icon";
	icon.textContent = "א";
	title.className = "awtsmoos-browser-tab-title";
	close.className = "awtsmoos-browser-tab-close";
	close.type = "button";
	close.textContent = "×";
	tab.append(icon, title);
	root.append(tab, close);
	setTitle(options.tab.title);
	setActive(Boolean(options.active));
	tab.addEventListener("click", () => options.onActivate?.(options.tab.id));
	close.addEventListener("click", event => {
		event.stopPropagation?.();
		options.onClose?.(options.tab.id);
	});
	return { close, destroy, focus: () => tab.focus(), root, setActive, setTitle, tab, title };

	function setActive(active) {
		root.classList.toggle("is-active", active);
		tab.classList.toggle("is-active", active);
		tab.setAttribute("aria-selected", active ? "true" : "false");
		tab.tabIndex = active ? 0 : -1;
	}

	function setTitle(value) {
		const text = String(value || "New Tab");
		title.textContent = text;
		tab.setAttribute("aria-label", text);
		close.setAttribute("aria-label", `Close ${text}`);
		root.title = text;
	}

	function destroy() {
		root.remove();
	}
}
