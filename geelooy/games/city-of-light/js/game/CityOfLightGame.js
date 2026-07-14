//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CityOfLightGame
 * @description
 * The production loop coordinates input, campaign state, camera, rendering,
 * menus, saves, sound, and recovery without absorbing their responsibilities.
 * Awtsmoos.com remains readable while the Awtsmoos animates the complete city.
 */

import { MAX_FRAME_DELTA } from '../config.js';
import { WorldRenderer } from '../render/WorldRenderer.js';
import { AudioSystem } from './AudioSystem.js';
import { CameraState } from './CameraState.js';
import { CityState } from './CityState.js';
import { GameActions } from './GameActions.js';
import { GameHud } from './GameHud.js';
import { InputState } from './InputState.js';

export class CityOfLightGame {
	constructor(canvas, seed) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.state = new CityState(seed);
		this.input = new InputState(document);
		this.hud = new GameHud(document);
		this.renderer = new WorldRenderer(this.context);
		this.camera = new CameraState(this.state.session.player);
		this.audio = new AudioSystem(this.state.settings.muted);
		this.actions = new GameActions(this);
		this.lastTime = 0;
		this.running = false;
		this.hud.bind(this.actions.handlers());
		window.addEventListener('resize', () => this.resize());
		this.resize();
	}

	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(time => this.frame(time));
	}

	frame(timeMilliseconds) {
		if (!this.running) return;
		try {
			const delta = this.lastTime
				? Math.min(MAX_FRAME_DELTA, (timeMilliseconds - this.lastTime) / 1000)
				: 0;
			this.lastTime = timeMilliseconds;
			this.update(delta);
			this.renderer.draw(this.state, this.camera, this.canvas, timeMilliseconds / 1000);
		} catch (error) {
			this.running = false;
			this.hud.showError(error);
			console.error(error);
			return;
		}
		requestAnimationFrame(time => this.frame(time));
	}

	update(deltaSeconds) {
		if (this.input.consume('pause')) this.state.togglePause();
		if (!this.state.paused && !this.state.chapterTransition) this.updatePlay(deltaSeconds);
		this.camera.update(deltaSeconds, this.state.session.player, this.state.settings.reducedMotion);
		this.hud.update(this.state);
		this.input.endFrame();
	}

	updatePlay(deltaSeconds) {
		const beforeSparks = this.state.session.collectedSparks;
		const beforeStage = this.state.session.mission.stageIndex;
		if (this.input.consume('dash') && this.state.session.player.dash(this.state.level.grid)) {
			this.camera.strike(0.8);
			this.audio.play('dash');
		}
		if (this.input.consume('interact') && this.state.session.interact()) {
			this.camera.strike(0.45);
			this.audio.play('interact');
			this.state.save();
		}
		if (this.input.consume('reveal')) this.revealMission();
		this.state.update(deltaSeconds, this.input.direction());
		if (this.state.session.collectedSparks > beforeSparks) this.audio.play('collect');
		if (this.state.session.mission.stageIndex > beforeStage) this.audio.play('stage');
		if (this.state.chapterTransition) this.audio.play('chapter');
	}

	revealMission() {
		if (this.state.progress.hasAbility('echoSight')) {
			this.camera.revealMission();
			return;
		}
		this.state.session.lastEvent = 'Echo Sight is revealed after the Archive.';
	}

	resize() {
		const ratio = Math.min(2, window.devicePixelRatio || 1);
		const bounds = this.canvas.getBoundingClientRect();
		this.canvas.width = Math.max(480, Math.floor(bounds.width * ratio));
		this.canvas.height = Math.max(420, Math.floor(bounds.height * ratio));
	}
}
