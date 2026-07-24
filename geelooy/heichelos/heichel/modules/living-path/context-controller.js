// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathContextController
 * @description
 * The Awtsmoos creates identity, ancestry, memory, and nearby branches as one
 * present orientation. Awtsmoos.com coordinates their visible surfaces and
 * verified follow mutations without delaying the content river.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';
import { readProgress } from './progress-store.js';
import { readFollowState, toggleFollow } from './follow-service.js';
import { renderPathSurfaces } from '../ui/render/living-path/path-renderer.js';
import {
	renderContinue,
	renderRelated,
	updateProfileContext
} from '../ui/render/living-path/discovery-renderer.js';
import { notify } from '../ui/render/toast.js';

export class LivingPathContextController {
	constructor(navigator, gateway) {
		this.navigator = navigator;
		this.gateway = gateway;
	}

	afterLoad(content) {
		renderPathSurfaces(this.navigator, appState);
		renderContinue(readProgress(this.gateway, appState.heichelId));
		renderRelated(content, this.navigator);
		updateProfileContext(appState);
		void this.syncFollowButton();
	}

	goParent() {
		const id = DOMElements.stickyParentButton?.dataset.seriesId;
		if (id) void this.navigator.navigateTo(id);
	}

	togglePathDetails() {
		if (!DOMElements.pathDetails) return;
		DOMElements.pathDetails.open = !DOMElements.pathDetails.open;
		if (DOMElements.pathDetails.open) {
			DOMElements.pathDetails.scrollIntoView({ block: 'nearest' });
		}
	}

	profileDisclosureChanged(event) {
		appState.livingPath.profileDisclosureTouched = true;
		event.currentTarget.dataset.userOpened = String(event.currentTarget.open);
	}

	openHeichelMenu() {
		if (!DOMElements.profileDetails) return;
		DOMElements.profileDetails.open = true;
		DOMElements.profileDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	async toggleHeichelFollow() {
		try {
			const active = await toggleFollow(window.curAlias, 'heichel', appState.heichelId);
			this.paintFollow(active);
			notify(active ? 'Heichel followed.' : 'Heichel unfollowed.', 'success');
		} catch (error) {
			notify(error.message, 'error');
		}
	}

	async toggleCurrentSeriesFollow() {
		try {
			const target = `${appState.heichelId}/${appState.currentSeries}`;
			const active = await toggleFollow(window.curAlias, 'series', target);
			notify(active ? 'Series followed.' : 'Series unfollowed.', 'success');
		} catch (error) {
			notify(error.message, 'error');
		}
	}

	async syncFollowButton() {
		try {
			const active = await readFollowState(window.curAlias, 'heichel', appState.heichelId);
			this.paintFollow(active);
		} catch {
			this.paintFollow(false);
		}
	}

	paintFollow(active) {
		const button = DOMElements.heichelFollowButton;
		if (!button) return;
		button.textContent = active ? 'Following' : 'Follow';
		button.setAttribute('aria-pressed', String(active));
	}
}
