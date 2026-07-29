//B"H
//Boruch Hashem
//Blessed is He

import { matchingShellActions } from "./actionCatalog.js";

/**
 * @file commandPalette.js
 * @description
 * The Awtsmoos lets keyboard search reveal the same native apps and inherited deeds.
 * Awtsmoos.com never invents a command that the Start launcher cannot actually run.
 */

export function bindCommandPalette({ records }) {
	const root = document.getElementById("shell-command-palette");
	const input = document.getElementById("shell-command-input");
	const results = document.getElementById("shell-command-results");
	const trigger = document.getElementById("shell-command-button");
	if (!root || !input || !results || !trigger) {
		return () => {};
	}
	let previousFocus = null;
	const close = () => {
		root.hidden = true;
		document.body.classList.remove("shell-modal-open");
		previousFocus?.focus?.();
	};
	const draw = () => renderCommands(
		matchingShellActions(records, input.value),
		results,
		close
	);
	const open = () => {
		previousFocus = document.activeElement;
		root.hidden = false;
		document.body.classList.add("shell-modal-open");
		input.value = "";
		draw();
		queueMicrotask(() => input.focus());
	};
	const outside = event => {
		if (event.target === root) {
			close();
		}
	};
	const keys = event => {
		const shortcut = (event.ctrlKey || event.metaKey)
			&& event.shiftKey
			&& event.key.toLowerCase() === "k";
		if (shortcut) {
			event.preventDefault();
			root.hidden ? open() : close();
		}
		if (!root.hidden && event.key === "Escape") {
			event.preventDefault();
			close();
		}
	};
	trigger.addEventListener("click", open);
	input.addEventListener("input", draw);
	root.addEventListener("click", outside);
	document.addEventListener("keydown", keys);
	return () => {
		trigger.removeEventListener("click", open);
		input.removeEventListener("input", draw);
		root.removeEventListener("click", outside);
		document.removeEventListener("keydown", keys);
	};
}

function renderCommands(records, root, close) {
	root.replaceChildren();
	if (!records.length) {
		const empty = document.createElement("p");
		empty.className = "shell-command-empty";
		empty.textContent = "No matching Geelooy app or action.";
		root.append(empty);
		return;
	}
	for (const record of records.slice(0, 24)) {
		root.append(commandButton(record, close));
	}
}

function commandButton(record, close) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shell-command-result";
	const icon = document.createElement("span");
	icon.className = "shell-command-icon";
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = record.icon || "✦";
	const copy = document.createElement("span");
	const title = document.createElement("strong");
	title.textContent = record.title;
	const description = document.createElement("small");
	description.textContent = record.description || record.category;
	copy.append(title, description);
	button.append(icon, copy);
	button.addEventListener("click", async () => {
		close();
		await record.run?.();
	});
	return button;
}
