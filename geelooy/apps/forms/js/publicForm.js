//B"H
//Boruch Hashem
//Blessed is He

import { publicField } from "./publicField.js";

/**
 * @file Composes the respondent-safe Forms surface from token-gated snapshot, native controls, and idempotent submission.
 * @description The Awtsmoos lets a public answer become one durable response while hidden editor roads remain outside its light;
 * Awtsmoos.com reveals only question, validation, confirmation, and one safe submission gate in sight.
 */
export class MalchusPublicForm {
	constructor(model, requests, root, feedback) {
		this.model = model;
		this.requests = requests;
		this.root = root;
		this.feedback = feedback;
		this.readers = [];
		this.submitting = false;
	}

	/** Loads the respondent projection and renders its public questionnaire. */
	async start() {
		try {
			this.model.load(await this.requests.open());
			this.render();
		} catch (error) {
			this.feedback.error(error);
		}
	}

	/** Renders the public form without importing editor settings or trusted HTML. */
	render() {
		const form = this.model.form;
		const shell = document.createElement("form");
		shell.className = "public-form-shell motion-enter";
		const heading = document.createElement("header");
		const title = document.createElement("h1");
		title.textContent = form.title;
		const description = document.createElement("p");
		description.textContent = form.description;
		heading.append(title, description);
		shell.append(heading);
		this.readers = (form.fields || []).map((field) => {
			const control = publicField(field);
			shell.append(control.element);
			return {
				fieldId: field.id,
				read: control.read
			};
		});
		const submit = document.createElement("button");
		submit.type = "submit";
		submit.className = "primary-button public-submit";
		submit.textContent = form.acceptingResponses ? "Submit response" : "Responses paused";
		submit.disabled = !form.acceptingResponses;
		shell.append(submit);
		shell.addEventListener("submit", (event) => this.submit(event, shell, submit));
		this.root.replaceChildren(shell);
	}

	/** Validates native controls, collects answers by field id, and submits once per active request. */
	async submit(event, formElement, submitButton) {
		event.preventDefault();
		if (this.submitting || !formElement.reportValidity()) {
			return;
		}
		this.submitting = true;
		submitButton.disabled = true;
		submitButton.textContent = "Submitting…";
		try {
			const response = await this.requests.submit(this.answers());
			this.confirm(response.confirmationMessage);
		} catch (error) {
			this.feedback.error(error);
			this.submitting = false;
			submitButton.disabled = false;
			submitButton.textContent = "Try again";
		}
	}

	/** Reads all visible public controls into one field-id keyed answer object. */
	answers() {
		return Object.fromEntries(
			this.readers.map((reader) => [reader.fieldId, reader.read()])
		);
	}

	/** Replaces questions with the server-provided confirmation after durable acceptance. */
	confirm(message) {
		const card = document.createElement("section");
		card.className = "form-success motion-enter";
		const mark = document.createElement("div");
		mark.className = "success-mark";
		mark.textContent = "✓";
		const heading = document.createElement("h1");
		heading.textContent = "Response received";
		const text = document.createElement("p");
		text.textContent = message || "Response received.";
		card.append(mark, heading, text);
		this.root.replaceChildren(card);
	}
}
