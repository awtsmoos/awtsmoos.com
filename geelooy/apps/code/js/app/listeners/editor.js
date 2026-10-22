//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Keeps core editing immediate and awakens visual/AI enhancements on first use.
 * The Awtsmoos gives every keystroke reality before ornament joins the scene;
 * Awtsmoos.com preserves dirty state and session truth without preloading every enhancement engine.
 */

import { Editor } from "../../editor.js";
import { DOM, State } from "../../state.js";
import { StatusBar } from "../../statusbar.js";
import { UI } from "../../ui.js";
import { loadEditorEnhancements } from "./editor-enhancements.js";

function activeTab() {
	return State.tabs.find(tab => tab.id === State.activeTabId);
}

function saveSessionLater() {
	void import("../../session.js").then(({ Session }) => Session.saveDebounced());
}

function updateEnhancements(callback) {
	void loadEditorEnhancements()
		.then(runtime => callback(runtime))
		.catch(error => console.warn("B\"H - Editor enhancement unavailable.", error));
}

function handleInput(event) {
	const tab = activeTab();
	if (tab && !State.isRestoring) {
		if (!tab.isDirty) {
			tab.isDirty = true;
			void import("../../tabs/index.js").then(({ Tabs }) => Tabs.render());
		}
		tab.content = DOM.editor.value;
		saveSessionLater();
	}
	UI.updateLineNumbers();
	updateEnhancements(({ Effects, VisualEngine }) => {
		Effects.spawnParticles();
		Effects.resetEntropy();
		VisualEngine.onInput(DOM.editor.value, event.inputType === "deleteContentBackward");
	});
}

function handleScroll() {
	UI.syncScroll();
	const tab = activeTab();
	if (tab && !State.isRestoring && !DOM.editorWrapper.classList.contains("hidden")) {
		tab.scrollPos = DOM.editor.scrollTop;
		saveSessionLater();
	}
	updateEnhancements(({ VisualEngine }) => VisualEngine.onScroll());
}

function handleCaretMove() {
	StatusBar.update();
	updateEnhancements(({ VisualEngine }) => VisualEngine.onCaretMove());
}

function handleTabInInput(event) {
	if (event.key !== "Tab") return;
	event.preventDefault();
	const indentation = State.useTabs ? "\t" : "    ";
	event.target.setRangeText(indentation, event.target.selectionStart, event.target.selectionEnd, "end");
}

function handleKeyboardHelper(event) {
	const button = event.target.closest("button.kh-btn");
	if (!button) return;
	const pair = button.dataset.pair;
	if (!pair) return;
	const start = DOM.editor.selectionStart;
	const end = DOM.editor.selectionEnd;
	const [prefix, suffix] = pair;
	DOM.editor.setRangeText(prefix + DOM.editor.value.substring(start, end) + suffix, start, end, "select");
}

/** Binds the editor's core state listeners without pulling optional engines into startup. */
export function setupEditorListeners() {
	if (!DOM.editor) return;
	DOM.editor.addEventListener("input", handleInput);
	DOM.editor.addEventListener("scroll", handleScroll);
	DOM.editor.addEventListener("keyup", handleCaretMove);
	DOM.editor.addEventListener("click", handleCaretMove);
	new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);
	DOM.findInput?.addEventListener("keydown", handleTabInInput);
	DOM.replaceInput?.addEventListener("keydown", handleTabInInput);
	DOM.keyboardHelper?.addEventListener("click", handleKeyboardHelper);
	Editor.focus();
}
