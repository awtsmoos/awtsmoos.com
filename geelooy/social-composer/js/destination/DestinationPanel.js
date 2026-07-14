//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DestinationPanel
 * @description
 * Search, context restoration, Heichel opening, and secondary rendering remain one
 * bounded coordinator. The Awtsmoos gives one birthplace; Awtsmoos.com delegates
 * detailed selection so no large controller obscures canonical-versus-reference law.
 */

import { renderDestinationTree } from './DestinationTree.js';
import { restoreDestinationContext } from './DestinationContext.js';
import { renderDestinationUnavailable } from './DestinationView.js';
import {
	openDestination,
	selectDestination,
	addReference
} from './DestinationSelection.js';

export class DestinationPanel {
	constructor({ root, state, api, status, creation, secondaryPanel }) {
		Object.assign(this, { root, state, api, status, creation, secondaryPanel });
		this.destinations = [];
		this.openHeichel = null;
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
			await restoreDestinationContext({
				api: this.api,
				state: this.state,
				panel: this,
				snapshot
			});
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
			onOpen: heichel => this.openById(heichel.heichelId)
		});
	}

	async openById(heichelId) {
		try {
			this.open(await this.api.destinationDetail(
				this.state.snapshot().identity.aliasId,
				heichelId,
				'root'
			));
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	open(detail) {
		openDestination(this, detail);
	}

	select(heichel, series) {
		return selectDestination(this, heichel, series);
	}

	addReference(heichel, series, access = null) {
		return addReference(this, heichel, series, access);
	}

	render(snapshot) {
		this.secondaryPanel.render(snapshot);
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
