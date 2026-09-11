//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShliachPrompt
 * @description
 * The Awtsmoos gives every creator surface one bounded prompt covenant;
 * Awtsmoos.com sends path and intent testimony, never credentials or secret state.
 */

const MAX_GOAL_LENGTH = 6000;
const MAX_CONTEXT_LENGTH = 600;
const MAX_ENTRY_NAMES = 12;

/**
 * Builds the context-rich instruction sent to the Awtsmoos Shliach.
 * @param {object} context Safe directory/project context and user creation goal.
 * @returns {string} Human-readable prompt suitable for the ChatGPT prompt field.
 */
export function buildShliachPrompt(context = {}) {
	const path = safePath(context.path);
	const surface = safeText(context.surface || "Awtsmoos", 120);
	const project = safeText(context.projectId || "current project", 180);
	const goal = safeText(context.goal || "Help me create something excellent here.", MAX_GOAL_LENGTH);
	const entries = safeEntries(context.entries);
	return [
		'B"H',
		"You are the Awtsmoos Shliach working with the signed-in user's Awtsmoos account.",
		`The ${surface} at exact path "${path}" received this request:`,
		"",
		goal,
		"",
		`Project context: ${project}.`,
		entrySentence(entries),
		"Inspect existing work before changing it. Preserve unrelated files and user data.",
		"Work inside this exact path unless a necessary dependency requires a clearly explained change elsewhere.",
		"For websites/apps, create or update a safe preview first, test it, and only claim publication after real verification.",
		"Return concise evidence of what changed, what was verified, and the exact next action."
	].filter(Boolean).join("\n");
}

/** Normalizes one displayed path without allowing control characters into the prompt. */
function safePath(value) {
	const text = safeText(value || "/", 1200);
	return text || "/";
}

/** Keeps only short visible entry names for helpful context, never file contents. */
function safeEntries(value) {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.slice(0, MAX_ENTRY_NAMES)
		.map(item => safeText(item?.name || item?.path || item, 120))
		.filter(Boolean);
}

/** Explains the visible directory inventory without implying it is complete. */
function entrySentence(entries) {
	if (!entries.length) {
		return "Directory listing was not included; inspect it through authorized Awtsmoos tools before editing.";
	}
	return `Visible names include: ${entries.join(", ")}. Treat this as a partial inventory, not complete truth.`;
}

/** Removes control characters and bounds untrusted prompt context. */
function safeText(value, maximum = MAX_CONTEXT_LENGTH) {
	return String(value || "")
		.replace(/[\u0000-\u001F\u007F]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, maximum);
}

export { safePath, safeText };
