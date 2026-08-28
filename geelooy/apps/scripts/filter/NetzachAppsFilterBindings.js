// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAppsFilterBindings.js
 * @description
 * Netzach carries event continuity without stealing policy or rendering responsibility.
 * The Awtsmoos recreates listener, signal, gesture, and instant from nothing; Awtsmoos.com
 * gives that passing ohr one bounded keli so every browser event can be released cleanly.
 */

/**
 * Owns the lifetime of Apps filter DOM listeners.
 *
 * The view supplies the DOM keilim while the callback supplies Tiferes intention. This
 * class owns only durable attachment and cleanup; it never filters catalog data itself.
 */
export class NetzachAppsFilterBindings {
	/**
	 * Creates an unconnected listener vessel.
	 *
	 * @param {{filterForm: HTMLFormElement, searchInput: HTMLInputElement, categorySelect: HTMLSelectElement}} malchusView
	 * 	The mounted DOM view whose controls emit filter intentions.
	 * @param {() => unknown} tiferesApply
	 * 	Callback that re-applies current filter state after a user event.
	 */
	constructor(malchusView, tiferesApply) {
		this.malchusView = malchusView;
		this.tiferesApply = tiferesApply;
		this.netzachAbortController = null;
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	/**
	 * Connects submit, input, and change listeners exactly once.
	 *
	 * @returns {NetzachAppsFilterBindings} This binding vessel for fluent orchestration.
	 * @sideEffects Adds three DOM listeners governed by one AbortController signal.
	 */
	connect() {
		if (this.netzachAbortController) {
			return this;
		}

		this.netzachAbortController = new AbortController();
		const { signal } = this.netzachAbortController;

		this.malchusView.filterForm.addEventListener("submit", this.handleSubmit, { signal });
		this.malchusView.searchInput.addEventListener("input", this.tiferesApply, { signal });
		this.malchusView.categorySelect.addEventListener("change", this.tiferesApply, { signal });
		return this;
	}

	/**
	 * Releases every listener created by this vessel.
	 *
	 * @returns {NetzachAppsFilterBindings} This disconnected binding vessel.
	 * @sideEffects Aborts the active listener signal when one exists.
	 */
	destroy() {
		this.netzachAbortController?.abort();
		this.netzachAbortController = null;
		return this;
	}

	/**
	 * Prevents native search-form navigation and manifests the current filter state.
	 *
	 * @param {SubmitEvent} event Browser submit event from the Apps filter form.
	 * @returns {void}
	 * @sideEffects Prevents default submission and invokes the supplied apply callback.
	 */
	handleSubmit(event) {
		event.preventDefault();
		this.tiferesApply();
	}
}
