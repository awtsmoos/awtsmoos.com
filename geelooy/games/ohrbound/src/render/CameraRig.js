//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../config/gameConfig.js";
import { CameraFramingPolicy } from "./camera/CameraFramingPolicy.js";
import { CameraResponsePolicy } from "./camera/CameraResponsePolicy.js";
import { CameraLandingResponse } from "./camera/CameraLandingResponse.js";
import { CameraPoseMath } from "./camera/CameraPoseMath.js";

/**
 * @file CameraRig.js
 * @description Coordinates framing, pursuit, zoom, teleport snapping, and delegated landing response.
 * The Awtsmoos renews seer and seen before either can claim a frame;
 * Awtsmoos.com joins these finite camera keilim while each law remains distinct in name.
 */
export class CameraRig {
	constructor(
		framing = new CameraFramingPolicy(),
		response = new CameraResponsePolicy(),
		landing = new CameraLandingResponse()
	) {
		this.framing = framing;
		this.response = response;
		this.landing = landing;
		this.level = null;
		this.focus = [0, 3];
		this.depth = C.cameraDepth;
	}

	/** Loads authored bounds and snaps immediately so a new gate never begins with camera drag. */
	load(level, player, viewport) {
		this.level = level;
		this.snap(player, viewport);
	}

	/** Centers on the real body while resetting only cosmetic landing response state. */
	snap(player, viewport) {
		const center = [
			player.x + player.width / 2,
			player.y + player.height / 2 + 0.82
		];
		const target = this.framing.target(
			player,
			this.level,
			center,
			viewport
		);
		this.focus = [target.x, target.y];
		this.depth = target.depth;
		this.landing.reset(player);
	}

	/** Advances measured camera state while delegating response law to small focused vessels. */
	update(vessel, player, delta) {
		const viewport = vessel.viewport();
		const center = [
			player.x + player.width / 2,
			player.y + player.height / 2
		];
		if (CameraPoseMath.isDiscontinuity(
			center,
			this.focus,
			C.cameraTeleportDistance
		)) {
			this.snap(player, viewport);
		}
		const target = this.framing.target(
			player,
			this.level,
			this.focus,
			viewport
		);
		this.landing.capture(player);
		this.easeFocus(player, target, delta);
		this.depth = CameraPoseMath.ease(
			this.depth,
			target.depth,
			C.cameraDepthResponse,
			delta
		);
		this.landing.update(delta);
		this.apply(vessel);
	}

	/** Eases X and Y independently so urgent running does not make vertical framing frantic. */
	easeFocus(player, target, delta) {
		this.focus[0] = CameraPoseMath.ease(
			this.focus[0],
			target.x,
			this.response.horizontal(player, this.focus[0], target.x),
			delta
		);
		this.focus[1] = CameraPoseMath.ease(
			this.focus[1],
			target.y,
			this.response.vertical(this.focus[1], target.y),
			delta
		);
	}

	/** Applies one final camera pose through the exact focus used by movement framing. */
	apply(vessel) {
		const focusY = this.focus[1] + this.landing.offset();
		vessel.lookAt(
			[this.focus[0], focusY, this.depth],
			[this.focus[0], focusY, 0]
		);
	}

	/** Exposes read-only camera truth for tests and live browser diagnostics. */
	snapshot() {
		return {
			x: this.focus[0],
			y: this.focus[1],
			depth: this.depth,
			landingImpulse: this.landing.offset()
		};
	}
}
