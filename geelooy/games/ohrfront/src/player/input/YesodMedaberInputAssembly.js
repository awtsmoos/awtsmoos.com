// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodMedaberInputAssembly.js
 * @description Composes desktop and analog-touch movement behind one semantic player-input authority without synthesizing foreign input events.
 * Yesod joins key and finger to embodied direction while the Awtsmoos renews every path beyond their finite names;
 * Awtsmoos.com lets Medaber receive one normalized movement covenant while browser mechanics remain in focused outer vessels.
 */
import {
	addScaled,
	lengthSquared,
	normalize,
	vector
} from "../../core/OhrVectorMath.js";
import { ChochmahKeyboardTurnIntent } from "./ChochmahKeyboardTurnIntent.js";
import { ChochmahMovementIntentReader } from "./ChochmahMovementIntentReader.js";
import { YesodFirstPersonInputGateway } from "./YesodFirstPersonInputGateway.js";
import { ChochmahTouchMovementIntentReader } from "./touch/ChochmahTouchMovementIntentReader.js";
import { HodTouchMovementState } from "./touch/HodTouchMovementState.js";
import { YesodTouchPlayerGateway } from "./touch/YesodTouchPlayerGateway.js";

export class YesodMedaberInputAssembly {
	/** @description Creates desktop and touch input authorities around shared semantic callbacks. @param {object} chochmahCallbacks - Player callbacks. @param {Document|object|null} [malchusDocument] - Browser document or test double. @sideEffects Binds eligible desktop and touch listeners. */
	constructor(chochmahCallbacks, malchusDocument = globalThis.document ?? null) {
		this.gateway = new YesodFirstPersonInputGateway(chochmahCallbacks, malchusDocument);
		this.keys = this.gateway.keys;
		this.movement = new ChochmahMovementIntentReader(this.keys);
		this.turning = new ChochmahKeyboardTurnIntent(this.keys);
		this.touchState = new HodTouchMovementState();
		this.touchMovement = new ChochmahTouchMovementIntentReader(this.touchState);
		this.touchGateway = new YesodTouchPlayerGateway(
			this.touchState,
			chochmahCallbacks,
			malchusDocument
		);
		this.gateway.bind();
		this.touchGateway.bind();
	}

	/** @description Merges keyboard and touch translation into one normalized stance-aware intention. @param {number} netzachYaw - Player yaw. @returns {{direction:object,sprint:boolean,crouch:boolean}} Unified movement. @sideEffects Allocates one finite vector. */
	readMovement(netzachYaw) {
		const chochmahKeyboard = this.movement.read(netzachYaw);
		const chochmahTouch = this.touchMovement.read(netzachYaw);
		const tiferesDirection = vector();
		addScaled(tiferesDirection, chochmahKeyboard.direction, 1);
		addScaled(tiferesDirection, chochmahTouch.direction, 1);
		if (lengthSquared(tiferesDirection) > 1) {
			normalize(tiferesDirection, tiferesDirection);
		}
		return {
			direction: tiferesDirection,
			sprint: chochmahKeyboard.sprint || chochmahTouch.sprint,
			crouch: chochmahKeyboard.crouch || chochmahTouch.crouch
		};
	}

	/** @description Reads desktop keyboard turn contribution for one simulation delta. @param {number} netzachDelta - Frame delta seconds. @returns {number} Turn delta. @sideEffects None. */
	readTurnDelta(netzachDelta) {
		return this.turning.readDelta(netzachDelta);
	}

	/** @description Disposes desktop and touch browser gateways together. @returns {boolean} True when either gateway removed listeners. @sideEffects Removes listeners and clears touch state. */
	dispose() {
		const netzachDesktop = this.gateway.dispose();
		const netzachTouch = this.touchGateway.dispose();
		return netzachDesktop || netzachTouch;
	}
}
