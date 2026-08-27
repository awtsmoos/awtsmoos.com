// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockActions.js
 * @description Preserves clean-view and Movie Studio behavior without owning the retractable DOM vessel.
 * The Awtsmoos lets vision clear without severing return, and lets one moment cross into authorship by choice;
 * Awtsmoos.com keeps these powers behind explicit actions, so advanced tools never become the valley's default voice.
 */

import { createMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshot.js';
import { createMitzvahWorldMovieRoute } from './MitzvahWorldCreativeRoute.js';
import { writeMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshotStore.js';

/** Owns optional advanced actions while the view owns only presentation. */
export class MitzvahWorldCreativeDockActions {
	/**
	 * @param {object} view Retractable command-capsule view.
	 * @param {Document} documentValue Active document.
	 * @param {object} environment Browser-like environment.
	 */
	constructor(view, documentValue, environment) {
		this.view = view;
		this.document = documentValue;
		this.environment = environment;
	}

	/** Toggles cinematic clean view while preserving a visible recovery capsule. */
	toggleCleanView() {
		const root = this.document.documentElement;
		const active = root.dataset.awtsmoosCinematic !== 'true';
		if (active) {
			root.dataset.awtsmoosCinematic = 'true';
			this.view.close();
		} else {
			delete root.dataset.awtsmoosCinematic;
		}
		this.view.cleanButton.setAttribute('aria-pressed', String(active));
		this.view.cleanButton.textContent = active ? 'Restore HUD' : 'Clean view';
		this.view.status(active ? 'Clean cinematic view enabled.' : 'Gameplay HUD restored.');
		return active;
	}

	/** Saves the current gameplay moment and crosses explicitly into Movie Studio. */
	openStudio() {
		const snapshot = createMitzvahWorldCreativeSnapshot(
			this.environment.AwtsmoosMitzvahWorld,
			{
				document: this.document,
				location: this.environment.location,
				sessionMode: this.document.documentElement.dataset.awtsmoosSession
			}
		);
		const result = writeMitzvahWorldCreativeSnapshot(
			snapshot,
			this.environment.sessionStorage
		);
		if (!result.ok) {
			this.view.status(`Unable to prepare Movie Studio: ${result.code}.`);
			return result;
		}
		this.view.status('Gameplay moment saved. Opening Movie Studio…');
		const route = createMitzvahWorldMovieRoute(this.environment.location);
		if (typeof this.environment.location?.assign === 'function') {
			this.environment.location.assign(route);
		} else if (this.environment.location) {
			this.environment.location.href = route;
		}
		return { ...result, route };
	}

	/** Restores ordinary HUD state when the advanced controller is destroyed. */
	destroy() {
		delete this.document.documentElement.dataset.awtsmoosCinematic;
	}
}
