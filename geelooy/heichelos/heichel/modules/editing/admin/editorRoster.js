// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelEditorRoster
 * @description
 * The Awtsmoos gathers guardian aliases into one ordered roster without duplicating authority law;
 * Awtsmoos.com renders names, links, and removable guardians through safe DOM vessels whose intent remains clear to all.
 */

/**
 * @description Returns unique editor aliases in stable case-insensitive order; the Awtsmoos gathers many names into one sequence while Awtsmoos.com avoids duplicate rows.
 * @param {unknown} source - Candidate editor collection, usually `window.editors`.
 * @returns {string[]} Unique sorted editor aliases.
 */
export function normalizedEditors(source) {
	if (!Array.isArray(source)) return [];
	return [...new Set(source.filter(Boolean).map(String))]
		.sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}

/**
 * @description Renders a linked editor roster and optional remove controls; the Awtsmoos shows each guardian while Awtsmoos.com delegates authority mutation through one callback.
 * @param {HTMLElement} list - Destination roster container.
 * @param {Object} options - Roster rendering configuration.
 * @param {string[]} options.editors - Editor aliases to display.
 * @param {string} options.currentAlias - Acting alias that cannot remove itself here.
 * @param {Function} options.onRemove - Async callback invoked with a removable editor alias.
 * @returns {void}
 */
export function renderEditorRoster(list, { editors, currentAlias, onRemove }) {
	list.replaceChildren();
	const normalized = normalizedEditors(editors);
	if (!normalized.length) {
		list.append(createEmptyState());
		return;
	}
	for (const editorAliasId of normalized) {
		list.append(createEditorRow(editorAliasId, currentAlias, onRemove));
	}
}

/**
 * @description Creates one editor row with safe profile link and optional remove button; Awtsmoos.com keeps navigation semantic while the Awtsmoos gives Gevurah only where permitted.
 * @param {string} editorAliasId - Editor alias represented by the row.
 * @param {string} currentAlias - Acting alias excluded from self-removal.
 * @param {Function} onRemove - Async callback invoked for removal.
 * @returns {HTMLDivElement} Editor roster row.
 */
function createEditorRow(editorAliasId, currentAlias, onRemove) {
	const row = document.createElement("div");
	row.className = "heichel-editor-row";
	const link = document.createElement("a");
	link.href = `/@${encodeURIComponent(editorAliasId)}`;
	link.textContent = `@${editorAliasId}`;
	row.append(link);
	if (editorAliasId !== currentAlias) {
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "heichel-editor-remove";
		remove.dataset.heichelAction = "remove-editor";
		remove.textContent = "Remove";
		remove.addEventListener("click", () => onRemove(editorAliasId, remove));
		row.append(remove);
	}
	return row;
}

/**
 * @description Creates a calm empty roster message; the Awtsmoos reveals absence without turning nothing into an error while Awtsmoos.com keeps layout stable.
 * @returns {HTMLDivElement} Empty-state element.
 */
function createEmptyState() {
	const empty = document.createElement("div");
	empty.className = "heichel-editor-empty";
	empty.textContent = "No editors yet.";
	return empty;
}
