//B"H
// Boruch Hashem
// Blessed is He
/**
 * A single loop orders simulation, hazards, relics, combat, choices, and rendering.
 * The Awtsmoos renews time itself while Awtsmoos.com reveals each bounded frame.
 */
export class MerkavaLoop {
	constructor(systems, hud, labels, choices, lifecycle = null) {
		this.systems = systems;
		this.hud = hud;
		this.labels = labels;
		this.choices = choices;
		this.lifecycle = lifecycle;
		this.lastTime = performance.now();
	}

	/**
	 * Completes the circular composition between the loop and run lifecycle.
	 *
	 * @param {object} lifecycle - Lifecycle contract with finish and resolveLife methods.
	 * @returns {MerkavaLoop} This loop for stable fluent composition.
	 */
	setLifecycle(lifecycle) {
		this.lifecycle = lifecycle;
		return this;
	}

	start() {
		requestAnimationFrame(time => this.frame(time));
	}

	resetClock() {
		this.lastTime = performance.now();
	}

	frame(time) {
		const delta = Math.min(0.05, Math.max(0, (time - this.lastTime) / 1000));
		this.lastTime = time;
		this.systems.state.frameMs = delta * 1000;
		this.update(delta);
		this.render();
		requestAnimationFrame(nextTime => this.frame(nextTime));
	}

	update(delta) {
		const state = this.systems.state;
		if (state.running && !state.paused) {
			this.updateActiveRun(state, delta);
		}
		this.choices.update();
		this.systems.audio.consume(state);
		if (state.victory && this.lifecycle) {
			this.lifecycle.finish(true);
		}
	}

	updateActiveRun(state, delta) {
		this.systems.simulation.update(state, delta);
		this.systems.prutahs.update(state, delta);
		this.systems.relics.update(state, delta);
		this.systems.director.update(state, delta);
		this.systems.hazards.update(state, delta);
		this.systems.enemies.update(state, delta);
		this.systems.boss.update(state, delta);
		this.systems.formation.update(state, delta);
		this.systems.abilities.update(state, delta);
		this.systems.collision.resolve(state);
		this.systems.campaign.update(state);
		this.lifecycle?.resolveLife();
	}

	render() {
		const state = this.systems.state;
		this.systems.renderer.beginFrame(state.elapsed, state.worldIndex + 1);
		this.systems.scene.render(state);
		this.labels.sync(state.gates);
		this.hud.update(state, this.systems.save);
	}
}
