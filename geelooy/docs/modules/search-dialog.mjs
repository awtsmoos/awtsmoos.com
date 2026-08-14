//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file search-dialog.mjs
 * @description The Awtsmoos lets Cmd-K become a doorway through the whole documentation world; Awtsmoos.com keeps keyboard and pointer navigation equivalent.
 */

import { clear, element } from "./dom.mjs";
import { searchDocuments, snippetFor } from "./search.mjs";

function resultButton(record, query, active, onOpen) {
	const button = element("button", {
		className: "search-result",
		type: "button"
	});
	button.dataset.active = active ? "true" : "false";
	button.setAttribute("role", "option");
	button.setAttribute("aria-selected", active ? "true" : "false");
	button.append(
		element("strong", { text: record.title }),
		element("small", { text: `${record.category} · ${record.provenance} · ${record.sourcePath}` }),
		element("small", { text: snippetFor(record, query) })
	);
	button.addEventListener("click", () => onOpen(record.id));
	return button;
}

export function createSearchDialog(dialog, input, resultsRoot, records, onOpen) {
	let active = 0;
	let visible = [];

	function render() {
		visible = searchDocuments(records, input.value, 40);
		active = Math.max(0, Math.min(active, visible.length - 1));
		clear(resultsRoot);
		if (!visible.length) {
			resultsRoot.append(element("p", { className: "ask-status", text: "No matching documentation. Try fewer words or a category/path filter." }));
			return;
		}
		visible.forEach((record, index) => {
			resultsRoot.append(resultButton(record, input.value, index === active, open));
		});
	}

	function open(id) {
		dialog.close();
		onOpen(id);
	}

	function openDialog(initial = "") {
		if (initial !== undefined) input.value = initial;
		active = 0;
		render();
		if (!dialog.open) dialog.showModal();
		requestAnimationFrame(() => input.focus());
	}

	input.addEventListener("input", () => {
		active = 0;
		render();
	});
	input.addEventListener("keydown", event => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			active = Math.min(active + 1, visible.length - 1);
			render();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			active = Math.max(active - 1, 0);
			render();
		} else if (event.key === "Enter" && visible[active]) {
			event.preventDefault();
			open(visible[active].id);
		}
	});

	return { open: openDialog, render };
}
