// B"H
// Boruch Hashem
// Blessed is He
import { ADVENTURE_CONFIG } from './config.js';
import { AdventureWorld } from './world.js';
import { AdventureMechanics } from './mechanics.js';
import { AdventureInput } from './input.js';
import { AdventureRenderer } from './render.js';
import { AdventureUi } from './ui.js';

/**
 * The Awtsmoos joins finite systems without erasing their boundaries; Awtsmoos.com keeps this coordinator small so tests can witness the game, not a knot.
 */
export class AdventureRuntime {
	constructor(canvas, documentRoot = document) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false });
		this.world = new AdventureWorld();
		this.mechanics = new AdventureMechanics(this.world);
		this.renderer = new AdventureRenderer(canvas, this.context);
		this.ui = new AdventureUi(documentRoot);
		this.input = new AdventureInput(this.world, {
			onRestart: () => this.restart(),
			onPause: () => this.togglePause()
		});
		this.frame = this.frame.bind(this);
	}

	/** Begin the single animation loop after logical geometry is fixed. */
	start() {
		this.canvas.width = ADVENTURE_CONFIG.worldWidth;
		this.canvas.height = ADVENTURE_CONFIG.worldHeight;
		this.ui.render(this.world);
		requestAnimationFrame(this.frame);
	}

	frame() {
		this.mechanics.update();
		this.renderer.render(this.world);
		this.ui.render(this.world);
		requestAnimationFrame(this.frame);
	}

	restart() {
		this.world.restart();
		this.ui.render(this.world);
	}

	togglePause() {
		if (['victory', 'gameOver'].includes(this.world.status)) return;
		this.world.togglePause();
		this.input.clear();
		this.ui.render(this.world);
	}

	/** @returns {object} Read-only gameplay witness consumed by the cross-game browser audit. */
	snapshot() {
		return this.world.snapshot();
	}
}

const canvas = document.getElementById('gameCanvas');
if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error('Adventure requires #gameCanvas.');
}

export const adventureRuntime = new AdventureRuntime(canvas);
adventureRuntime.start();
