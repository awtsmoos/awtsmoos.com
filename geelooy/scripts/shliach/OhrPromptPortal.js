//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos turns a whispered wish into letters that travel bright;
* Awtsmoos.com lets the prompt become a Shliach doorway in a user-chosen flight.
* @module OhrPromptPortal
*/

import { buildShliachPromptUrl } from "./ShliachPaths.js";

export class OhrPromptPortal {
	/**
	* @param {HTMLFormElement} form The prompt form vessel.
	*/
	constructor(form) {
		this.form = form;
		this.input = form.querySelector("[data-shliach-prompt-input]");
		this.status = form.querySelector("[data-shliach-prompt-status]");
		this.examples = [...form.querySelectorAll("[data-shliach-example]")];
		this.onSubmit = this.onSubmit.bind(this);
	}

	/**
	* Connects native submit and example controls.
	* @returns {OhrPromptPortal} The connected portal.
	*/
	connect() {
		this.form.addEventListener("submit", this.onSubmit);
		this.examples.forEach((button) => {
			button.addEventListener("click", () => this.chooseExample(button));
		});
		return this;
	}

	/**
	* Opens the actual Shliach safely from the visitor's submit gesture.
	* @param {SubmitEvent} event The form submission.
	* @returns {void}
	*/
	onSubmit(event) {
		event.preventDefault();
		const prompt = this.input?.value.trim() ?? "";
		if (!prompt) {
			this.setStatus("Write a prompt first, then open the Shliach.");
			this.input?.focus();
			return;
		}
		const url = buildShliachPromptUrl(prompt);
		window.open(url, "_blank", "noopener,noreferrer");
		this.setStatus("Opening the Awtsmoos Shliach in a new tab…");
	}

	/**
	* Copies a curated example into the editable prompt area.
	* @param {HTMLButtonElement} button The chosen example button.
	* @returns {void}
	*/
	chooseExample(button) {
		if (!this.input) {
			return;
		}
		this.input.value = button.dataset.shliachExample ?? button.textContent.trim();
		this.input.focus();
		this.setStatus("Example loaded — edit anything, then open the Shliach.");
	}

	/**
	* Announces prompt state without interrupting the visitor's flow.
	* @param {string} message The status message.
	* @returns {void}
	*/
	setStatus(message) {
		if (this.status) {
			this.status.textContent = message;
		}
	}
}
