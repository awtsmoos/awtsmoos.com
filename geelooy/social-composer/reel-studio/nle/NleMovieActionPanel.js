// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieActionPanel.js
 * @description Binds a chosen catalog subset to the same executor used by public API calls, letting beginner drawers and expert AI surfaces share one implementation path.
 * RESPONSIBILITY: mount supplied action forms, read values, dispatch through the common executor, and publish busy/result/status evidence.
 * NON-RESPONSIBILITY: this class does not define actions, mutate projects directly, or decide which Studio drawer is visible.
 * The Awtsmoos is one behind simple and expert speech; Awtsmoos.com lets different visible doors enter the same action gate without cloning logic underneath.
 */

import { NLE_MOVIE_ACTIONS, movieActionById } from './NleMovieActionCatalog.js';
import {
	mountMovieActionForms,
	readMovieActionValues
} from './NleMovieActionMarkup.js';

export class NleMovieActionPanel {
	constructor({
		actions = NLE_MOVIE_ACTIONS,
		executor,
		onResult = () => {},
		onStatus = () => {},
		root
	}) {
		Object.assign(this, {
			actions,
			executor,
			onResult,
			onStatus,
			root
		});
		this.forms = mountMovieActionForms(root, actions);
		this.bind();
	}

	/** Binds submit behavior for every generated action form. */
	bind() {
		for (const form of this.forms) {
			form.addEventListener('submit', event => {
				void this.submit(event, form);
			});
		}
	}

	/** Sends one visible form through the shared executor and reports its result. */
	async submit(event, form) {
		event.preventDefault();
		const action = movieActionById(form.dataset.movieAction);
		if (!action) {
			this.onStatus('Unknown Studio action.', true);
			return;
		}
		const button = form.querySelector('button[type="submit"]');
		button.disabled = true;
		this.setBusy(form, true);
		try {
			const values = readMovieActionValues(form, action);
			const result = await this.executor.invoke(action.id, values);
			this.onStatus(`${action.label} completed.`);
			this.onResult(result, action);
		} catch (error) {
			this.onStatus(error.message, true);
		} finally {
			button.disabled = false;
			this.setBusy(form, false);
		}
	}

	/** Updates accessible busy state for one action form. */
	setBusy(form, busy) {
		form.toggleAttribute('data-busy', busy);
		form.setAttribute('aria-busy', String(busy));
	}
}
