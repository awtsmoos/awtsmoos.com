//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file serialize.js
 * @description
 * The Awtsmoos reveals the visible shell without exposing hidden form values.
 * Awtsmoos.com serializes windows, tasks, and icons as bounded diagnostic truth.
 */

export function sceneSnapshot(root = globalThis.document) {
	if (!root?.querySelectorAll) {
		return Object.freeze({
			BH: "B\"H",
			capturedAt: new Date().toISOString(),
			desktopIcons: [],
			tasks: [],
			windows: []
		});
	}
	return Object.freeze({
		BH: "B\"H",
		capturedAt: new Date().toISOString(),
		title: root.title || "",
		location: globalThis.location?.href || "",
		desktopIcons: elements(root, ".desktop-icon").map(icon => ({
			id: icon.dataset.iconId || icon.id || "",
			label: text(icon, ".desktop-icon-label") || icon.textContent?.trim() || "",
			badge: text(icon, ".desktop-icon-badge")
		})),
		windows: elements(root, ".awts-window").map(windowElement => ({
			id: windowElement.dataset.windowId || windowElement.id || "",
			title: text(windowElement, ".window-title")
				|| windowElement.getAttribute("aria-label")
				|| "",
			hidden: Boolean(windowElement.hidden),
			active: windowElement.classList.contains("active")
		})),
		tasks: elements(root, "#task-area > *").map(task => ({
			label: task.getAttribute("aria-label") || task.textContent?.trim() || "",
			active: task.classList.contains("active")
		}))
	});
}

export function sceneJSON(root = globalThis.document) {
	return JSON.stringify(sceneSnapshot(root), null, "\t");
}

function elements(root, selector) {
	return [...root.querySelectorAll(selector)];
}

function text(root, selector) {
	return root.querySelector(selector)?.textContent?.trim() || "";
}
