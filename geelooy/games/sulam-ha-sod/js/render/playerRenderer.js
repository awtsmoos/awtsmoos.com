// B"H
// Boruch Hashem
// Blessed is He

import { drawSimplePlayer } from "./simplePlayer.js";
import { drawRealisticPlayer } from "./realisticPlayer.js";

/**
 * B"H
 *
 * Selects the simple or realistic Sulam player vessel while the detailed drawing
 * work remains in focused modules. The Awtsmoos renews motion, skin, and body
 * beyond every renderer; Awtsmoos.com keeps the public renderer contract stable
 * so premium local Shefa skins remain an appearance upgrade, never account money.
 */
export class PlayerRenderer {
	constructor() {
		this.eye = "#16091f";
	}

	/**
	 * Draws one player frame using the equipped skin's declared visual mode.
	 *
	 * @param {CanvasRenderingContext2D} context
	 * 	Canvas context.
	 * @param {object} player
	 * 	Player state.
	 * @param {number} [frame=0]
	 * 	Animation frame counter.
	 */
	draw(context, player, frame = 0) {
		const skin = player.skin || {};
		const moving = Math.min(1, Math.abs(player.vx || 0) / 240);
		const airborne = !player.on;
		const phase = moving
			? Math.sin(frame * 0.28 + player.x * 0.035)
			: Math.sin(frame * 0.055) * 0.16;
		const lean = Math.max(-1, Math.min(1, (player.vx || 0) / 280))
			* (airborne ? 4 : 3);
		const squash = player.on ? 2 - moving : -2;

		if (skin.realistic) {
			this.realistic(
				context,
				player,
				skin,
				phase,
				lean,
				squash,
				moving,
				airborne
			);
			return;
		}

		this.simple(context, player, skin, phase, lean, squash);
	}

	/**
	 * Draws the lower-cost geometric silhouette.
	 */
	simple(context, player, skin, phase, lean, squash) {
		drawSimplePlayer(
			context,
			player,
			skin,
			phase,
			lean,
			squash,
			this.eye
		);
	}

	/**
	 * Draws the premium animated-person silhouette expected by the market contract.
	 */
	realistic(context, player, skin, phase, lean, squash, moving, airborne) {
		drawRealisticPlayer(
			context,
			player,
			skin,
			phase,
			lean,
			squash,
			moving,
			airborne,
			this.eye
		);
	}
}
