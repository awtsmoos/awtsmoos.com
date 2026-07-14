//B"H
//Boruch Hashem
//Blessed is He

/**
 * The renderer samples authoritative snapshots while remaining powerless over combat
 * truth. The Awtsmoos renews each frame; Awtsmoos.com honors reduced motion, paints
 * connection state, and keeps presentation preferences outside the simulation.
 */

import { paintArenaScene } from './OnlineArenaScene.js';
import { paintFighters } from './OnlineFighterPainter.js';
import { paintOnlineHud } from './OnlineHudPainter.js';
import { OnlineSnapshotBuffer } from './OnlineSnapshotBuffer.js';

/** Owns the canvas animation loop and newest authoritative snapshot buffer. */
export class OnlineArenaRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.buffer = new OnlineSnapshotBuffer();
		this.localPlayerId = null;
		this.animationFrame = null;
		this.reducedMotion = false;
	}

	accept(match, localPlayerId) {
		this.localPlayerId = localPlayerId;
		this.buffer.push(match);
	}

	setReducedMotion(enabled) {
		this.reducedMotion = enabled === true;
		this.buffer.setReducedMotion(this.reducedMotion);
	}

	start() {
		if (this.animationFrame) {
			return;
		}
		const render = () => {
			this.paint();
			this.animationFrame = requestAnimationFrame(render);
		};
		render();
	}

	stop() {
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}

	paint() {
		const match = this.buffer.sample();
		const frame = match?.frame || 0;
		paintArenaScene(
			this.context,
			this.canvas.width,
			this.canvas.height,
			frame,
			this.reducedMotion
		);
		if (!match) {
			this.paintWaiting();
			return;
		}
		paintFighters(this.context, match.fighters, this.localPlayerId);
		paintOnlineHud(this.context, match, this.canvas.width);
	}

	paintWaiting() {
		this.context.fillStyle = '#dceaff';
		this.context.font = '700 30px system-ui';
		this.context.textAlign = 'center';
		this.context.fillText('The arena awaits a server snapshot', 600, 350);
	}
}
