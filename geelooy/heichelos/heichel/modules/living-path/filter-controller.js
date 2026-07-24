// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterController
 * @description
 * The Awtsmoos creates query, draft, commitment, and visible result together.
 * Awtsmoos.com sequences them explicitly: live search repaints immediately,
 * filter choices preview safely, and only Apply persists a new browse covenant.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';
import { renderContentGrids } from '../ui/render/grids.js';
import { activeFilterCount, filterLoadedContent, visibleCounts } from './filter-policy.js';
import { createFilterState } from './state-model.js';
import { writePreferences } from './preference-store.js';
import {
	applyDensity,
	closeFilterSheet,
	openFilterSheet,
	readFilterDraft,
	updateFilterButton,
	updatePreviewCount,
	writeFilterDraft
} from './filter-form.js';
import { updateResultStatus } from '../ui/render/living-path/discovery-renderer.js';

export class LivingPathFilterController {
	constructor(navigator, gateway) {
		this.navigator = navigator;
		this.gateway = gateway;
	}

	syncForm() {
		const path = appState.livingPath;
		writeFilterDraft(path.committedFilters, path.density);
		if (DOMElements.searchScopeSelect) DOMElements.searchScopeSelect.value = path.searchScope;
		if (DOMElements.searchInput) DOMElements.searchInput.value = path.query;
		applyDensity(path.density);
		updateFilterButton(activeFilterCount(path.committedFilters));
	}

	queryChanged(query) {
		appState.livingPath.query = String(query || '');
		this.renderCommitted();
	}

	scopeChanged(value) {
		appState.livingPath.searchScope = value === 'currentView' ? 'currentView' : 'branch';
		writePreferences(this.gateway, appState.livingPath);
		this.renderCommitted();
	}

	open() {
		appState.livingPath.draftFilters = createFilterState(appState.livingPath.committedFilters);
		writeFilterDraft(appState.livingPath.draftFilters, appState.livingPath.density);
		this.preview();
		openFilterSheet();
	}

	close() {
		closeFilterSheet();
	}

	preview() {
		const filters = readFilterDraft();
		appState.livingPath.draftFilters = filters;
		const filtered = this.filter(filters);
		updatePreviewCount(countForView(visibleCounts(filtered), appState.currentView));
	}

	apply() {
		appState.livingPath.committedFilters = readFilterDraft();
		appState.livingPath.density = applyDensity(DOMElements.densitySelect?.value);
		writePreferences(this.gateway, appState.livingPath);
		this.renderCommitted();
		closeFilterSheet();
	}

	reset() {
		appState.livingPath.committedFilters = createFilterState();
		appState.livingPath.draftFilters = createFilterState();
		appState.livingPath.density = 'comfortable';
		writeFilterDraft(appState.livingPath.draftFilters, appState.livingPath.density);
		writePreferences(this.gateway, appState.livingPath);
		this.renderCommitted();
		this.preview();
	}

	clearSearch() {
		appState.livingPath.query = '';
		if (DOMElements.searchInput) DOMElements.searchInput.value = '';
		this.renderCommitted();
	}

	renderCommitted() {
		const filtered = this.filter(appState.livingPath.committedFilters);
		const counts = visibleCounts(filtered);
		appState.livingPath.visibleCounts = counts;
		renderContentGrids(filtered, this.navigator, appState);
		updateResultStatus(counts, appState);
		updateFilterButton(activeFilterCount(appState.livingPath.committedFilters));
		return filtered;
	}

	filter(filters) {
		return filterLoadedContent(appState.currentContent, {
			query: appState.livingPath.query,
			searchScope: appState.livingPath.searchScope,
			currentView: appState.currentView,
			filters
		});
	}
}

function countForView(counts, view) {
	return counts?.[view] || 0;
}
