// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathContextController
 * @description
 * The Awtsmoos creates ancestry, memory, discovery, and custom study chambers as one truthful orientation;
 * Awtsmoos.com keeps navigation and follow-state distinct while the twelfth branch clears global chrome from dedicated Torah tools.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';
import { applyCustomPageMode } from '../ui/custom-page-mode.js?v=heichel-mobile-012';
import { readProgress } from './progress-store.js';
import { LivingPathContextFollowController } from './context-follow-controller.js?v=heichel-mobile-010';
import { renderPathSurfaces } from '../ui/render/living-path/path-renderer.js?v=heichel-mobile-010';
import {
	renderContinue,
	renderRelated,
	updateProfileContext
} from '../ui/render/living-path/discovery-renderer.js?v=heichel-mobile-010';

export class LivingPathContextController {
	constructor(navigator, gateway) {
		this.navigator = navigator;
		this.gateway = gateway;
		this.follow = new LivingPathContextFollowController();
	}

	afterLoad(content) {
		renderPathSurfaces(this.navigator, appState);
		renderContinue(readProgress(this.gateway, appState.heichelId));
		this.afterViewChange(content);
		applyCustomPageMode(appState.currentSeriesData);
		updateProfileContext(appState);
		void this.follow.sync();
	}

	afterViewChange(content = appState.currentContent) {
		renderRelated(content, this.navigator, appState.currentView);
		applyCustomPageMode(appState.currentSeriesData);
	}

	goParent() {
		const id = DOMElements.stickyParentButton?.dataset.seriesId;
		if (id) {
			void this.navigator.navigateTo(id);
		}
	}

	togglePathDetails() {
		if (!DOMElements.pathDetails) {
			return;
		}
		DOMElements.pathDetails.open = !DOMElements.pathDetails.open;
		if (DOMElements.pathDetails.open) {
			DOMElements.pathDetails.scrollIntoView({
				block: 'nearest'
			});
		}
	}

	profileDisclosureChanged(event) {
		appState.livingPath.profileDisclosureTouched = true;
		event.currentTarget.dataset.userOpened = String(event.currentTarget.open);
	}

	openHeichelMenu() {
		if (!DOMElements.profileDetails) {
			return;
		}
		DOMElements.profileDetails.open = true;
		DOMElements.profileDetails.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest'
		});
	}

	toggleHeichelFollow() {
		return this.follow.toggleHeichel();
	}

	toggleCurrentSeriesFollow() {
		return this.follow.toggleSeries();
	}
}
