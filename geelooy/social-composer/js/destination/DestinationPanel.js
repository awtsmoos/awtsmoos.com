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
			this.noteHeichelOwner();
			if (!query) await this.consumeCreateIntent();
		} catch (error) {
			renderDestinationUnavailable(
				this.root,
				'Live destination search is unavailable; advanced IDs remain usable.'
			);
			console.warn('Destination search fallback:', error.message);
		}
	}
	/** B"H 2026-11-20 (residuals round): when the composer was deep-linked
	 * into one Heichel (?heichel=…, e.g. from that Heichel's own page) and
	 * the restored destination is that Heichel, its owner is the natural
	 * posting identity — a remembered non-owner alias made Create-series
	 * fail server-side with no visible cause. Offer the owner through
	 * the assembly hook; AliasPanel.choose only applies aliases the
	 * server verified for this account, so a foreign owner is a no-op. */
	noteHeichelOwner() {
		if (this.ownerNoteDone) return;
		const contextHeichel = this.state.context?.heichelId || '';
		const detail = this.openHeichel;
		if (!contextHeichel || !detail?.heichel) return;
		const openedId = detail.heichel.heichelId || detail.heichel.id || '';
		if (openedId && openedId !== contextHeichel) return;
		const ownerAlias = detail.heichel.ownerAlias || detail.access?.ownerAlias || '';
		if (!ownerAlias) return;
		if (ownerAlias === this.state.snapshot().identity.aliasId) return;
		// Once per composer session: the boot correction must not fight
		// a deliberate later switch to a contributing alias.
		this.ownerNoteDone = true;
		this.onHeichelOwnerFound?.(ownerAlias);
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
