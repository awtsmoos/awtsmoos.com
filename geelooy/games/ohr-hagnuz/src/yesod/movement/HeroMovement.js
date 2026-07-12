/**
 * B"H
 * @module HeroMovement
 * @description Manual and pathfinding movement, animation, blocking, and arrival.
 */
import { State } from '../../binah/State.js';
import { PathVisualizer } from '../../chochmah/PathVisualizer.js';
import { canPass, edgePortal, faceTile, transfer } from '../OhrWorld.js';
import { handleArrival } from '../OhrEncounter.js';

const directionVector = dir => ({
	u: { x: 0, y: -1 }, d: { x: 0, y: 1 },
	l: { x: -1, y: 0 }, r: { x: 1, y: 0 }
}[dir] || { x: 0, y: 1 });

export class HeroMovement {
	static pauseForUi() {
		State.clearPath();
		PathVisualizer.clear();
		State.releaseIntents();
		if (!State.Hero.moving) return;
		State.Hero.moving = false;
		State.Hero.stepTick = 0;
		State.Hero.dx = State.Hero.cx * State.Resolution;
		State.Hero.dy = State.Hero.cy * State.Resolution;
	}

	static cancelPath(reason = 'cancelled') {
		if (!State.HeroPath.length && !State.PathTarget) return;
		State.clearPath();
		PathVisualizer.clear();
		if (reason === 'manual-key') State.say('Manual movement took over.', 90);
	}

	static nextStep() {
		const intent = window.AwtsmoosIntents || {};
		if (intent.U) return { dx: 0, dy: -1, dir: 'u' };
		if (intent.D) return { dx: 0, dy: 1, dir: 'd' };
		if (intent.L) return { dx: -1, dy: 0, dir: 'l' };
		if (intent.R) return { dx: 1, dy: 0, dir: 'r' };
		const target = State.HeroPath?.[0];
		if (!target) return null;
		const dx = Math.sign(target.x - State.Hero.cx);
		const dy = Math.sign(target.y - State.Hero.cy);
		if (Math.abs(dx) + Math.abs(dy) !== 1) return this.cancelPath('broken-path');
		return { dx, dy, dir: dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u' };
	}

	static step(dx, dy, dir) {
		State.Hero.dir = dir;
		const x = State.Hero.cx + dx;
		const y = State.Hero.cy + dy;
		if (!canPass(x, y)) return this.blockedStep(x, y);
		State.Hero.moving = true;
		State.Hero.cx = x;
		State.Hero.cy = y;
	}

	static blockedStep(x, y) {
		this.cancelPath('blocked');
		const portal = edgePortal(x, y);
		if (portal) transfer(portal);
		else State.say('That way is blocked.', 120);
	}

	static animate() {
		const hero = State.Hero;
		const move = Math.min(State.Resolution - hero.stepTick, State.Speed * State.FrameDeltaScale);
		const vector = directionVector(hero.dir);
		hero.dx += vector.x * move;
		hero.dy += vector.y * move;
		hero.stepTick += move;
		if (hero.stepTick >= State.Resolution - 0.001) this.finishStep();
	}

	static finishStep() {
		const hero = State.Hero;
		hero.moving = false;
		hero.stepTick = 0;
		hero.dx = hero.cx * State.Resolution;
		hero.dy = hero.cy * State.Resolution;
		if (State.HeroPath?.[0]?.x === hero.cx && State.HeroPath?.[0]?.y === hero.cy) State.HeroPath.shift();
		if (!State.HeroPath.length && State.PathTarget?.faceOnly) {
			faceTile(State.PathTarget.x, State.PathTarget.y);
			State.say('Facing guide. Press Talk to open dialogue.', 180);
			return;
		}
		if (!State.HeroPath.length && State.PathTarget?.valid) State.PathTarget = null;
		handleArrival();
	}
}
