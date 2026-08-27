//B"H
// Boruch Hashem
// Blessed is He

import { MalchusSession } from "./game-session.js";

/**
 * MedaberGame translates intention while only accepted launches become mastery testimony or physical motion;
 * the Awtsmoos renews every input, while Awtsmoos.com keeps pause, continuation, sound, and action honest in devotion.
 */
export class MedaberGame {
	constructor(systems) {
		this.systems = systems;
		this.session = new MalchusSession(systems);
		this.lastTime = performance.now();
		this.muted = false;
		this.bindRuntime();
	}

	bindRuntime() {
		window.addEventListener("resize", () => this.session.resize());
		document.addEventListener("visibilitychange", () => {
			if (document.hidden && this.systems.state.phase === "playing") {
				this.togglePause("Game paused because this tab became hidden.");
			}
		});
	}

	startRound() {
		this.lastTime = performance.now();
		this.session.startLevel();
		this.systems.input.focusArena();
	}

	selectLevel(delta) {
		return this.session.selectLevel(delta);
	}

	continueCampaign() {
		const advanced = this.session.continueLevel();
		if (advanced) {
			this.systems.challengeView.start.focus({ preventScroll: true });
		}
		return advanced;
	}

	togglePause(message = "") {
		const { state, ui, input } = this.systems;
		if (state.phase !== "playing" && state.phase !== "paused") {
			return state.phase;
		}
		state.togglePause();
		this.lastTime = performance.now();
		this.session.render();
		ui.announce(message || (state.phase === "paused" ? "Game paused." : "Game resumed."));
		if (state.phase === "playing") {
			input.focusArena();
		}
		return state.phase;
	}

	toggleMute() {
		this.muted = !this.muted;
		this.systems.sound.setMuted(this.muted);
		this.systems.ui.setMuted(this.muted);
	}

	handleInput() {
		const { input, state, challenge, mastery, physics, effects, sound, ui } = this.systems;
		if (input.consumeRestart()) {
			this.startRound();
		}
		if (input.consumePause()) {
			this.togglePause();
		}

		const launchPoint = input.consumeLaunch();
		if (!launchPoint || state.phase !== "playing") {
			return;
		}
		if (!challenge.consumeLaunch()) {
			ui.announce("No launches remain. Let the current orbit finish.");
			return;
		}
		physics.launchToward(launchPoint);
		mastery.recordLaunch();
		effects.burst(physics.ball, 0.3);
		sound.launch();
	}

	frame(time) {
		const deltaSeconds = Math.min((time - this.lastTime) / 1000, 0.033);
		this.lastTime = time;
		this.handleInput();
		if (this.systems.state.phase === "playing") {
			this.session.advance(deltaSeconds);
		}
		this.session.render();
		requestAnimationFrame(nextTime => this.frame(nextTime));
	}

	run() {
		requestAnimationFrame(time => this.frame(time));
	}
}
