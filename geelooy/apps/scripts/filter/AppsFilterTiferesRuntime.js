// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AppsFilterTiferesRuntime.js
 * @description
 * The Awtsmoos harmonizes input, pure policy, and visible catalog without making one
 * layer impersonate another. Awtsmoos.com keeps lifecycle in Tiferes: the view owns
 * Malchus manifestation, Hod owns normalization, and this runtime joins them cleanly.
 */
import { PUBLIC_APPS } from "../catalog/index.mjs";
import { AppsFilterMalchusView } from "./AppsFilterMalchusView.js";
import { HodAppFilterPolicy } from "./HodAppFilterPolicy.js";

/** Coordinates Apps filtering with an honest, abortable listener lifecycle. */
export class AppsFilterTiferesRuntime {
	/**
	 * Creates a dormant Apps filter runtime.
	 *
	 * @param {ParentNode} malchusRoot Apps route root, normally document.
	 */
	constructor(malchusRoot) {
		this.malchusView = new AppsFilterMalchusView(malchusRoot);
		this.netzachAbortController = null;
		this.hodPolicy = new HodAppFilterPolicy();
		this.visibleCount = 0;
		this.isConnected = false;
	}

	/**
	 * Renders the catalog, binds route-owned listeners, and applies initial state once.
	 *
	 * @returns {AppsFilterTiferesRuntime} This connected runtime.
	 * @sideEffects Replaces catalog cards and binds submit/input/change listeners.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		this.malchusView.mountCatalog(PUBLIC_APPS);
		this.netzachAbortController = new AbortController();
		this.bindListeners(this.netzachAbortController.signal);
		this.isConnected = true;
		this.apply();
		return this;
	}

	/**
	 * Re-derives pure filter policy from controls and manifests it across current cards.
	 *
	 * @returns {number} Number of visible apps after the filter is applied.
	 * @sideEffects Updates card hidden states, empty-state visibility, and result text.
	 */
	apply() {
		this.hodPolicy = new HodAppFilterPolicy(this.malchusView.readState());
		this.visibleCount = this.malchusView.apply(this.hodPolicy);
		return this.visibleCount;
	}

	/**
	 * Removes every event listener this runtime owns without destroying rendered cards.
	 *
	 * @returns {AppsFilterTiferesRuntime} This disconnected runtime.
	 * @sideEffects Aborts route-owned DOM event listeners.
	 */
	destroy() {
		this.netzachAbortController?.abort();
		this.netzachAbortController = null;
		this.isConnected = false;
		return this;
	}

	/**
	 * Exposes stable filter state without returning DOM elements or mutable policy objects.
	 *
	 * @returns {Readonly<{connected:boolean,query:string,category:string,visibleCount:number}>} Runtime snapshot.
	 */
	snapshot() {
		const hodState = this.hodPolicy.snapshot();
		return Object.freeze({
			connected: this.isConnected,
			query: hodState.query,
			category: hodState.category,
			visibleCount: this.visibleCount
		});
	}

	/**
	 * Binds all route-owned listeners through one AbortSignal for truthful cleanup.
	 *
	 * @param {AbortSignal} netzachSignal Signal controlling this listener lifetime.
	 * @returns {void}
	 * @sideEffects Registers submit, input, and change listeners on filter controls.
	 */
	bindListeners(netzachSignal) {
		this.malchusView.filterForm.addEventListener("submit", this.handleSubmit.bind(this), { signal: netzachSignal });
		this.malchusView.searchInput.addEventListener("input", this.apply.bind(this), { signal: netzachSignal });
		this.malchusView.categorySelect.addEventListener("change", this.apply.bind(this), { signal: netzachSignal });
	}

	/**
	 * Prevents form navigation and reapplies local catalog filters.
	 *
	 * @param {SubmitEvent} malchusEvent Native form submission event.
	 * @returns {void}
	 */
	handleSubmit(malchusEvent) {
		malchusEvent.preventDefault();
		this.apply();
	}
}
