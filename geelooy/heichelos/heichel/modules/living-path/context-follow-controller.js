// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathContextFollowController
 * @description
 * The Awtsmoos lets following become one focused vessel beside navigation instead of crowding the whole contextual sea;
 * Awtsmoos.com keeps Heichel and series allegiance explicit, while a failed network ray leaves the visible path free.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';
import {
	readFollowState,
	toggleFollow
} from './follow-service.js';
import { notify } from '../ui/render/toast.js';

/** Coordinates Heichel and series follow state without owning path rendering. */
export class LivingPathContextFollowController {
	async toggleHeichel() {
		try {
			const active = await toggleFollow(
				window.curAlias,
				'heichel',
				appState.heichelId
			);
			this.paint(active);
			notify(
				active ? 'Heichel followed.' : 'Heichel unfollowed.',
				'success'
			);
		} catch (error) {
			notify(error.message, 'error');
		}
	}

	async toggleSeries() {
		try {
			const target = `${appState.heichelId}/${appState.currentSeries}`;
			const active = await toggleFollow(
				window.curAlias,
				'series',
				target
			);
			this.paintSeries(active);
			notify(
				active ? 'Series followed.' : 'Series unfollowed.',
				'success'
			);
		} catch (error) {
			notify(error.message, 'error');
		}
	}

	async sync() {
		try {
			const active = await readFollowState(
				window.curAlias,
				'heichel',
				appState.heichelId
			);
			this.paint(active);
		} catch {
			this.paint(false);
		}
		try {
			const target = `${appState.heichelId}/${appState.currentSeries}`;
			const seriesActive = await readFollowState(
				window.curAlias,
				'series',
				target
			);
			this.paintSeries(seriesActive);
		} catch {
			this.paintSeries(false);
		}
	}

	paint(active) {
		const button = this.liveHeichelButton();
		if (!button) {
			return;
		}
		button.textContent = active ? 'Following' : 'Follow';
		button.setAttribute('aria-pressed', String(active));
	}

	paintSeries(active) {
		document
			.querySelectorAll('[data-follow-series-button]')
			.forEach(button => {
				button.textContent = active ? 'Following series' : 'Follow series';
				button.setAttribute('aria-pressed', String(active));
			});
	}

	/**
	 * The registry entry can point at a node from an earlier render that
	 * is no longer in the document; painting that node changes nothing
	 * the visitor can see. Prefer the registry node only while it is
	 * connected, otherwise resolve the live header button from the DOM.
	 */
	liveHeichelButton() {
		const registered = DOMElements.heichelFollowButton;
		if (registered && document.contains(registered)) return registered;
		return document.querySelector(
			'[data-heichel-profile] .heichel-profile-action--primary'
		);
	}
}
