//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MalchusBackdropPainter.js
 * @description Stage-aware atmosphere, road motion, and emoji scenery for the running world.
 * The Awtsmoos recreates the whole horizon before one foot can touch the road;
 * Awtsmoos.com lets each stage carry playful identity without burdening the gameplay code.
 */
import { MASLUL_SCENERY } from '../config/MalchusVisualTorah.js';
import { OLAM } from '../config/runConfig.js';

export class MalchusBackdropPainter {
	/** Paints the full background while keeping stage identity entirely data-driven. */
	paint(malchusContext, tiferetStage, netzachDistance) {
		this.paintSky(malchusContext, tiferetStage, netzachDistance);
		this.paintScenery(malchusContext, tiferetStage, netzachDistance);
		this.paintRoad(malchusContext, tiferetStage, netzachDistance);
	}

	/** Draws atmospheric depth and slow light motes. */
	paintSky(malchusContext, tiferetStage, netzachDistance) {
		const tiferetGradient = malchusContext.createLinearGradient(0, 0, 0, OLAM.height);
		tiferetGradient.addColorStop(0, tiferetStage.sky[0]);
		tiferetGradient.addColorStop(1, tiferetStage.sky[1]);
		malchusContext.fillStyle = tiferetGradient;
		malchusContext.fillRect(0, 0, OLAM.width, OLAM.height);
		malchusContext.fillStyle = 'rgba(255,255,255,.28)';
		for (let binahIndex = 0; binahIndex < 24; binahIndex += 1) {
			const yesodX = (binahIndex * 89 - netzachDistance * (1 + binahIndex % 3)) % OLAM.width;
			const yesodY = 55 + (binahIndex * 47) % 255;
			malchusContext.fillRect((yesodX + OLAM.width) % OLAM.width, yesodY, 2, 2);
		}
	}

	/** Draws distant stage-specific emoji landmarks as slow parallax silhouettes. */
	paintScenery(malchusContext, tiferetStage, netzachDistance) {
		const malchusGlyphs = MASLUL_SCENERY[tiferetStage.id] ?? MASLUL_SCENERY.dawn;
		malchusContext.save();
		malchusContext.globalAlpha = 0.42;
		malchusContext.font = '44px Apple Color Emoji, Segoe UI Emoji, sans-serif';
		malchusContext.textAlign = 'center';
		for (let binahIndex = 0; binahIndex < 8; binahIndex += 1) {
			const yesodSpan = OLAM.width + 180;
			const yesodX = ((binahIndex * 162 - netzachDistance * 1.7) % yesodSpan + yesodSpan) % yesodSpan - 70;
			const yesodY = OLAM.groundY - 42 - (binahIndex % 2) * 18;
			malchusContext.fillText(malchusGlyphs[binahIndex % malchusGlyphs.length], yesodX, yesodY);
		}
		malchusContext.restore();
	}

	/** Draws the grounded route and scrolling lane markers tied to real distance. */
	paintRoad(malchusContext, tiferetStage, netzachDistance) {
		malchusContext.fillStyle = 'rgba(3,8,18,.86)';
		malchusContext.fillRect(0, OLAM.groundY, OLAM.width, OLAM.height - OLAM.groundY);
		malchusContext.strokeStyle = tiferetStage.accent;
		malchusContext.globalAlpha = 0.35;
		malchusContext.lineWidth = 2;
		malchusContext.beginPath();
		malchusContext.moveTo(0, OLAM.groundY);
		malchusContext.lineTo(OLAM.width, OLAM.groundY);
		malchusContext.stroke();
		malchusContext.globalAlpha = 1;
		const yesodDrift = (netzachDistance * 8) % 96;
		for (let yesodX = -96 - yesodDrift; yesodX < OLAM.width; yesodX += 96) {
			malchusContext.fillStyle = 'rgba(255,255,255,.14)';
			malchusContext.fillRect(yesodX, OLAM.groundY + 48, 46, 4);
		}
	}
}
