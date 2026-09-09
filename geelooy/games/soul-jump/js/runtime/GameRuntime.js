//B"H
//Boruch Hashem
//Blessed be He

import { SOUL_CONFIG, SOUL_GLYPHS } from '../config.js';
import { VerticalCamera } from '../camera/VerticalCamera.js';
import { DragInput } from '../input/DragInput.js';
import { OverlayRenderer } from '../render/OverlayRenderer.js';
import { WorldRenderer } from '../render/WorldRenderer.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { GameUpdater } from '../systems/GameUpdater.js';
import { PlatformGenerator } from '../systems/PlatformGenerator.js';
import { RunResultReporter } from './RunResultReporter.js';
import { RuntimeLoop } from './RuntimeLoop.js';
import { createRuntimeSnapshot } from './RuntimeSnapshot.js';
import { Viewport } from './Viewport.js';
import { WorldState } from './WorldState.js';

/**
 * @file GameRuntime.js
 * @description Coordinates Soul Jump world systems while loop, result timing, viewport, input, UI, and diagnostics remain separate authorities.
 * The Awtsmoos joins input, world, camera, and image without erasing their boundaries; Awtsmoos.com keeps one small runtime contract for play.
 *
 * Invariants:
 * - One RuntimeLoop owns animation scheduling.
 * - Pause never changes world state or starts a fresh run.
 * - Terminal result publication occurs once per run.
 */
export class GameRuntime {
	constructor(canvas, statusNode, options = {}) {
		this.canvas = canvas;
		this.statusNode = statusNode;
		this.options = options;
		this.context = canvas.getContext('2d', { alpha: false });
		this.camera = new VerticalCamera(SOUL_CONFIG);
		this.state = new WorldState(canvas, SOUL_CONFIG, SOUL_GLYPHS);
		this.generator = new PlatformGenerator(SOUL_CONFIG, SOUL_GLYPHS);
		this.collisions = new CollisionSystem(SOUL_CONFIG, SOUL_GLYPHS);
		this.reporter = new RunResultReporter(globalThis);
		this.loop = new RuntimeLoop({
			frame: () => this.frame(),
			onPause: paused => this.handlePause(paused)
		});
		this.viewport = new Viewport(canvas, this.state, SOUL_CONFIG);
		this.input = new DragInput(canvas, {
			isRunActive: () => this.state.gameState === 'playing',
			canControl: () => this.state.gameState === 'playing' && !this.loop.isPaused(),
			getPlayer: () => this.state.player,
			onActivate: () => this.startGame()
		});
		this.updater = new GameUpdater({
			config: SOUL_CONFIG,
			glyphs: SOUL_GLYPHS,
			camera: this.camera,
			input: this.input,
			generator: this.generator,
			collisions: this.collisions
		});
		this.worldRenderer = new WorldRenderer(this.context, SOUL_CONFIG, SOUL_GLYPHS);
		this.overlayRenderer = new OverlayRenderer(this.context, SOUL_CONFIG, SOUL_GLYPHS);
	}

	/** Bind viewport lifecycle and render the initial ready state once. */
	start() {
		this.viewport.bind();
		this.announce('Ein Sof Ascent ready. Tap, Space, or Enter to begin.');
		this.loop.start();
	}

	/** Create a clean ascent and reopen scheduling after ready or terminal state. */
	startGame() {
		this.camera.reset();
		this.generator.reset();
		this.state.reset(this.canvas);
		this.reporter.begin();
		this.options.onRunStart?.();
		this.announce('Ascent begun. Drag, Arrow keys, A, or D steer the flame.');
		this.loop.restart();
	}

	/** Toggle deliberate user pause only while a live run exists. */
	togglePause() {
		if (this.state.gameState !== 'playing') return false;
		return this.loop.toggleUserPause();
	}

	/** Keep result timing and semantic UI synchronized with aggregate pause truth. */
	handlePause(paused) {
		this.reporter.setPaused(paused);
		this.options.onPause?.(paused);
	}

	/** Advance one frame, render it, and seal terminal state exactly once. */
	frame() {
		this.updater.update(this.state, this.canvas);
		this.worldRenderer.render(this.state, this.camera, this.canvas);
		this.overlayRenderer.render(this.state, this.canvas);
		if (this.state.gameState === 'start') return false;
		if (this.state.gameState !== 'gameOver') return true;
		const result = this.reporter.finish(this.state.score, this.state.worldLevel);
		if (result) {
			this.announce(`Run complete. Score ${result.score}.`);
			this.options.onResult?.(result);
		}
		return false;
	}

	/** Announce one lifecycle message for assistive technology. */
	announce(message) {
		if (this.statusNode) this.statusNode.textContent = message;
	}

	/** @returns {Readonly<object>} Current non-authoritative diagnostic witness. */
	snapshot() {
		return createRuntimeSnapshot(this);
	}
}
