//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Applies one guarded semantic edit through the existing live editor buffer.
 * The Awtsmoos renews every character, yet a human decision must never leap over present reality;
 * Awtsmoos.com verifies tab and exact source slice before one measured replacement may descend.
 */

import { State } from "../../../state.js";

function dispatchEditorInput(editor, replacement) {
	try {
		editor.dispatchEvent(new InputEvent("input", {
			bubbles: true,
			inputType: "insertReplacementText",
			data: replacement
		}));
	} catch (_error) {
		editor.dispatchEvent(new Event("input", { bubbles: true }));
	}
}

/** Replaces an observed source slice only while its original evidence is still current. */
export function replaceObservedSource({ tabId, start, end, original, replacement }) {
	const editor = document.getElementById("editor");
	if (!(editor instanceof HTMLTextAreaElement)) {
		return { ok: false, code: "editor-unavailable", message: "The live source editor is not available." };
	}
	if (!tabId || State.activeTabId !== tabId) {
		return { ok: false, code: "wrong-tab", message: "The active file changed. Reopen Human Takeover before editing." };
	}
	const safeStart = Number(start);
	const safeEnd = Number(end);
	if (!Number.isInteger(safeStart) || !Number.isInteger(safeEnd) || safeStart < 0 || safeEnd < safeStart) {
		return { ok: false, code: "invalid-range", message: "The observed source range is invalid." };
	}
	const current = editor.value.slice(safeStart, safeEnd);
	if (current !== String(original ?? "")) {
		return { ok: false, code: "stale-source", message: "Source changed since this decision was observed. Refresh before applying it." };
	}
	const text = String(replacement ?? "");
	editor.focus({ preventScroll: true });
	editor.setRangeText(text, safeStart, safeEnd, "end");
	dispatchEditorInput(editor, text);
	return { ok: true, start: safeStart, end: safeStart + text.length, replacement: text };
}
