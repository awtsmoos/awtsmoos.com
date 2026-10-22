//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Interprets keyboard intent without preloading every command surface.
 * The Awtsmoos joins key and consequence only when the human presses the combination;
 * Awtsmoos.com leaves palette, find, Vibe, tabs, menus, and effects dormant until manifestation.
 */

import { ensureFeatureStyles } from "../../assets/feature-styles.js";
import { Editor } from "../../editor.js";
import { DOM, State } from "../../state.js";

async function openPalette() {
	await ensureFeatureStyles("search");
	const { CommandPalette } = await import("../../command-palette.js");
	CommandPalette.toggle();
}

async function closeOverlays() {
	const [{ Menus }, { CommandPalette }, { FindReplace }] = await Promise.all([
		import("../../menus/index.js"),
		import("../../command-palette.js"),
		import("../../find-replace.js")
	]);
	Menus.hideAll();
	CommandPalette.hide();
	FindReplace.hide();
}

async function saveActive() {
	const tab = State.tabs?.find(item => item.id === State.activeTabId);
	if (!tab) return;
	if (tab.fileType === "vibe") {
		await ensureFeatureStyles("vibe");
		const { VibeController } = await import("../../vibe/vibe-controller.js");
		return VibeController.saveSessionToFile(tab);
	}
	const { Tabs } = await import("../../tabs/index.js");
	return Tabs.saveActive();
}

async function showFind() {
	const { FindReplace } = await import("../../find-replace.js");
	const value = DOM.editor?.value || "";
	const start = DOM.editor?.selectionStart || 0;
	const end = DOM.editor?.selectionEnd || 0;
	FindReplace.show(value.substring(start, end));
}

function playKeystroke(key) {
	void import("../../effects.js").then(({ Effects }) => Effects.playKeystrokeSound(key));
}

function handleEditorShortcut(event) {
	const modifier = event.ctrlKey || event.metaKey;
	const key = event.key;
	let action = null;
	if (modifier && event.shiftKey && key.toLowerCase() === "d") action = () => Editor.duplicateLine();
	else if (modifier && event.shiftKey && key.toLowerCase() === "k") action = () => Editor.deleteLine();
	else if (modifier && key === "/") action = () => Editor.toggleComment();
	else if (modifier && !event.shiftKey && key === "Enter") action = () => Editor.insertLine("after");
	else if (modifier && event.shiftKey && key === "Enter") action = () => Editor.insertLine("before");
	else if (event.altKey && key === "ArrowUp") action = () => Editor.moveLine(-1);
	else if (event.altKey && key === "ArrowDown") action = () => Editor.moveLine(1);
	if (!action) return;
	event.preventDefault();
	action();
}

function handleGlobalShortcut(event) {
	const modifier = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	if (!modifier && event.key.length === 1) playKeystroke(event.key);
	if (event.key === "Escape") void closeOverlays();
	if (modifier && event.shiftKey && key === "p") {
		event.preventDefault();
		void openPalette();
	} else if (modifier && event.shiftKey && key === "t") {
		event.preventDefault();
		void import("../../tabs/index.js").then(({ Tabs }) => Tabs.reopenLastClosed());
	} else if (modifier && key === "g") {
		event.preventDefault();
		Editor.promptGoToLine();
	} else if (modifier && key === "s") {
		event.preventDefault();
		void saveActive();
	} else if (modifier && key === "f") {
		event.preventDefault();
		void showFind();
	}
}

/** Binds lightweight shortcut listeners while keeping feature modules out of startup. */
export function setupShortcutListeners() {
	window.addEventListener("keydown", handleGlobalShortcut);
	DOM.editor?.addEventListener("keydown", handleEditorShortcut);
}
