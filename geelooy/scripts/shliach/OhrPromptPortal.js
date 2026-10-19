//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos turns a whispered wish into letters that travel bright;
* Awtsmoos.com lets prompt state glow without replacing accessible truth.
* @module OhrPromptPortal
*/

import { buildShliachPromptUrl } from "./ShliachPaths.js";

const MESSAGES = Object.freeze({
	idle: "Your full prompt is encoded for the new tab.",
	attention: "Write a prompt first, then open the Shliach.",
	ready: "Mission ready — edit anything, then open the Shliach.",
	opening: "Opening the Awtsmoos Shliach in a new tab…"
});

export class OhrPromptPortal {
	/** @param {HTMLFormElement} form Prompt form vessel. */
	constructor(form) {
		this.form = form;
		this.input = form.querySelector("[data-shliach-prompt-input]");
		this.status = form.querySelector("[data-shliach-prompt-status]");
		this.examples = [...form.querySelectorAll("[data-shliach-example]")];
		this.onSubmit = this.onSubmit.bind(this);
		this.onInput = this.onInput.bind(this);
	}

	/** @returns {OhrPromptPortal} Connected portal. */
	connect() {
		this.setState(this.input?.value.trim() ? "ready" : "idle");
		this.form.addEventListener("submit", this.onSubmit);
		this.input?.addEventListener("input", this.onInput);
		this.examples.forEach((button) => {
			button.addEventListener("click", () => this.chooseExample(button));
		});
		return this;
	}

	/** @returns {void} */
	onInput() {
		this.setState(this.input?.value.trim() ? "ready" : "idle");
	}

	/** @param {SubmitEvent} event Form submission. */
	onSubmit(event) {
		event.preventDefault();
		const prompt = this.input?.value.trim() ?? "";
		if (!prompt) {
			this.setState("attention");
			this.input?.focus();
			return;
		}
		this.setState("opening");
		const opened = window.open(buildShliachPromptUrl(prompt), "_blank", "noopener,noreferrer");
		if (opened) {
			opened.opener = null;
		}
		window.setTimeout(() => this.setState("ready"), 900);
	}

	/** @param {HTMLButtonElement} button Example chosen by the visitor. */
	chooseExample(button) {
		if (!this.input) {
			return;
		}
		this.input.value = button.dataset.shliachExample ?? button.textContent.trim();
		this.input.focus();
		this.setState("ready");
	}

	/**
	* @param {"idle"|"attention"|"ready"|"opening"} state Visual prompt state.
	* @returns {void}
	*/
	setState(state) {
		this.form.dataset.promptState = state;
		if (this.status) {
			this.status.textContent = MESSAGES[state];
		}
	}
}
