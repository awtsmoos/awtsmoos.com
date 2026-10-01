// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives one search vessel to Torah and every verified Awtsmoos world.

export class SearchController {
	constructor(formElement, options = {}) {
		this.formElement = formElement;
		this.inputElement = formElement.querySelector("textarea[name='q'], input[name='q']");
		this.buttonElement = formElement.querySelector("button[type='submit']");
		this.labelElement = this.buttonElement?.querySelector(".search-button-label");
		this.history = options.history;
		this.omnibox = options.omnibox;
	}

	connect() {
		this.formElement.addEventListener("submit", event => this.handleSubmit(event));
		this.inputElement?.addEventListener("input", () => this.handleInput());
		this.inputElement?.addEventListener("keydown", event => this.handleKeydown(event));
		this.resize();
		return this;
	}

	handleInput() {
		this.clearInvalidState();
		this.resize();
		this.formElement.classList.toggle("has-query", Boolean(this.inputElement?.value.trim()));
	}

	handleKeydown(event) {
		if (event.key !== "Enter" || event.isComposing) return;
		const isMobile = matchMedia("(pointer: coarse)").matches || innerWidth <= 760;
		if (isMobile) return;
		if (event.shiftKey) return;
		event.preventDefault();
		this.formElement.requestSubmit();
	}

	resize() {
		if (!this.inputElement || this.inputElement.tagName !== "TEXTAREA") return;
		this.inputElement.style.height = "auto";
		this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 144) + "px";
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
		if (this.buttonElement) this.buttonElement.disabled = isBusy;
		if (this.labelElement) this.labelElement.textContent = isBusy ? "Opening" : "Search";
	}
}
