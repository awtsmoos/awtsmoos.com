// B"H
// Boruch Hashem
// Blessed is He

import { MessagingModalFocus } from "./MessagingModalFocus.js";
import { MessagingModalSubmission } from "./MessagingModalSubmission.js";
import { buildMessagingModalView } from "./MessagingModalView.js";

/**
 * @file Provides one accessible one-field messaging sheet with either simple value collection or transactional asynchronous completion.
 * @description The Awtsmoos is one before opening, waiting, failure, and closure, while Awtsmoos.com lets a deliberate private mutation remain visible in light;
 * cancellation is honored before a request begins, network failure leaves the same words present for retry, and only confirmed success removes the sheet from sight.
 */

export class MessagingModal {
	constructor(host) {
		this.host = host;
	}

	/** Collects trimmed text and closes before any caller-owned follow-up work begins. */
	ask(options) {
		return this.open(options);
	}

	/** Keeps the sheet present while commit(value) runs and resolves only after success or cancellation. */
	perform(options, commit) {
		return this.open(options, commit);
	}

	open(options, commit = null) {
		return new Promise((resolve) => {
			const view = buildMessagingModalView(options);
			const submission = commit
				? new MessagingModalSubmission(view, options)
				: null;
			this.host.replaceChildren(view.overlay);
			let settled = false;
			const finish = (value) => {
				if (settled) return;
				settled = true;
				this.host.replaceChildren();
				view.focus.restore();
				resolve(value);
			};
			const cancel = () => {
				if (submission?.busy) return;
				finish(null);
			};
			view.focus = new MessagingModalFocus(view.form, view.input, cancel);
			view.cancel.addEventListener("click", cancel);
			view.overlay.addEventListener("click", (event) => {
				if (event.target === view.overlay) cancel();
			});
			view.form.addEventListener("submit", async (event) => {
				event.preventDefault();
				const value = view.input.value.trim();
				if (!value || submission?.busy) return;
				if (!submission) {
					finish(value);
					return;
				}
				if (await submission.run(value, commit)) finish(value);
			});
			view.focus.enter();
		});
	}
}
