// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives the searching heart a quiet key, one stroke that opens possibility.

export class SearchController {
	constructor(formElement) {
		this.formElement = formElement;
		this.inputElement = formElement.querySelector("input[type='search']");
	}

	connect() {
		document.addEventListener("keydown", event => this.handleShortcut(event));
		this.formElement.addEventListener("submit", event => this.handleSubmit(event));
	}

	handleShortcut(event) {
		const target = event.target;
		const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

		if (event.key === "/" && !isTyping) {
			event.preventDefault();
			this.inputElement?.focus();
		}

		if (event.key === "Escape" && target === this.inputElement) {
			this.inputElement.blur();
		}
	}

	handleSubmit(event) {
		if (!this.inputElement?.value.trim()) {
			event.preventDefault();
			this.inputElement?.focus();
		}
	}
}
