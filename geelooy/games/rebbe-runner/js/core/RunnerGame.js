//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerGame.js
 * @description Event-emitting session coordinator for The Rebbe's Runner.
 * The Awtsmoos renews every system before any controller may call itself king; Awtsmoos.com lets this Keser-like coordinator join many vessels without swallowing the work that each one must bring.
 */

import { RUNNER_TORAH } from '../config/RunnerTorah.js';
import { NeshamaRunner } from '../entities/NeshamaRunner.js';
import { MalchusRenderer } from '../render/MalchusRenderer.js';
import { BinahMissionDirector } from '../systems/BinahMissionDirector.js';
import { ChesedSpawner } from '../systems/ChesedSpawner.js';
import { GevurahEncounter } from '../systems/GevurahEncounter.js';
import { NetzachProgression } from '../systems/NetzachProgression.js';
import { YesodInput } from '../systems/YesodInput.js';
import { YesodViewport } from '../systems/YesodViewport.js';
import { TiferesHud } from '../ui/TiferesHud.js';
import { RunnerState } from './RunnerState.js';

export class RunnerGame extends EventTarget {
	/** Creates one orchestration vessel around route-owned DOM. */
	constructor(root, world, canvas) {
		super();
		this.root = root;
		this.state = new RunnerState();
		this.progression = new NetzachProgression(RUNNER_TORAH);
		this.missions = new BinahMissionDirector();
		this.spawner = new ChesedSpawner(RUNNER_TORAH);
		this.encounter = new GevurahEncounter(this.progression);
		this.renderer = new MalchusRenderer(canvas);
		this.hud = new TiferesHud(root);
		this.lastFrame = performance.now();
		this.boundFrame = now => this.frame(now);
		this.viewport = new YesodViewport(world, this.renderer, (oldGround, newGround) => {
			this.reconcileGround(oldGround, newGround);
		});
		this.input = new YesodInput(document, {
			jump: () => this.jump(),
			pause: () => this.togglePause(),
			restart: () => this.restart()
		});
		this.hud.update(this.state.snapshot(), this.missions.status(this.state), this.progression.bestScore());
		this.animationFrame = requestAnimationFrame(this.boundFrame);
	}

	/** Resets all transient state and begins a fresh replayable session. */
	startNew() {
		this.state.reset();
		this.state.player = new NeshamaRunner(RUNNER_TORAH);
		this.state.player.placeOnGround(this.renderer.groundY);
		this.missions.reset(this.state);
		this.state.phase = 'running';
		this.lastFrame = performance.now();
		this.hud.hideOverlay();
		this.hud.announce('Run begun. Gather sparks and keep the path clear.');
		this.dispatchEvent(new Event('sessionstart'));
	}

	/** Converts jump intent into either session start or buffered movement. */
	jump() {
		if (this.state.phase === 'ready' || this.state.phase === 'gameover') {
			this.startNew();
			return;
		}
		if (this.state.phase === 'paused') {
			return;
		}
		this.state.player?.requestJump();
	}

	/** Suspends or resumes simulation time without creating another animation loop. */
	togglePause() {
		if (this.state.phase === 'running') {
			this.state.phase = 'paused';
			this.hud.showOverlay('Path paused', 'Resume when your attention is ready.', 'pause', 'Resume');
			return;
		}
		if (this.state.phase === 'paused') {
			this.state.phase = 'running';
			this.lastFrame = performance.now();
			this.hud.hideOverlay();
		}
	}

	/** Starts a new session immediately from any phase. */
	restart() {
		this.startNew();
	}

	/** Advances one bounded animation frame and schedules exactly one successor. */
	frame(now) {
		const deltaSeconds = Math.min(0.033, Math.max(0, (now - this.lastFrame) / 1000));
		this.lastFrame = now;
		if (this.state.isRunning) {
			this.tick(deltaSeconds);
		}
		this.renderer.draw(this.state);
		this.animationFrame = requestAnimationFrame(this.boundFrame);
	}

	/** Coordinates one simulation step across progression, motion, spawning, missions, and HUD. */
	tick(deltaSeconds) {
		this.progression.update(this.state, deltaSeconds);
		this.state.player.update(deltaSeconds);
		const speed = this.progression.speed(this.state);
		this.spawner.update(this.state, deltaSeconds, {
			width: this.renderer.width,
			groundY: this.renderer.groundY,
			speed
		});
		const outcome = this.encounter.update(this.state, deltaSeconds);
		if (outcome.fatal) {
			this.finish();
			return;
		}
		const mission = this.missions.update(this.state);
		this.hud.update(this.state.snapshot(), mission, this.progression.bestScore());
	}

	/** Ends play, persists the best score, and reveals a clear retry path. */
	finish() {
		this.state.phase = 'gameover';
		const best = this.progression.rememberBest(this.state.score);
		this.hud.update(this.state.snapshot(), this.missions.status(this.state), best);
		this.hud.showOverlay('Path interrupted', `Score ${Math.floor(this.state.score)} · best ${best}.`, 'jump', 'Run again');
		this.hud.announce('Run complete. Choose Run again when ready.');
		this.dispatchEvent(new CustomEvent('sessionend', { detail: { score: this.state.score, best } }));
	}

	/** Preserves vertical relation to the ground when the responsive world changes size. */
	reconcileGround(oldGround, newGround) {
		if (!this.state.player) {
			return;
		}
		this.state.player.y += newGround - oldGround;
		this.state.player.groundY = newGround;
		this.state.player.y = Math.min(this.state.player.y, newGround - this.state.player.height);
	}

	/** Releases animation, viewport, and input resources for hot reload or teardown. */
	destroy() {
		cancelAnimationFrame(this.animationFrame);
		this.viewport.destroy();
		this.input.destroy();
	}
}
