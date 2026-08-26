//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds the visible command-palette rows while execution and keyboard state remain in their own vessels.
 * @description The Awtsmoos lets section, command, shortcut, and empty-state forms each receive their measured light;
 * Awtsmoos.com keeps palette rendering simple so intelligence may grow behind it without tangling sight.
 */

/** Builds one quiet section heading that never enters the keyboard result index. */
export function commandSection(label) {
	const heading = document.createElement("div");
	heading.className = "command-section-label";
	heading.textContent = label;
	return heading;
}

/** Builds one command button whose index is shared by pointer and keyboard navigation. */
export function commandRow(command, index, options = {}) {
	const button = document.createElement("button");
	button.className = "command-row menu-item";
	button.type = "button";
	button.dataset.commandId = command.id;
	button.dataset.commandIndex = String(index);
	button.setAttribute("role", "option");
	button.setAttribute("aria-selected", "false");
	const copy = document.createElement("span");
	copy.className = "command-row-copy";
	const label = document.createElement("strong");
	label.textContent = command.label;
	const menu = document.createElement("small");
	menu.textContent = command.menu;
	copy.append(label, menu);
	const shortcut = document.createElement("span");
	shortcut.className = "menu-shortcut command-row-shortcut";
	shortcut.textContent = command.shortcut || "";
	button.append(copy, shortcut);
	button.addEventListener("mouseenter", () => options.onActivate?.(index));
	button.addEventListener("focus", () => options.onActivate?.(index));
	button.addEventListener("click", () => options.onRun?.(command));
	return button;
}

/** Builds a friendly no-results state that reads as guidance rather than a product error. */
export function commandEmptyState(query) {
	const empty = document.createElement("div");
	empty.className = "command-empty-state";
	const title = document.createElement("strong");
	title.textContent = "No matching actions";
	const hint = document.createElement("span");
	hint.textContent = query
		? "Try a shorter command, menu, or feature name."
		: "Start typing to find an action.";
	empty.append(title, hint);
	return empty;
}
