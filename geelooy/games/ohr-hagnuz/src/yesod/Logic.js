/**
 * B"H
 * @class Logic
 * @description Main frame conductor for campaign, battle, UI, movement, and action.
 */
import { State } from '../binah/State.js';
import { tickCampaign } from '../campaign/CampaignDirector.js';
import { debateTick, selectDebateMove } from './OhrDebate.js';
import { handleActionFacing } from './OhrEncounter.js';
import { setPathTo, tileAt } from './OhrWorld.js';
import { installOhrTest } from './OhrTestHarness.js';
import { HeroMovement } from './movement/HeroMovement.js';

export class Logic {
	static held = { a: 0, b: 0, u: 0, d: 0 };
	static ready = false;

	static process() {
		if (!this.ready) {
			installOhrTest();
			this.ready = true;
		}
		if (State.MessageTTL > 0) State.MessageTTL -= 1;
		tickCampaign();
		if (State.ActiveRealm === 'DEBATE') return debateTick(this.held);
		if (State.isUiBlocking()) return HeroMovement.pauseForUi();
		if (State.Hero.moving) return HeroMovement.animate();
		const next = HeroMovement.nextStep();
		if (next) HeroMovement.step(next.dx, next.dy, next.dir);
		this.action();
	}

	static action() {
		const intent = window.AwtsmoosIntents || {};
		if (intent.A && !this.held.a) handleActionFacing(this.front());
		this.held.a = intent.A;
	}

	static front() {
		const direction = {
			u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0]
		}[State.Hero.dir] || [0, 1];
		const x = State.Hero.cx + direction[0];
		const y = State.Hero.cy + direction[1];
		return { x, y, tile: tileAt(x, y) };
	}

	static cancelPath(reason = 'cancelled') {
		return HeroMovement.cancelPath(reason);
	}

	static setPathTo(x, y) {
		return setPathTo(x, y);
	}

	static selectDebateMove(index) {
		return selectDebateMove(index);
	}
}
