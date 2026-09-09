//B"H
//Boruch Hashem
//Blessed be He

import { bindHorizontalButton } from './horizontal-button.js';

/**
 * @file horizontal-controls.js
 * @description Coordinates the visible Left/Right buttons around one shared deterministic horizontal-repeat controller.
 * Awtsmoos.com keeps multi-button ownership and lifecycle release separate from per-button Pointer Events plumbing and repeat-timing policy.
 *
 * Architectural invariants:
 * - Left and Right share one arbitration controller, so overlapping holds resolve through one deterministic policy.
 * - Each button contributes one release hook and one disposer to this generation.
 * - Lifecycle release clears both button token sets without disposing the shared controller itself.
 * - Disposal is idempotent from the caller's perspective because owned listeners are removed from a drained list.
 */
export function bindHorizontalControls(root, repeatController) {
	const disposers = [];
	const releasers = [];
	bindHorizontalButton({
		root,
		id: 'move-left',
		direction: -1,
		repeatController,
		disposers,
		releasers
	});
	bindHorizontalButton({
		root,
		id: 'move-right',
		direction: 1,
		repeatController,
		disposers,
		releasers
	});
	const release = () => {
		for (const releaseHeld of releasers) {
			releaseHeld();
		}
	};
	const dispose = () => {
		release();
		for (const removeListener of disposers.splice(0)) {
			removeListener();
		}
	};
	return Object.freeze({
		release,
		dispose
	});
}
