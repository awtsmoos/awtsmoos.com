// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleMovieActionPanel
 * @description
 * Human submissions enter the same executor as public API calls; results and errors
 * return through explicit callbacks without creating a second implementation path.
 */

import { movieActionById } from './NleMovieActionCatalog.js';
import {
	mountMovieActionForms,
	readMovieActionValues
} from './NleMovieActionMarkup.js';

export class NleMovieActionPanel {
	constructor({ executor, onResult, onStatus, root }) {
		Object.assign(this, { executor, onResult, onStatus, root });
		this.forms = mountMovieActionForms(root);
		this.bind();
	}

	bind() {
		for (const form of this.forms) {
			form.addEventListener('submit', event => void this.submit(event, form));
		}
	}

	async submit(event, form) {
		event.preventDefault();
		const action = movieActionById(form.dataset.movieAction);
		const button = form.querySelector('button[type="submit"]');
		button.disabled = true;
		this.setBusy(form, true);
		try {
			const result = await this.executor.invoke(action.id, readMovieActionValues(form, action));
			this.onStatus(`${action.label} completed.`);
			this.onResult(result, action);
		} catch (error) {
			this.onStatus(error.message, true);
		} finally {
			button.disabled = false;
			this.setBusy(form, false);
		}
	}

	setBusy(form, busy) {
		form.toggleAttribute('data-busy', busy);
		form.setAttribute('aria-busy', String(busy));
	}
}
