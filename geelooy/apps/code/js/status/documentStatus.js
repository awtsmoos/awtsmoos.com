// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals cursor, language, branch, and document boundaries in a
 * small Apps Code vessel while tunnel presence remains independently measured.
 */

const LANGUAGE_NAMES = Object.freeze({
	js: "JavaScript",
	html: "HTML",
	css: "CSS",
	md: "Markdown",
	json: "JSON",
	py: "Python",
	sh: "Shell"
});

/**
 * Builds the cursor and word-count text.
 *
 * @param {object} context Editor context.
 * @returns {string} Left-side document text.
 */
export function documentPositionText(context) {
	const cursor = context.editor.getCursorInfo();
	let text = `Ln ${cursor.line}, Col ${cursor.col}`;
	if (context.activeTabId && !context.editorWrapper?.classList?.contains("hidden")) {
		text += `  |  Words: ${countWords(context.editorElement?.value)}`;
	}
	return text;
}

/**
 * Builds language, branch, and read-only text.
 *
 * @param {object} activeTab Active editor tab.
 * @param {object} workspace Active workspace.
 * @returns {string} Right-side document text.
 */
export function documentModeText(activeTab, workspace) {
	if (!activeTab) {
		return "";
	}
	const parts = [languageName(activeTab.item?.name)];
	if (workspace?.readOnly) {
		parts.push("[Read-Only]");
	}
	if (activeTab.item?.type === "github" && activeTab.item?.branch) {
		parts.push(activeTab.item.branch);
	}
	return parts.join("  |  " );
}

/** @param {string} filename File name. @returns {string} Language name. */
export function languageName(filename) {
	const extension = filename ? filename.split(".").pop().toLowerCase() : "";
	return LANGUAGE_NAMES[extension] || "Plain Text";
}

function countWords(value) {
	const words = String(value || "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return words.length;
}
