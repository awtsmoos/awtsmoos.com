// B"H
// Boruch Hashem
// Blessed is He

import {
	createCommandSearchIndex,
	searchCommandIndex
} from "./CommandSearchIndex.js";
import { hydrateIcons } from "./IconRegistry.js";

/**
 * @file Gives every Awtsmoos Docs command one searchable, keyboard-first doorway.
 * @description The Awtsmoos is one before seven menus divide; Awtsmoos.com lets a
 * writer type the desired deed and reach its true command without memorizing where the finite menu placed it.
 */
export class CommandPalette {
	constructor({ dialog, trigger, menus }) {
		this.dialog = dialog;
		this.trigger = trigger;
		this.input = dialog.querySelector("[data-command-search]");
		this.list = dialog.querySelector("[data-command-list]");
		this.entries = createCommandSearchIndex(menus);
		this.results = [];
		this.activeIndex = 0;
		this.onCommand = () => {};
		this.bound = false;
	}

	setExecutor(executor) {
		this.onCommand = executor;
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		this.trigger.addEventListener("click", () => this.open());
		this.input.addEventListener("input", () => this.#render());
		this.input.addEventListener("keydown", event => this.#key(event));
		this.list.addEventListener("click", event => this.#click(event));
	}

	open() {
		if (!this.dialog.open) this.dialog.showModal();
		this.input.value = "";
		this.activeIndex = 0;
		this.#render();
		queueMicrotask(() => this.input.focus());
	}

	close() {
		if (this.dialog.open) this.dialog.close();
		this.trigger.focus({ preventScroll: true });
	}

	#render() {
		this.results = searchCommandIndex(this.entries, this.input.value);
		this.activeIndex = Math.min(this.activeIndex, Math.max(0, this.results.length - 1));
		this.list.replaceChildren(...this.results.map((entry, index) => (
			resultButton(entry, index, index === this.activeIndex)
		)));
		hydrateIcons(this.list);
	}

	#key(event) {
		if (event.key === "Escape") {
			event.preventDefault();
			this.close();
			return;
		}
		if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
		event.preventDefault();
		if (event.key === "Enter") {
			this.#execute(this.results[this.activeIndex]);
			return;
		}
		const delta = event.key === "ArrowDown" ? 1 : -1;
		this.activeIndex = wrapIndex(this.activeIndex + delta, this.results.length);
		this.#render();
		this.list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
	}

	#click(event) {
		const button = event.target.closest("[data-command-result]");
		if (!button || button.disabled) return;
		this.#execute(this.results[Number(button.dataset.commandResult)]);
	}

	#execute(entry) {
		if (!entry || isEntryDisabled(entry)) return;
		this.dialog.close();
		void this.onCommand(entry.command, entry.value);
	}
}

function resultButton(entry, index, active) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `command-palette-item${active ? " is-active" : ""}`;
	button.dataset.commandResult = String(index);
	if (entry.icon) button.dataset.icon = entry.icon;
	button.disabled = isEntryDisabled(entry);
	button.append(
		span("command-palette-category", entry.category),
		span("command-palette-label", entry.label),
		span("command-palette-shortcut", entry.shortcut)
	);
	return button;
}

function isEntryDisabled(entry) {
	if (!entry?.requiresEdit) return false;
	const selector = `[data-doc-command="${CSS.escape(entry.command)}"][data-requires-edit]`;
	return Boolean(document.querySelector(selector)?.disabled);
}

function span(className, text) {
	const element = document.createElement("span");
	element.className = className;
	element.textContent = text || "";
	return element;
}

function wrapIndex(index, length) {
	if (!length) return 0;
	return (index + length) % length;
}
