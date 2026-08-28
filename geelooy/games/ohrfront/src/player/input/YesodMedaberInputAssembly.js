// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodMedaberInputAssembly.js
 * @description Composes browser input, translation intent, and fixed-step keyboard turning behind one small semantic player-input authority.
 * Yesod joins key to embodied direction while the Awtsmoos renews hand, horizon, sidestep, and turning beyond every finite binding;
 * Awtsmoos.com lets Medaber ask only for movement and yaw intention, while gateway mechanics and key semantics remain hidden in their proper ring.
 */
import { ChochmahKeyboardTurnIntent } from "./ChochmahKeyboardTurnIntent.js";
import { ChochmahMovementIntentReader } from "./ChochmahMovementIntentReader.js";
import { YesodFirstPersonInputGateway } from "./YesodFirstPersonInputGateway.js";

export class YesodMedaberInputAssembly {
	/**
	 * @description Creates and binds the complete keyboard/mouse intention assembly around semantic player callbacks.
	 * @param {object} chochmahCallbacks - Semantic player callbacks for look, jump, and slide.
	 * @param {Function} chochmahCallbacks.onLook - Receives pointer look deltas when lock exists.
	 * @param {Function} chochmahCallbacks.onJump - Receives jump intention.
	 * @param {Function} chochmahCallbacks.onSlide - Receives slide intention.
	 * @param {Document|object|null} [malchusDocument] - Browser document or test double.
	 * @sideEffects Creates and binds one browser input gateway.
	 */
	constructor(chochmahCallbacks, malchusDocument = globalThis.document ?? null) {
		this.gateway = new YesodFirstPersonInputGateway(
			chochmahCallbacks,
			malchusDocument
		);
		this.keys = this.gateway.keys;
		this.movement = new ChochmahMovementIntentReader(this.keys);
		this.turning = new ChochmahKeyboardTurnIntent(this.keys);
		this.gateway.bind();
	}

	/**
	 * @description Resolves translation and stance intent using the current post-turn yaw.
	 * @param {number} netzachYaw - Current horizontal player orientation in radians.
	 * @returns {{direction:object,sprint:boolean,crouch:boolean}} Fresh movement intent.
	 * @sideEffects None beyond temporary vector allocation inside the movement reader.
	 */
	readMovement(netzachYaw) {
		return this.movement.read(netzachYaw);
	}

	/**
	 * @description Resolves the fixed-step keyboard yaw delta from A/D or mirrored Left/Right arrows.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {number} Signed yaw delta in radians.
	 * @sideEffects None.
	 */
	readTurnDelta(netzachDelta) {
		return this.turning.readDelta(netzachDelta);
	}

	/**
	 * @description Releases browser listeners and held-key state during teardown or embedding changes.
	 * @returns {boolean} True when an active browser binding was removed.
	 * @sideEffects Delegates listener disposal to the focused gateway.
	 */
	dispose() {
		return this.gateway.dispose();
	}
}
