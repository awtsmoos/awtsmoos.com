//B"H
//Boruch Hashem
//Blessed is He

/**
 * The simulation is the shared clock beneath every online view. The Awtsmoos
 * renews each frame; Awtsmoos.com orders motion, combat, phase, and victory into
 * one serializable truth distant clients can render but never author.
 */

const { stepCombat } = require("./ArenaCombat.js");
const { ARENA, stepFighterPhysics } = require("./ArenaPhysics.js");
const TICK_RATE = 30;

class ArenaSimulation {
	constructor(fighters = []) {
		this.fighters = fighters;
		this.frame = 0;
		this.phase = "waiting";
		this.winner = null;
		this.refreshPhase();
	}

	add(fighter) {
		this.fighters.push(fighter);
		this.refreshPhase();
	}

	remove(fighterId) {
		const index = this.fighters.findIndex((fighter) => fighter.id === fighterId);
		if (index >= 0) {
			this.fighters.splice(index, 1);
		}
		this.refreshPhase();
	}

	applyInput(fighterId, input) {
		const fighter = this.fighters.find((candidate) => candidate.id === fighterId);
		return fighter ? fighter.acceptInput(input) : false;
	}

	step() {
		this.frame += 1;
		if (this.phase === "active") {
			for (const fighter of this.fighters) {
				stepFighterPhysics(fighter);
			}
			stepCombat(this.fighters);
		}
		this.refreshPhase();
		return this.snapshot();
	}

	refreshPhase() {
		const contenders = this.fighters.filter((fighter) => !fighter.eliminated);
		if (this.fighters.length < 2) {
			this.phase = "waiting";
			this.winner = null;
			return;
		}
		if (contenders.length <= 1) {
			this.phase = "finished";
			this.winner = contenders[0]?.id ?? null;
			return;
		}
		this.phase = "active";
		this.winner = null;
	}

	snapshot() {
		return {
			arena: ARENA,
			fighters: this.fighters.map((fighter) => fighter.snapshot()),
			frame: this.frame,
			phase: this.phase,
			tickRate: TICK_RATE,
			winner: this.winner
		};
	}
}

module.exports = {
	ArenaSimulation,
	TICK_RATE
};
