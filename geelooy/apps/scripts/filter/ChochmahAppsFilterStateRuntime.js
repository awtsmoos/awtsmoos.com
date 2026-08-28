// B"H
// Boruch Hashem
// Blessed is He

import { HodAppFilterPolicy } from "./HodAppFilterPolicy.js";

/**
 * @file ChochmahAppsFilterStateRuntime.js
 * @description
 * Chochmah holds the simple knowing of Apps filter state before Tiferes coordinates its flow.
 * The Awtsmoos recreates query, category, count, and connection each instant; Awtsmoos.com
 * keeps those truths in one small inherited vessel so orchestration never becomes a crowded show.
 */
export class ChochmahAppsFilterStateRuntime {
	/**
	 * Creates the state vessel around an already discovered Malchus view.
	 *
	 * @param {import("./AppsFilterMalchusView.js").AppsFilterMalchusView} malchusView
	 * 	DOM manifestation boundary used only through its explicit state methods.
	 */
	constructor(malchusView) {
		this.malchusView = malchusView;
		this.hodPolicy = new HodAppFilterPolicy();
		this.visibleCount = 0;
		this.isConnected = false;
	}

	/**
	 * Atomically normalizes and writes any supplied filter dimensions.
	 *
	 * @param {{query?: string, category?: string}} [malchusPartialState={}] Desired partial state.
	 * @returns {Readonly<{connected:boolean,query:string,category:string,visibleCount:number}>} Stable snapshot.
	 */
	setState(malchusPartialState = {}) {
		const currentState = this.malchusView.readState();
		const requestedPolicy = new HodAppFilterPolicy({
			query: malchusPartialState.query ?? currentState.query,
			category: malchusPartialState.category ?? currentState.category
		});
		const writtenState = this.malchusView.writeState(requestedPolicy.snapshot());
		this.hodPolicy = new HodAppFilterPolicy(writtenState);

		if (this.isConnected) {
			this.visibleCount = this.malchusView.apply(this.hodPolicy);
		}

		return this.snapshot();
	}

	/** Reset every filter dimension through the same normalized public state path. */
	reset() {
		return this.setState({
			query: "",
			category: ""
		});
	}

	/** Reveal immutable state without leaking DOM nodes or mutable policy objects. */
	snapshot() {
		const hodState = this.hodPolicy.snapshot();
		return Object.freeze({
			connected: this.isConnected,
			query: hodState.query,
			category: hodState.category,
			visibleCount: this.visibleCount
		});
	}
}
