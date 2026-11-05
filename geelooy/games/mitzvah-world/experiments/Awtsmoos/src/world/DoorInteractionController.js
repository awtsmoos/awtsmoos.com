//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorInteractionController.js
 * @description Coordinates doorway context, geometric hit truth, semantic feedback, and command dispatch while pointer lifetime lives in its own surface vessel.
 * Yesod joins intention to action after Binah has measured the hit and Hod has revealed the prompt; the Awtsmoos recreates traveler and threshold in one stream,
 * while Awtsmoos.com keeps this coordinator narrow, documented, and free from listener machinery that belongs in a separate dream.
 */

import { DoorInteractionFeedback } from './DoorInteractionFeedback.js';
import { DoorInteractionHitTest } from './DoorInteractionHitTest.js';
import { DoorPointerSurface } from './DoorPointerSurface.js';

export class DoorInteractionController {
	/**
	 * @description Creates one focused interaction coordinator around independent hit-test, feedback, and pointer-surface collaborators.
	 * @param {object} door Canonical dynamic door exposing prompt, command, hover, and oriented-bound APIs.
	 */
	constructor(door) {
		this.door = door;
		this.context = {};
		this.hitTest = new DoorInteractionHitTest(door);
		this.feedback = new DoorInteractionFeedback(door);
		this.surface = new DoorPointerSurface(
			event => this.handle(event, false),
			event => this.handle(event, true)
		);
	}

	/**
	 * @description Replaces runtime interaction providers without coupling canonical door state to one bootstrap, renderer, or player implementation.
	 * @param {object} context Runtime providers for player position, camera target, event bus, environment, canvas, and interaction-distance policy.
	 * @returns {DoorInteractionController} This coordinator for fluent runtime assembly.
	 */
	setContext(context = {}) {
		this.context = context;
		return this;
	}

	/**
	 * @description Installs one localized pointer surface after clearing prior feedback and listener ownership from any previous canvas/camera pair.
	 * @param {HTMLCanvasElement} canvas Interactive render surface receiving doorway pointer events.
	 * @param {object} camera Active world camera used only by the delegated geometric hit-test collaborator.
	 * @returns {DoorInteractionController} This coordinator for fluent world installation.
	 */
	install(canvas, camera) {
		this.uninstall();
		this.surface.install(
			canvas,
			camera,
			this.context.environment || globalThis
		);
		return this;
	}

	/**
	 * @description Releases transient hover/prompt/cursor feedback before relinquishing pointer listeners and pending visual-frame scheduling.
	 * @returns {void}
	 */
	uninstall() {
		if (this.surface.canvas) {
			this.feedback.clear(
				this.surface.canvas,
				this.context
			);
		}
		this.surface.uninstall();
	}

	/**
	 * @description Resolves one pointer sample through exact/fallback hit truth, publishes canonical prompt semantics, and dispatches one contained toggle action on click.
	 * @param {PointerEvent} event Pointer event carrying screen coordinates, pointer type, and propagation controls.
	 * @param {boolean} click Whether this sample may issue a door command instead of hover feedback only.
	 * @returns {boolean} True when this doorway was the valid local target, regardless of whether command policy later accepts the requested action.
	 */
	handle(event, click) {
		const found = this.hitTest.hit(
			event,
			this.surface.camera,
			this.surface.canvas,
			this.context
		);
		this.feedback.update(
			found,
			event.pointerType,
			this.surface.canvas,
			this.context
		);
		if (!click || !found) {
			return found;
		}
		this.consumePointerEvent(event);
		this.door.toggle('pointer');
		return true;
	}

	/**
	 * @description Stops a claimed doorway gesture from leaking into world-camera or unrelated gameplay pointer handlers after a confirmed local hit.
	 * @param {PointerEvent} event Claimed pointer event whose browser/default and propagation behavior should be contained.
	 * @returns {void}
	 */
	consumePointerEvent(event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
	}

	/**
	 * @description Returns immutable geometric evidence from the delegated hit-test vessel without exposing listener or feedback implementation state.
	 * @returns {Readonly<object>} Last exact/fallback hit mode, ray evidence, and projected bounds.
	 */
	debug() {
		return this.hitTest.debug();
	}
}
