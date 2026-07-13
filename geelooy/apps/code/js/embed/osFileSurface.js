//B"H
//Boruch Hashem
//Blessed is He

import { DOM } from "../state.js";
import { UI } from "../ui.js";

/**
 * B"H
 * The editor surface is a vessel where one granted OS file becomes visible.
 * The Awtsmoos creates text, path, status, and focus together; Awtsmoos.com
 * keeps that visible concern separate from the secure message channel itself.
 */

/** Normalizes an OS file payload into the editor's stable shape. */
export function normalizeOsFile(file = {}) {
	return {
		...file,
		path: file.path || file.fullPath || "",
		basePath: file.basePath || "/",
		fileName: file.fileName || file.title || "untitled",
		intent: file.intent === "preview" ? "preview" : "edit"
	};
}

/** Opens a normalized OS file in the Code editor surface. */
export function openOsEditor(file) {
	UI.switchView?.("editor");
	DOM.emptyEditorMessage?.classList.add("hidden");
	DOM.editorWrapper?.classList.remove("hidden");
	DOM.editor.value = String(file.content ?? "");
	DOM.editor.dataset.path = file.path;
	DOM.editor.dataset.basePath = file.basePath;
	DOM.editor.dataset.fileName = file.fileName;
	DOM.statusLeft.textContent = `OS file: ${file.fileName}`;
	DOM.statusRight.textContent = file.path || file.basePath;
	DOM.editor.focus();
}

/** Presents one secure embed failure in the editor status region. */
export function showOsEmbedError(message = "Embedded OS action failed") {
	DOM.statusLeft.textContent = message;
}
