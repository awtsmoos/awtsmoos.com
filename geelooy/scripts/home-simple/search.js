// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos preserves the native Torah form beneath every enhancement, recording only a bounded question before opening the living library.

export class SearchController {
	constructor(formElement, options = {}) {
		this.formElement = formElement;
		this.inputElement = formElement.querySelector("input[type='search']");
		this.buttonElement = formElement.querySelector("button[type='submit']");
		this.labelElement = this.buttonElement?.querySelector(".search-button-label");
		this.history = options.history;
		this.omnibox = options.omnibox;
	}

	connect() {
		this.formElement.addEventListener("submit", event => this.handleSubmit(event));
		this.inputElement?.addEventListener("input", () => this.clearInvalidState());
		return this;
	}

	handleSubmit(event) {
		event.preventDefault();
		const query = this.inputElement?.value.trim() ?? "";

		if (!query) {
			this.showInvalidState();
			return;
		}

		this.history?.recordQuery(query);
		this.omnibox?.close();
		this.setBusy(true);
		const destination = new URL(this.formElement.action, location.origin);
		destination.searchParams.set("q", query);
		location.assign(destination.toString());
	}

	showInvalidState() {
		this.formElement.classList.add("is-invalid");
		this.inputElement?.setAttribute("aria-invalid", "true");
		this.inputElement?.focus();
	}

	clearInvalidState() {
		this.formElement.classList.remove("is-invalid");
		this.inputElement?.removeAttribute("aria-invalid");
	}

	setBusy(isBusy) {
		this.formElement.classList.toggle("is-searching", isBusy);
		this.formElement.setAttribute("aria-busy", String(isBusy));

		if (this.buttonElement) {
			this.buttonElement.disabled = isBusy;
		}

		if (this.labelElement) {
			this.labelElement.textContent = isBusy ? "Opening" : "Search";
		}
	}
}
