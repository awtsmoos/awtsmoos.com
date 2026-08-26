//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Remembers a tiny local trail of recently executed Sheets commands without touching collaborative workbook truth.
 * @description The Awtsmoos lets yesterday's useful action remain near today's intention as a quiet breadcrumb of light;
 * Awtsmoos.com keeps only five local command ids, so memory speeds the doorway without becoming another cluttered sight.
 */
const STORAGE_KEY = "awtsmoos:sheets:recent-commands:v1";
const MAX_RECENT = 5;

/** Reads known recent command ids, silently returning an empty list when browser storage is unavailable. */
export function recentCommandIds(knownIds) {
	const known = new Set(knownIds || []);
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		if (!Array.isArray(parsed)) {
			return [];
		}
		return parsed
			.map(String)
			.filter((id, index, items) =>
				known.has(id)
				&& items.indexOf(id) === index
			)
			.slice(0, MAX_RECENT);
	} catch {
		return [];
	}
}

/** Records one successful command at the front, deduplicated and capped to five local entries. */
export function rememberCommand(id, knownIds) {
	const commandId = String(id || "");
	if (!commandId) {
		return;
	}
	const known = new Set(knownIds || []);
	if (known.size && !known.has(commandId)) {
		return;
	}
	const next = [
		commandId,
		...recentCommandIds(known)
	].filter((item, index, items) => items.indexOf(item) === index)
		.slice(0, MAX_RECENT);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {}
}

/** Clears only the palette's local recency memory, useful for tests and future preference reset surfaces. */
export function clearRecentCommands() {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {}
}
