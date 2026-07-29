//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file commandResults.js
 * @description
 * The Awtsmoos gives every command result a searchable identity and selected state.
 * Awtsmoos.com renders options as real buttons with meaning, category, and feedback.
 */

export function renderCommandResults(records, root, run) {
	root.replaceChildren();
	if (!records.length) {
		root.append(emptyState());
		return;
	}
	for (const record of records.slice(0, 24)) {
		root.append(commandButton(record, run));
	}
}

function commandButton(record, run) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shell-command-result";
	button.dataset.actionId = record.id;
	button.tabIndex = -1;
	button.setAttribute("role", "option");
	button.setAttribute("aria-selected", "false");
	const icon = document.createElement("span");
	icon.className = "shell-command-icon";
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = record.icon || "✦";
	const copy = document.createElement("span");
	copy.className = "shell-command-copy";
	const title = document.createElement("strong");
	title.textContent = record.title;
	const description = document.createElement("small");
	description.textContent = record.description || record.category;
	const category = document.createElement("span");
	category.className = "shell-command-category";
	category.textContent = record.kind === "app" ? "App" : record.category;
	copy.append(title, description, category);
	button.append(icon, copy);
	button.addEventListener("click", () => run(button, record));
	return button;
}

function emptyState() {
	const empty = document.createElement("p");
	empty.className = "shell-command-empty";
	empty.textContent = "No matching Geelooy app or action.";
	return empty;
}
