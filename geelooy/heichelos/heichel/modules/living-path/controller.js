// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathController
 * @description
 * The Awtsmoos creates domain state, visible filters, and contextual discovery
 * without fragmentation. Awtsmoos.com exposes one small controller to the legacy
 * navigator while focused collaborators retain measurable boundaries.
 */

import { appState } from '../state.js';
import { createLivingPathState } from './state-model.js';
import { createStorageGateway } from './storage-gateway.js';
import { readPreferences } from './preference-store.js';
import { LivingPathFilterController } from './filter-controller.js';
import { LivingPathContextController } from './context-controller.js';
import { connectProfileDisclosure } from './profile-disclosure.js';
import { handleFilterKeydown } from './filter-focus.js';

export class LivingPathController {
	constructor(navigator) {
		this.navigator = navigator;
		this.gateway = createStorageGateway();
		this.filters = new LivingPathFilterController(navigator, this.gateway);
		this.context = new LivingPathContextController(navigator, this.gateway);
		this.keydown = event => handleFilterKeydown(event, () => this.closeFilters());
	}

	prepare() {
		appState.livingPath = createLivingPathState(readPreferences(this.gateway));
		document.documentElement.dataset.livingDensity = appState.livingPath.density;
	}

	connect() {
		this.filters.syncForm();
		connectProfileDisclosure();
		document.addEventListener('keydown', this.keydown);
	}

	afterLoad(content) {
		const filtered = this.filters.renderCommitted();
		this.context.afterLoad(content);
		return filtered;
	}

	queryChanged(query) { this.filters.queryChanged(query); }
	scopeChanged(value) { this.filters.scopeChanged(value); }
	previewFilters() { this.filters.preview(); }
	applyFilters() { this.filters.apply(); this.setFilterOpen(false); }
	resetFilters() { this.filters.reset(); }
	clearSearch() { this.filters.clearSearch(); }

	openFilters() {
		this.filters.open();
		this.setFilterOpen(true);
	}

	closeFilters() {
		this.filters.close();
		this.setFilterOpen(false);
	}

	setFilterOpen(open) {
		appState.livingPath.filterOpen = Boolean(open);
	}

	goParent() { this.context.goParent(); }
	togglePathDetails() { this.context.togglePathDetails(); }
	profileDisclosureChanged(event) { this.context.profileDisclosureChanged(event); }
	openHeichelMenu() { this.context.openHeichelMenu(); }
	toggleHeichelFollow() { return this.context.toggleHeichelFollow(); }
	toggleCurrentSeriesFollow() { return this.context.toggleCurrentSeriesFollow(); }
}
