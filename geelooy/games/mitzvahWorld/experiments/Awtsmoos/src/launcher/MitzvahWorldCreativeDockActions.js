// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockActions.js
 * @description Owns Clean View, lazy data-first API exploration, and explicit Movie Studio transitions while all visual state remains rooted in Mitzvah World.
 * The Awtsmoos lets vision clear, knowledge unfold, and one lived moment cross into authorship by conscious choice;
 * Awtsmoos.com keeps every advanced deed behind the same hidden star, so new capability grows inward without becoming permanent noise across the valley's voice.
 */

import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { createMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshot.js';
import { createMitzvahWorldMovieRoute } from './MitzvahWorldCreativeRoute.js';
import { writeMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshotStore.js';

/** Owns advanced actions while the creative-dock view owns only presentation and outer interaction state. */
export class MitzvahWorldCreativeDockActions {
	/**
	 * Captures dependencies explicitly so advanced behavior never reaches for visual state on the document element.
	 * @param {object} viewKli Retractable command-capsule view.
	 * @param {Document} documentKli Active document.
	 * @param {object} environmentKli Browser-like environment.
	 */
	constructor(viewKli, documentKli, environmentKli) {
		this.view = viewKli;
		this.document = documentKli;
		this.environment = environmentKli;
		this.rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
	}

	/**
	 * Toggles cinematic Clean View on the local game root while preserving the one visible recovery capsule.
	 * @returns {boolean} Whether cinematic mode is active after the transition.
	 */
	toggleCleanView() {
		const activeOhr = !this.rootStateMalchus.readFlag('cinematic');
		this.rootStateMalchus.setFlag('cinematic', activeOhr);
		this.view.cleanButton.setAttribute('aria-pressed', String(activeOhr));
		this.view.cleanButton.textContent = activeOhr ? 'Restore HUD' : 'Clean view';
		this.view.status(activeOhr ? 'Clean cinematic view enabled.' : 'Gameplay HUD restored.');
		if (activeOhr) {
			this.view.close();
		}
		return activeOhr;
	}

	/**
	 * Lazily opens the data-first API subview inside the already-open advanced sheet.
	 * @returns {Promise<object|null>} Explorer controller when available, otherwise null after event fallback.
	 */
	async openApi() {
		this.view.open();
		this.view.status('Opening data-first API…');
		const openDaas = this.environment.AwtsmoosOpenApiExplorer;
		if (typeof openDaas === 'function') {
			try {
				const explorerDaas = await openDaas();
				this.view.status('API observatory ready.');
				return explorerDaas || null;
			} catch (errorOhr) {
				this.view.status(`API explorer degraded: ${errorOhr?.message || errorOhr}.`);
				return null;
			}
		}
		this.dispatchApiRequest();
		this.view.status('API explorer requested.');
		return null;
	}

	/**
	 * Saves the current gameplay moment and crosses explicitly into Movie Studio.
	 * @returns {object} Snapshot-store receipt plus route when successful.
	 */
	openStudio() {
		const snapshotOhr = createMitzvahWorldCreativeSnapshot(
			this.environment.AwtsmoosMitzvahWorld,
			{
				document: this.document,
				location: this.environment.location,
				sessionMode: this.rootStateMalchus.root.dataset.awtsmoosSession
					|| this.document.documentElement.dataset.awtsmoosSession
			}
		);
		const storeMalchus = writeMitzvahWorldCreativeSnapshot(snapshotOhr, this.environment.sessionStorage);
		if (!storeMalchus.ok) {
			this.view.status(`Unable to prepare Movie Studio: ${storeMalchus.code}.`);
			return storeMalchus;
		}
		this.view.status('Gameplay moment saved. Opening Movie Studio…');
		const routeOhr = createMitzvahWorldMovieRoute(this.environment.location);
		if (typeof this.environment.location?.assign === 'function') {
			this.environment.location.assign(routeOhr);
		} else if (this.environment.location) {
			this.environment.location.href = routeOhr;
		}
		return { ...storeMalchus, route: routeOhr };
	}

	/** Restores local cinematic state and destroys a mounted API subview when the advanced controller is retired. */
	destroy() {
		this.rootStateMalchus.setFlag('cinematic', false);
		this.view.apiHost?.awtsmoosApiController?.destroy?.();
	}

	/** Emits the existing lazy API request event when the direct opener is not installed yet. */
	dispatchApiRequest() {
		const EventKli = this.environment.CustomEvent || globalThis.CustomEvent;
		const requestOhr = typeof EventKli === 'function'
			? new EventKli('awtsmoos:open-api-explorer')
			: Object.freeze({ type: 'awtsmoos:open-api-explorer' });
		this.environment.dispatchEvent?.(requestOhr);
	}
}
