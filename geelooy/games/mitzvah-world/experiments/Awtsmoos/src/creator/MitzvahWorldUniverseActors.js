// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseActors.js
 * @description Breathes idle life into player-placed universe characters.
 * Yaakov 2026-10-11: a universe must feel alive. NPCs sway gently, sheep and
 * horses wander a small pasture around their anchor. All motion is visual-only —
 * collision stays exactly where the creator committed it — and the director owns
 * its own animation loop so no game scheduler surgery is required.
 */

const WANDER_RADIUS = 1.6;

/** Creates one self-ticking universe actor director. */
export function createUniverseActorDirector(options = {}) {
	const environment = options.environment || globalThis;
	const actors = new Map();
	let running = false;
	let frameId = null;

	function track(id, mesh, kind) {
		if (!mesh) return false;
		actors.set(id, {
			anchorX: mesh.position?.x || 0,
			anchorZ: mesh.position?.z || 0,
			baseY: mesh.position?.y || 0,
			id,
			kind,
			mesh,
			phase: Math.random() * Math.PI * 2,
			speed: 0.6 + Math.random() * 0.5
		});
		return true;
	}

	function untrack(id) {
		actors.delete(id);
	}

	function update(timeSeconds) {
		for (const actor of actors.values()) {
			animateActor(actor, timeSeconds);
		}
	}

	function animateActor(actor, t) {
		const mesh = actor.mesh;
		if (!mesh?.position) return;
		if (actor.kind === 'npc') {
			// Gentle idle: breathe vertically, sway facing slightly.
			mesh.position.y = actor.baseY + Math.sin(t * 1.4 + actor.phase) * 0.03;
			if (mesh.rotation) mesh.rotation.y += Math.sin(t * 0.4 + actor.phase) * 0.0006;
		} else {
			// Animals wander a slow circle around their anchor and bob.
			const angle = t * 0.12 * actor.speed + actor.phase;
			mesh.position.x = actor.anchorX + Math.cos(angle) * WANDER_RADIUS * 0.5;
			mesh.position.z = actor.anchorZ + Math.sin(angle) * WANDER_RADIUS * 0.5;
			mesh.position.y = actor.baseY + Math.abs(Math.sin(t * 2.2 + actor.phase)) * 0.05;
			if (mesh.rotation) mesh.rotation.y = -angle;
		}
	}

	function frame(timestamp) {
		if (!running) return;
		update(timestamp / 1000);
		frameId = requestFrame(() => frame(performanceNow()));
	}

	function requestFrame(callback) {
		if (typeof environment.requestAnimationFrame === 'function') {
			return environment.requestAnimationFrame(callback);
		}
		return setTimeout(() => callback(performanceNow()), 50);
	}

	function performanceNow() {
		return typeof environment.performance?.now === 'function'
			? environment.performance.now()
			: Date.now();
	}

	function start() {
		if (running) return;
		running = true;
		frameId = requestFrame(() => frame(performanceNow()));
	}

	function stop() {
		running = false;
		if (frameId != null) {
			if (typeof environment.cancelAnimationFrame === 'function') {
				environment.cancelAnimationFrame(frameId);
			} else {
				clearTimeout(frameId);
			}
			frameId = null;
		}
	}

	function count() {
		return actors.size;
	}

	return Object.freeze({ count, start, stop, track, untrack, update });
}

export default createUniverseActorDirector;
