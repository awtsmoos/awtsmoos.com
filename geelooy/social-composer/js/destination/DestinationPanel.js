// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class DestinationPanel
 * @description
 * Search, defaults, context restoration, inspection, and creation handoff remain
 * one coordinator. The Awtsmoos gives one birthplace while Awtsmoos.com commits
 * only explicit destination choices.
 */

import { applyDefaultDestination } from './DefaultDestinationFlow.js';
import {
	destinationDetailFor,
	revealDestinationCreation
} from './DestinationPanelNavigation.js';
import { restoreDestinationContext } from './DestinationContext.js';
import {
	addReference,
	openDestination,
	selectDestination
} from './DestinationSelection.js';
import { renderDestinationTree } from './DestinationTree.js';
import { renderDestinationUnavailable } from './DestinationView.js';

export class DestinationPanel {
	constructor(options) {
		Object.assign(this, options);
		this.destinations = [];
		this.openHeichel = null;
		this.loadSequence = 0;
		this.createIntentConsumed = false;
		this.playlist.connect(this);
	}
	initialize() {
		this.creation.bind();
		this.element('destinationSearch').addEventListener('input', event => {
			clearTimeout(this.searchTimer);
			this.searchTimer = setTimeout(() => this.load(event.target.value), 180);
		});
	}
	async load(value = '') {
		const snapshot = this.state.snapshot();
		const aliasId = snapshot.identity.aliasId;
		const query = value === aliasId ? '' : value;
		if (!aliasId) {
			renderDestinationUnavailable(this.root, 'Choose an alias to browse destinations.');
			return;
		}
		// Loads race: an alias-change load (full list) and a debounced search
		// load (filtered) can both be in flight, and whichever answered last
		// used to win — a search could be overwritten by the unfiltered list
		// and appear to return unrelated Heichelos. Only the newest load may
		// render.
		const sequence = ++this.loadSequence;
		try {
			const destinations = await this.api.listDestinations(aliasId, query);
			if (sequence !== this.loadSequence) return;
			this.destinations = destinations;
			this.renderHeichelos();
			this.playlist.setDestinations(this.destinations);
			const restored = await restoreDestinationContext({
				api: this.api,
				state: this.state,
				panel: this,
				snapshot
			});
			if (sequence !== this.loadSequence) return;
			if (!restored && !query) await applyDefaultDestination(this, aliasId);
			if (!query) await this.consumeCreateIntent();
		} catch (error) {
			renderDestinationUnavailable(
				this.root,
				'Live destination search is unavailable; advanced IDs remain usable.'
			);
			console.warn('Destination search fallback:', error.message);
		}
	}
	/** Honors a one-time `?create=series|heichel` deep link (e.g. the Heichel
	 * page's owner "New series" action) once destinations are ready. */
	async consumeCreateIntent() {
		if (this.createIntentConsumed) return;
		const intent = this.state.context?.createIntent;
		if (intent !== 'series' && intent !== 'heichel') return;
		this.createIntentConsumed = true;
		if (intent === 'heichel') {
			await this.revealCreation('heichel');
			return;
		}
		const heichelId = this.state.snapshot().identity.heichelId
			|| this.state.context?.heichelId
			|| '';
		if (heichelId) await this.revealCreation('series', heichelId);
	}
	renderHeichelos() {
		renderDestinationTree({
			document: this.root,
			container: this.element('destinationResults'),
			destinations: this.destinations,
			onOpen: heichel => this.choose(heichel.heichelId, 'root', false)
		});
	}
	detailFor(heichelId, seriesId = 'root') {
		return destinationDetailFor(this, heichelId, seriesId);
	}
	async choose(heichelId, seriesId = 'root', select = true) {
		const detail = await this.detailFor(heichelId, seriesId);
		if (select) this.state.selectDestination(detail);
		this.open(detail);
		return detail;
	}
	open(detail) {
		openDestination(this, detail);
		this.playlist.setDetail(detail);
	}
	select(heichel, series) {
		return selectDestination(this, heichel, series);
	}
	addReference(heichel, series, access = null) {
		return addReference(this, heichel, series, access);
	}
	reveal() {
		const panel = this.root.querySelector('.destinationPanel');
		if (!panel) return;
		panel.open = true;
		panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	revealCreation(kind, heichelId = '') {
		return revealDestinationCreation(this, kind, heichelId);
	}
	render(snapshot) {
		this.secondaryPanel.render(snapshot);
		this.playlist.render(snapshot);
	}
	element(id) {
		return this.root.getElementById(id);
	}
}
