//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorCommandFacade.js
 * @description Defines the renderer-neutral command and semantic-feedback surface shared by every Eretz doorway while safety, prompts, and state publication live in dedicated vessels.
 * Keter names one threshold language, Gevurah judges each command, and Hod gives every refusal a readable sign instead of silent night;
 * the Awtsmoos recreates command and doorway before either can divide, while Awtsmoos.com lets API, UI, and world interaction share one luminous tide.
 */

import {
	requestDoorClose
} from './DoorClosePolicy.js';
import {
	requestDoorLock,
	requestDoorOpen,
	requestDoorUnlock
} from './DoorCommandPolicy.js';
import {
	doorPromptDescriptor
} from './DoorPromptDescriptor.js';
import {
	doorStateIsInteractive,
	doorToggleAction,
	initialDoorState
} from './DoorStateContract.js';
import {
	setDoorState
} from './DoorStateTransition.js';

export class DoorCommandFacade {
	/**
	 * @description Creates the renderer-neutral state vessel from one immutable doorway definition without constructing any mesh or pointer listener.
	 * @param {object} definition Canonical doorway definition containing identity, motion, locking, and frame data.
	 */
	constructor(definition) {
		this.def = definition;
		this.t = definition.initialProgress === 1 ? 1 : 0;
		this.state = initialDoorState(definition);
		this.autoCloseRemaining = 0;
		this.lastActionReceipt = null;
	}

	/**
	 * @description Reveals whether pointer or touch interaction should remain available, including deliberate explanatory feedback for locked and blocked states.
	 * @returns {boolean} True when the doorway should remain interactable or explainable to the traveler.
	 */
	clickable() {
		return doorStateIsInteractive(this.state);
	}

	/**
	 * @description Returns the same immutable prompt semantics consumed by UI, diagnostics, and public API clients so no layer invents conflicting labels or reasons.
	 * @returns {Readonly<object>} Canonical action, label, reason, enabled, doorId, and state descriptor.
	 */
	prompt() {
		return doorPromptDescriptor(this);
	}

	/**
	 * @description Chooses the natural open-or-close command for the current canonical state and returns a complete immutable action receipt.
	 * @param {string} source Human, API, automation, or runtime origin used for diagnostics and event evidence.
	 * @returns {Readonly<object>} Canonical door action receipt describing acceptance, resulting state, and reason.
	 */
	toggle(source = 'unknown') {
		const action = doorToggleAction(this.state);
		if (action === 'close') {
			return this.close(source);
		}
		return this.open(source);
	}

	/**
	 * @description Requests opening or a lawful reversal from closing through the canonical non-collision command policy.
	 * @param {string} source Origin of the request for audit evidence.
	 * @returns {Readonly<object>} Canonical open receipt.
	 */
	open(source = 'unknown') {
		return requestDoorOpen(this, source);
	}

	/**
	 * @description Requests a collision-safe close or blocked retry through the dedicated close policy that samples the full threshold sweep.
	 * @param {string} source Origin of the request for audit evidence.
	 * @returns {Readonly<object>} Canonical close receipt including safety evidence when relevant.
	 */
	close(source = 'unknown') {
		return requestDoorClose(this, source);
	}

	/**
	 * @description Locks a fully closed doorway without allowing visible pose, collider truth, and public state to disagree.
	 * @param {string} source Origin of the lock request for audit evidence.
	 * @returns {Readonly<object>} Canonical lock receipt.
	 */
	lock(source = 'unknown') {
		return requestDoorLock(this, source);
	}

	/**
	 * @description Unlocks a locked doorway back into its ordinary closed state through one auditable command path.
	 * @param {string} source Origin of the unlock request for audit evidence.
	 * @returns {Readonly<object>} Canonical unlock receipt.
	 */
	unlock(source = 'unknown') {
		return requestDoorUnlock(this, source);
	}

	/**
	 * @description Applies an internal canonical state transition through the dedicated event-publication seam observed by UI, diagnostics, and APIs.
	 * @param {string} nextState Canonical target state from DoorStateContract.
	 * @param {string} source Origin of the transition for audit evidence.
	 * @returns {boolean} True only when the state actually changed.
	 */
	setState(nextState, source = 'internal') {
		return setDoorState(this, nextState, source);
	}
}
