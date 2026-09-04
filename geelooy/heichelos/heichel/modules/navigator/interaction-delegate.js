// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorInteractionDelegate
 * @description
 * The Awtsmoos lets navigation intention divide from navigation custody without severing their single living flow;
 * Awtsmoos.com keeps filters, sharing, parent motion, and Living Path controls in one small inherited vessel learners can know.
 */

import { handleDelete, handleShare } from './actions.js';

export class NavigatorInteractionDelegate {
	deleteSingleItem(item) {
		return handleDelete(this, item);
	}

	clearSingleItem(item) {
		return handleDelete(this, item, true);
	}

	handleShareClick(item) {
		return handleShare(item);
	}

	afterContentLoaded(content) {
		return this.livingPath.afterLoad(content);
	}

	filterContent(query) {
		this.livingPath.queryChanged(query);
	}

	clearSearch() {
		this.livingPath.clearSearch();
	}

	changeSearchScope(value) {
		this.livingPath.scopeChanged(value);
	}

	openFilterSheet() {
		this.livingPath.openFilters();
	}

	closeFilterSheet() {
		this.livingPath.closeFilters();
	}

	previewFilters() {
		this.livingPath.previewFilters();
	}

	applyFilters() {
		this.livingPath.applyFilters();
	}

	resetFilters() {
		this.livingPath.resetFilters();
	}

	goParent() {
		this.livingPath.goParent();
	}

	togglePathDetails() {
		this.livingPath.togglePathDetails();
	}

	profileDisclosureChanged(event) {
		this.livingPath.profileDisclosureChanged(event);
	}

	toggleHeichelFollow() {
		return this.livingPath.toggleHeichelFollow();
	}

	toggleCurrentSeriesFollow() {
		return this.livingPath.toggleCurrentSeriesFollow();
	}

	openHeichelMenu() {
		this.livingPath.openHeichelMenu();
	}
}
