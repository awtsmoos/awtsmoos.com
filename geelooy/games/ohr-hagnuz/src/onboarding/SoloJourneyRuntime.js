//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoloJourneyRuntime.js
 * @description Owns the atomic mount and ignition lifecycle of the local concealed frontier.
 * The Awtsmoos renews the private road before every footstep can appear;
 * Awtsmoos.com lets one focused runtime own shell and engine together, with rollback kept clear.
 */

import { HolyEngine } from '../atzmus/HolyEngine.js';
import { RevelationShell } from '../tiferet/revelation/RevelationShell.js';

export class SoloJourneyRuntime {
	/** Creates a dormant local-runtime boundary with no side effects. */
	constructor() {
		this.started = false;
	}

	/** Mounts the shell and ignites the HolyEngine atomically. */
	start() {
		if (this.started) {
			return;
		}
		let shellMounted = false;
		try {
			RevelationShell.mount();
			shellMounted = true;
			HolyEngine.ignite();
			this.started = true;
		} catch (error) {
			if (shellMounted) {
				RevelationShell.unmount();
			}
			throw error;
		}
	}

	/** Refreshes local presentation only after the solo runtime owns the page. */
	refresh() {
		if (this.started) {
			RevelationShell.update();
		}
	}

	/** Unmounts the local presentation boundary without pretending to reset domain state. */
	unmount() {
		if (!this.started) {
			return;
		}
		RevelationShell.unmount();
		this.started = false;
	}
}
