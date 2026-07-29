//B"H
//Boruch Hashem
//Blessed is He

import { matchingShellActions } from "./actionCatalog.js";
import { createShellActionRunner } from "./actionRunner.js";
import { renderCommandResults } from "./commandResults.js";
import { bindFocusTrap, restoreConnectedFocus } from "./focusTrap.js";
import { bindResultNavigation } from "./resultNavigation.js";

/**
 * @file commandPalette.js
 * @description
 * The Awtsmoos gives keyboard search one modal, selected, guarded command surface.
 * Awtsmoos.com always returns dismissal to the Search control that invoked it.
 */

export function bindCommandPalette({ records }) {
	const root = document.getElementById("shell-command-palette");
	const input = document.getElementById("shell-command-input");
	const results = document.getElementById("shell-command-results");
	const trigger = document.getElementById("shell-command-button");
	if (!root || !input || !results || !trigger) return () => {};
	const meta = ensureMeta(input, results);
	const close = (restore = true) => {
		root.hidden = true;
		root.dataset.open = "false";
		document.body.classList.remove("shell-modal-open");
		if (restore) restoreConnectedFocus(trigger);
	};
	const run = createShellActionRunner({ close: () => close(false) });
	const navigation = bindResultNavigation({
		input,
		root: results,
		selector: ".shell-command-result",
		onEscape: () => close(true)
	});
	const draw = () => {
		const matches = matchingShellActions(records, input.value).slice(0, 24);
		renderCommandResults(matches, results, run);
		meta.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} · arrows move · Enter opens`;
		navigation.refresh();
	};
	const open = () => {
		root.hidden = false;
		root.dataset.open = "true";
		document.body.classList.add("shell-modal-open");
		input.value = "";
		draw();
		queueMicrotask(() => input.focus());
	};
	const outside = event => {
		if (event.target === root) close(true);
	};
	const keys = event => {
		const shortcut = (event.ctrlKey || event.metaKey)
			&& event.shiftKey
			&& event.key.toLowerCase() === "k";
		if (!shortcut) return;
		event.preventDefault();
		root.hidden ? open() : close(true);
	};
	const releaseTrap = bindFocusTrap(root);
	trigger.addEventListener("click", open);
	input.addEventListener("input", draw);
	root.addEventListener("click", outside);
	document.addEventListener("keydown", keys);
	return () => {
		navigation.dispose();
		releaseTrap();
		trigger.removeEventListener("click", open);
		input.removeEventListener("input", draw);
		root.removeEventListener("click", outside);
		document.removeEventListener("keydown", keys);
	};
}

function ensureMeta(input, results) {
	const existing = document.getElementById("shell-command-meta");
	if (existing) return existing;
	const meta = document.createElement("div");
	meta.id = "shell-command-meta";
	meta.className = "shell-command-meta";
	input.after(meta);
	meta.after(results);
	return meta;
}
