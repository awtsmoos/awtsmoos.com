// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders ordered footnote and endnote definitions inside the Awtsmoos side workspace.
 * @description The Awtsmoos is beyond margin and definition; Awtsmoos.com lets every
 * numbered note reveal its meaning in a calm navigable vessel, where editing and jumping
 * remain explicit actions rather than turning the document body into permanent chrome.
 */
export class FootnoteWorkspaceView {
	constructor(root, callbacks = {}) {
		this.root = root;
		this.callbacks = callbacks;
		this.root.addEventListener("click", event => this.#click(event));
	}

	/** Renders resolved definitions plus compact warnings for unresolved and orphan state. */
	render(index = {}) {
		const definitions = index.definitions || [];
		const children = [];
		for (const kind of ["footnote", "endnote"]) {
			const group = definitions.filter(item => item.kind === kind);
			if (group.length) children.push(this.#group(kind, group));
		}
		if (index.unresolved?.length) {
			children.push(this.#warning(`${index.unresolved.length} unresolved reference(s)`));
		}
		if (index.orphans?.length) {
			children.push(this.#warning(`${index.orphans.length} unreferenced definition(s)`));
		}
		this.root.replaceChildren(...children);
		this.root.classList.toggle("is-empty", children.length === 0);
	}

	/** Highlights one definition after a document reference is clicked. */
	focus(objectId) {
		for (const item of this.root.querySelectorAll("[data-reference-object]")) {
			item.classList.toggle(
				"is-active",
				item.dataset.referenceObject === objectId
			);
		}
		const target = this.root.querySelector(
			`[data-reference-object="${CSS.escape(objectId)}"]`
		);
		target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}

	#group(kind, definitions) {
		const section = document.createElement("section");
		section.className = "reference-group";
		const heading = document.createElement("h3");
		heading.textContent = kind === "endnote" ? "Endnotes" : "Footnotes";
		section.append(heading, ...definitions.map(item => this.#item(item)));
		return section;
	}

	#item(reference) {
		const item = document.createElement("article");
		item.className = "reference-item";
		item.dataset.referenceObject = reference.objectId;
		const number = document.createElement("span");
		number.className = "reference-number";
		number.textContent = String(reference.number);
		const content = document.createElement("div");
		content.className = "reference-content";
		content.innerHTML = reference.object.content;
		item.append(number, content, this.#actions(reference.objectId));
		return item;
	}

	#actions(objectId) {
		const actions = document.createElement("div");
		actions.className = "reference-actions";
		for (const [action, label] of [["jump", "Jump"], ["edit", "Edit"]]) {
			const button = document.createElement("button");
			button.type = "button";
			button.textContent = label;
			button.dataset.referenceAction = action;
			button.dataset.referenceId = objectId;
			actions.append(button);
		}
		return actions;
	}

	#warning(text) {
		const warning = document.createElement("p");
		warning.className = "reference-warning";
		warning.textContent = text;
		return warning;
	}

	#click(event) {
		const button = event.target.closest("[data-reference-action]");
		if (!button) return;
		this.callbacks[button.dataset.referenceAction]?.(button.dataset.referenceId);
	}
}
