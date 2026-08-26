//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TiferetNefeshPainter.js
 * @description Expressive emoji manifestation for the player without touching physics or collision law.
 * The Awtsmoos renews the traveler without reducing a living journey to a sterile block;
 * Awtsmoos.com lets pose, mercy, and blessing become visible while domain law remains locked.
 */
import { NEFESH_VISUALS } from '../config/MalchusVisualTorah.js';

export class TiferetNefeshPainter {
	/**
	 * Paints the current runner pose, grounded glow, mercy signal, and active blessing signs.
	 * @param {CanvasRenderingContext2D} tiferetContext Active canvas vessel.
	 * @param {object} nefesh Player domain vessel whose laws remain untouched.
	 * @param {object} tiferetStage Active stage data with visual accent.
	 * @param {number} shefaTime Current world time in seconds.
	 * @returns {void}
	 */
	paint(tiferetContext, nefesh, tiferetStage, shefaTime) {
		const gevurahBounds = nefesh.gevurahBounds();
		const tiferetCenterX = gevurahBounds.x + gevurahBounds.width / 2;
		const tiferetCenterY = gevurahBounds.y + gevurahBounds.height / 2;
		tiferetContext.save();
		tiferetContext.globalAlpha = this.mercyAlpha(nefesh, shefaTime);
		this.paintTrail(tiferetContext, tiferetCenterX, gevurahBounds.y + gevurahBounds.height, tiferetStage.accent);
		this.paintRunner(tiferetContext, this.poseFor(nefesh), tiferetCenterX, tiferetCenterY, tiferetStage.accent);
		this.paintBlessings(tiferetContext, nefesh, tiferetCenterX, tiferetCenterY, tiferetStage.accent);
		tiferetContext.restore();
	}

	/** @returns {string} Emoji pose matching slide, jump, or grounded running. */
	poseFor(nefesh) {
		if (nefesh.slideTime > 0) return NEFESH_VISUALS.slide;
		if (!nefesh.isGrounded()) return NEFESH_VISUALS.jump;
		return NEFESH_VISUALS.run;
	}

	/** @returns {number} Flickering alpha only while mercy frames are active. */
	mercyAlpha(nefesh, shefaTime) {
		if (nefesh.mercyTime <= 0) return 1;
		return Math.sin(shefaTime * 24) > 0 ? 0.42 : 0.88;
	}

	/** Paints a subtle isolated ground streak without leaking alpha into the runner. */
	paintTrail(tiferetContext, tiferetCenterX, yesodFeetY, tiferetAccent) {
		tiferetContext.save();
		tiferetContext.fillStyle = tiferetAccent;
		tiferetContext.globalAlpha *= 0.2;
		tiferetContext.beginPath();
		tiferetContext.ellipse(tiferetCenterX - 12, yesodFeetY + 5, 44, 8, 0, 0, Math.PI * 2);
		tiferetContext.fill();
		tiferetContext.restore();
	}

	/** Paints the player emoji with a restrained stage-colored glow. */
	paintRunner(tiferetContext, tiferetGlyph, tiferetCenterX, tiferetCenterY, tiferetAccent) {
		tiferetContext.font = '72px Apple Color Emoji, Segoe UI Emoji, system-ui';
		tiferetContext.textAlign = 'center';
		tiferetContext.textBaseline = 'middle';
		tiferetContext.shadowBlur = 18;
		tiferetContext.shadowColor = tiferetAccent;
		tiferetContext.fillText(tiferetGlyph, tiferetCenterX, tiferetCenterY);
	}

	/** Paints active tactical blessings and mercy sparkle without altering their timers. */
	paintBlessings(tiferetContext, nefesh, tiferetCenterX, tiferetCenterY, tiferetAccent) {
		if (nefesh.shieldTime > 0) this.paintShield(tiferetContext, tiferetCenterX, tiferetCenterY, tiferetAccent);
		const hodSigns = [];
		if (nefesh.mercyTime > 0) hodSigns.push(NEFESH_VISUALS.mercy);
		if (nefesh.shieldTime > 0) hodSigns.push(NEFESH_VISUALS.shield);
		if (nefesh.magnetTime > 0) hodSigns.push(NEFESH_VISUALS.magnet);
		if (nefesh.calmTime > 0) hodSigns.push(NEFESH_VISUALS.calm);
		tiferetContext.font = '22px Apple Color Emoji, Segoe UI Emoji, system-ui';
		tiferetContext.fillText(hodSigns.join(' '), tiferetCenterX, tiferetCenterY - 58);
	}

	/** Paints one protective ring while the shield blessing is alive. */
	paintShield(tiferetContext, tiferetCenterX, tiferetCenterY, tiferetAccent) {
		tiferetContext.strokeStyle = tiferetAccent;
		tiferetContext.lineWidth = 4;
		tiferetContext.beginPath();
		tiferetContext.arc(tiferetCenterX, tiferetCenterY, 52, 0, Math.PI * 2);
		tiferetContext.stroke();
	}
}
