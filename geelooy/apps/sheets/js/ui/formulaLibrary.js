//B"H
//Boruch Hashem
//Blessed is He

import {
	formulaCategories,
	formulaFunctionCatalog
} from "../formula/functionRegistry.js";

/**
 * @file Reveals the executable formula registry through an explicitly designed search field, category chips, and function cards.
 * @description The Awtsmoos gives each function a discoverable name, signature, and measured light;
 * Awtsmoos.com keeps search, category, and execution visually owned so no native-default fragment breaks the sight.
 */
export class ChochmahFormulaLibrary {
	constructor() {
		this.dialog = document.getElementById("formulaLibraryDialog");
		this.query = "";
		this.category = "All";
	}

	/** Binds toolbar, command-event, and keyboard entry points. */
	bind() {
		document.getElementById("formulaLibraryButton")?.addEventListener(
			"click",
			() => this.open()
		);
		document.addEventListener(
			"sheets:formula-library",
			() => this.open()
		);
		document.addEventListener("keydown", (event) => {
			if (event.shiftKey && event.key === "F4") {
				event.preventDefault();
				this.open();
			}
		});
	}

	/** Opens a freshly rendered library and focuses its explicit search-field primitive. */
	open() {
		if (!this.dialog) {
			return;
		}
		this.render();
		this.dialog.showModal();
		this.dialog.querySelector("input")?.focus();
	}

	/** Renders the designed search surface, category chips, and executable function list. */
	render() {
		const search = document.createElement("input");
		search.className = "command-search aw-field";
		search.placeholder = "Search functions, signatures, examples…";
		search.value = this.query;
		search.setAttribute("aria-label", "Search formula functions");
		const chips = document.createElement("div");
		chips.className = "formula-chip-row";
		chips.append(
			...["All", ...formulaCategories()].map((name) => this.chip(name))
		);
		const list = document.createElement("div");
		list.className = "formula-library-list";
		search.addEventListener("input", () => {
			this.query = search.value;
			this.renderList(list);
		});
		this.renderList(list);
		const shell = document.createElement("div");
		shell.className = "command-search-shell";
		shell.append(search);
		this.dialog.replaceChildren(shell, chips, list);
	}

	/** Creates one category filter chip whose component class owns its full interactive visual language. */
	chip(name) {
		const button = document.createElement("button");
		button.className = "formula-chip";
		button.classList.toggle("is-active", name === this.category);
		button.textContent = name;
		button.type = "button";
		button.addEventListener("click", () => {
			this.category = name;
			this.render();
		});
		return button;
	}

	/** Paints the catalog subset selected by category and search query. */
	renderList(list) {
		const query = this.query.trim().toLowerCase();
		const items = formulaFunctionCatalog().filter((item) => {
			const categoryMatches = this.category === "All"
				|| item.category === this.category;
			const haystack = `${item.name} ${item.signature} ${item.description} ${item.example}`
				.toLowerCase();
			return categoryMatches && (!query || haystack.includes(query));
		});
		list.replaceChildren(
			...items.map((item) => this.card(item))
		);
	}

	/** Creates one clickable function card whose specialized component class owns hover, focus, and touch states. */
	card(item) {
		const button = document.createElement("button");
		button.className = "formula-card menu-item";
		button.type = "button";
		const text = document.createElement("span");
		text.textContent = `${item.signature} — ${item.description}`;
		const example = document.createElement("span");
		example.className = "menu-shortcut";
		example.textContent = item.example;
		button.append(text, example);
		button.addEventListener("click", () => this.insert(item.name));
		return button;
	}

	/** Inserts one function call starter into the formula bar without silently committing it. */
	insert(name) {
		this.dialog.close();
		const input = document.getElementById("formulaInput");
		if (!input) {
			return;
		}
		input.value = `=${name}(`;
		input.focus();
		input.setSelectionRange(input.value.length, input.value.length);
	}
}
