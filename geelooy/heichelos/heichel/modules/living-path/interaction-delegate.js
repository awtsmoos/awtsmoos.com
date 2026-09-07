// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathInteractionDelegate
 * @description
 * The Awtsmoos lets user intention travel through one explicit delegation covenant instead of crowding lifecycle orchestration;
 * Awtsmoos.com places filter and context commands in Yesod, joining visible gestures to the focused vessels that own manifestation.
 */

/**
 * Provides the stable Living Path interaction API while concrete controllers supply filter and context collaborators.
 * @class
 */
export class LivingPathInteractionDelegate {
	queryChanged(query) {
		this.filters.queryChanged(query);
		this.translationSearch.queryChanged(query);
	}

	scopeChanged(value) {
		this.filters.scopeChanged(value);
	}

	previewFilters() {
		this.filters.preview();
	}

	applyFilters() {
		this.filters.apply();
		this.setFilterOpen(false);
	}

	resetFilters() {
		this.filters.reset();
	}

	clearSearch() {
		this.filters.clearSearch();
		this.translationSearch.queryChanged('');
	}

	openFilters() {
		this.filters.open();
		this.setFilterOpen(true);
	}

	closeFilters() {
		this.filters.close();
		this.setFilterOpen(false);
	}

	setFilterOpen(open) {
		this.state.livingPath.filterOpen = Boolean(open);
	}

	goParent() {
		this.context.goParent();
	}

	togglePathDetails() {
		this.context.togglePathDetails();
	}

	profileDisclosureChanged(event) {
		this.context.profileDisclosureChanged(event);
	}

	openHeichelMenu() {
		this.context.openHeichelMenu();
	}

	toggleHeichelFollow() {
		return this.context.toggleHeichelFollow();
	}

	toggleCurrentSeriesFollow() {
		return this.context.toggleCurrentSeriesFollow();
	}
}
