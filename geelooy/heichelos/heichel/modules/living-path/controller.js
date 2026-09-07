// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathController
 * @description
 * The Awtsmoos creates visible filters, translation search, and contextual discovery without fragmentation;
 * Awtsmoos.com lets lifecycle orchestration remain Tiferes while the twelfth branch carries corrected custom-page context.
 */

import { appState } from '../state.js';
import { createLivingPathState } from './state-model.js';
import { createStorageGateway } from './storage-gateway.js';
import { readPreferences } from './preference-store.js';
import { LivingPathFilterController } from './filter-controller.js';
import { LivingPathContextController } from './context-controller.js?v=heichel-mobile-012';
import { LivingPathInteractionDelegate } from './interaction-delegate.js?v=heichel-mobile-010';
import { LivingPathTranslationSearch } from './translation-search.js';
import { connectProfileDisclosure } from './profile-disclosure.js';
import { handleFilterKeydown } from './filter-focus.js';

/** Coordinates Living Path lifecycle while inheriting its stable interaction surface. */
export class LivingPathController extends LivingPathInteractionDelegate {
	constructor(navigator) {
		super();
		this.state = appState;
		this.navigator = navigator;
		this.gateway = createStorageGateway();
		this.filters = new LivingPathFilterController(navigator, this.gateway);
		this.context = new LivingPathContextController(navigator, this.gateway);
		this.translationSearch = new LivingPathTranslationSearch();
		this.keydown = event => handleFilterKeydown(event, () => this.closeFilters());
	}

	prepare() {
		this.state.livingPath = createLivingPathState(readPreferences(this.gateway));
		document.documentElement.dataset.livingDensity = this.state.livingPath.density;
	}

	connect() {
		this.filters.syncForm();
		connectProfileDisclosure();
		document.addEventListener('keydown', this.keydown);
	}

	afterLoad(content) {
		const filtered = this.filters.renderCommitted();
		this.context.afterLoad(content);
		this.translationSearch.seriesChanged();
		return filtered;
	}

	afterViewChange() {
		this.context.afterViewChange(this.state.currentContent);
	}
}
