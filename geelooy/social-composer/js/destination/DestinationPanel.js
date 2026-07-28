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
		try {
			this.destinations = await this.api.listDestinations(aliasId, query);
			this.renderHeichelos();
			this.playlist.setDestinations(this.destinations);
			const restored = await restoreDestinationContext({
				api: this.api,
				state: this.state,
				panel: this,
				snapshot
			});
			if (!restored && !query) await applyDefaultDestination(this, aliasId);
		} catch (error) {
			renderDestinationUnavailable(
				this.root,
				'Live destination search is unavailable; advanced IDs remain usable.'
			);
			console.warn('Destination search fallback:', error.message);
		}
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
