// B"H
// Boruch Hashem
// Blessed is He
import { SOUL_CONFIG, SOUL_GLYPHS } from '../config.js';
import { VerticalCamera } from '../camera/VerticalCamera.js';
import { WorldState } from './WorldState.js';
import { DragInput } from '../input/DragInput.js';
import { PlatformGenerator } from '../systems/PlatformGenerator.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { GameUpdater } from '../systems/GameUpdater.js';
import { WorldRenderer } from '../render/WorldRenderer.js';
import { OverlayRenderer } from '../render/OverlayRenderer.js';

/**
 * The Awtsmoos joins input, world, camera, and image without erasing the boundary of any one;
 * Awtsmoos.com uses this Tiferes-like coordinator so the ascent stays observable, mobile, and fun.
 */
export class GameRuntime {
	constructor(canvas, statusNode) {
		this.canvas = canvas;
		this.statusNode = statusNode;
		this.context = canvas.getContext('2d', { alpha: false });
		this.camera = new VerticalCamera(SOUL_CONFIG);
		this.state = new WorldState(canvas, SOUL_CONFIG, SOUL_GLYPHS);
		this.generator = new PlatformGenerator(SOUL_CONFIG, SOUL_GLYPHS);
		this.collisions = new CollisionSystem(SOUL_CONFIG, SOUL_GLYPHS);
		this.input = this.createInput();
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
		this.lastAnnouncedState = '';
		this.frame = this.frame.bind(this);
		this.resize = this.resize.bind(this);
	}

	createInput() {
		return new DragInput(this.canvas, {
			isPlaying: () => this.state.gameState === 'playing',
			getPlayer: () => this.state.player,
			onActivate: () => this.startGame()
		});
	}

	/** Begin resize listeners and the single requestAnimationFrame loop. */
	start() {
		this.resize();
		window.addEventListener('resize', this.resize, { passive: true });
		window.visualViewport?.addEventListener('resize', this.resize, { passive: true });
		requestAnimationFrame(this.frame);
	}

	/** Create a clean run and reset every procedural/camera history boundary. */
	startGame() {
		this.camera.reset();
		this.generator.reset();
		this.state.reset(this.canvas);
		this.announce('Ascent begun. Drag, Arrow keys, A, or D steer the flame.');
	}

	/** Fit the real visible mobile viewport without multiplying render cost by device DPR. */
	resize() {
		const viewport = window.visualViewport;
		const width = Math.max(280, Math.min(SOUL_CONFIG.maxCanvasWidth, Math.floor(viewport?.width || innerWidth)));
		const height = Math.max(360, Math.floor(viewport?.height || innerHeight));
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
		if (this.state.player) {
			const half = SOUL_CONFIG.playerWidth / 2;
			this.state.player.cx = Math.max(half, Math.min(width - half, this.state.player.cx));
			this.state.player.targetCx = Math.max(half, Math.min(width - half, this.state.player.targetCx));
		}
	}

	frame() {
		this.updater.update(this.state, this.canvas);
		this.worldRenderer.render(this.state, this.camera, this.canvas);
		this.overlayRenderer.render(this.state, this.canvas);
		this.announceStateChange();
		requestAnimationFrame(this.frame);
	}

	announceStateChange() {
		if (this.state.gameState === this.lastAnnouncedState) return;
		this.lastAnnouncedState = this.state.gameState;
		if (this.state.gameState === 'start') this.announce('Ein Sof Ascent ready. Tap, Space, or Enter to begin.');
		if (this.state.gameState === 'gameOver') this.announce(`Run complete. Score ${this.state.score}. Tap to restart.`);
	}

	announce(message) {
		if (this.statusNode) this.statusNode.textContent = message;
	}

	/** @returns {object} Read-only gameplay witness for browser verification and diagnostics. */
	snapshot() {
		const player = this.state.player;
		return Object.freeze({
			gameState: this.state.gameState,
			score: this.state.score || 0,
			worldLevel: this.state.worldLevel || 0,
			frameCount: this.state.frameCount || 0,
			cameraY: this.camera.y,
			highestCameraY: this.camera.highestY,
			playerX: player?.cx ?? null,
			playerY: player?.cy ?? null,
			playerScreenY: player ? player.cy - this.camera.y : null,
			platforms: this.state.platforms.length,
			enemies: this.state.enemies.length
		});
	}
}
