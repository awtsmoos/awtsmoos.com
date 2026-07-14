//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative renderer composes authoritative backdrop, road, entities, and HUD.
 * The Awtsmoos renews every distant teammate; Awtsmoos.com keeps this conductor small
 * while focused painters remain witnesses rather than simulation authorities.
 */

import {
	coopCameraCenter,
	drawCoopBackdrop,
	drawCoopCentered,
	drawCoopRoad
} from './CoopCanvasPainter.js';
import { drawCoopBoss, drawCoopEnemies, drawCoopPlayers } from './CoopEntityPainter.js';
import { drawCoopHud } from './CoopHudPainter.js';

export class CoopRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.resize();
	}

	resize() {
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		const width = Math.max(720, this.canvas.clientWidth || 960);
		const height = Math.max(420, this.canvas.clientHeight || 540);
		this.canvas.width = Math.round(width * ratio);
		this.canvas.height = Math.round(height * ratio);
		this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
		this.width = width;
		this.height = height;
	}

	draw(room, playerId) {
		const match = room?.match;
		drawCoopBackdrop(this.context, match, this.width, this.height);
		if (!match) {
			drawCoopCentered(
				this.context,
				'Create or join a cooperative Expedition room.',
				this.width,
				this.height
			);
			return;
		}
		const cameraX = coopCameraCenter(match.players, playerId);
		this.context.save();
		this.context.translate(this.width / 2 - cameraX * 0.15, 0);
		drawCoopRoad(this.context, this.height);
		drawCoopEnemies(this.context, match.enemies, this.height);
		drawCoopBoss(this.context, match.boss, this.height);
		drawCoopPlayers(this.context, match.players, playerId, this.height);
		this.context.restore();
		drawCoopHud(this.context, match, this.width);
	}
}
