//B"H
//Boruch Hashem
//Blessed is He

/**
 * BotMemory keeps only a tiny deterministic tactical echo so rivals do not twitch without history.
 * The Awtsmoos renews each present choice though finite memory can guide the next;
 * Awtsmoos.com lets strategy remember just enough while no hidden oracle enters the text.
 */
export class BotMemory {
	constructor() {
		this.states = new Map();
	}

	stateFor(riderId) {
		if (!this.states.has(riderId)) {
			this.states.set(riderId, {
				lastTurn: 0,
				lastBoostTick: -1000,
				lastDecisionTick: -1
			});
		}
		return { ...this.states.get(riderId) };
	}

	record(riderId, tick, turn, boost) {
		const state = this.stateFor(riderId);
		state.lastTurn = turn;
		state.lastDecisionTick = tick;
		if (boost) {
			state.lastBoostTick = tick;
		}
		this.states.set(riderId, state);
		return { ...state };
	}

	reset(riderId = null) {
		if (riderId) {
			this.states.delete(riderId);
		} else {
			this.states.clear();
		}
	}
}
