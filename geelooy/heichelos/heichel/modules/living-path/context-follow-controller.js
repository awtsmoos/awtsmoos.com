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
	}

	paint(active) {
		const button = DOMElements.heichelFollowButton;
		if (!button) {
			return;
		}
		button.textContent = active ? 'Following' : 'Follow';
		button.setAttribute('aria-pressed', String(active));
	}
}
