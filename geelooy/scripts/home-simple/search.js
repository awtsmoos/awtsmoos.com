// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives every search submission a visible state and an exact, encoded path into the living library.

export class SearchController {
	constructor(formElement) {
		this.formElement = formElement;
		this.inputElement = formElement.querySelector("input[type='search']");
		this.buttonElement = formElement.querySelector("button[type='submit']");
		this.labelElement = this.buttonElement?.querySelector(".search-button-label");
	}

	connect() {
		document.addEventListener("keydown", event => this.handleShortcut(event));
		this.formElement.addEventListener("submit", event => this.handleSubmit(event));
		this.inputElement?.addEventListener("input", () => this.clearInvalidState());
	}

	handleShortcut(event) {
		const target = event.target;
		const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
		if (event.key === "/" && !isTyping) {
			event.preventDefault();
			this.inputElement?.focus();
		}
		if (event.key === "Escape" && target === this.inputElement) this.inputElement.blur();
	}

	handleSubmit(event) {
		event.preventDefault();
		const query = this.inputElement?.value.trim() || "";
		if (!query) {
			this.showInvalidState();
			return;
		}
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
		if (this.buttonElement) this.buttonElement.disabled = isBusy;
		if (this.labelElement) this.labelElement.textContent = isBusy ? "Opening" : "Search";
	}
}
