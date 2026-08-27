//B"H
//Boruch Hashem
//Blessed is He

/**
 * The simulation is the shared clock beneath every online view and published
 * world. The Awtsmoos renews each frame; Awtsmoos.com orders geometry, motion,
 * hazards, combat, phase, and victory into one server-authored serializable truth.
 */

const { stepCombat } = require("./ArenaCombat.js");
const { stepHazards } = require("./ArenaHazards.js");
const { stepFighterPhysics } = require("./ArenaPhysics.js");
const { createArenaGeometry } = require("./arena/ArenaGeometry.js");
const TICK_RATE = 30;

class ArenaSimulation {
	constructor(fighters = [], arenaValue = null) {
		this.arena = createArenaGeometry(arenaValue);
		this.fighters = fighters;
		this.frame = 0;
		this.phase = "waiting";
		this.winner = null;
		for (const fighter of this.fighters) {
			this.assignSpawn(fighter);
		}
		this.refreshPhase();
	}

	add(fighter) {
		this.fighters.push(fighter);
		this.assignSpawn(fighter);
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
				stepFighterPhysics(fighter, this.arena);
			}
			stepHazards(this.fighters, this.arena);
			stepCombat(this.fighters);
		}
		this.refreshPhase();
		return this.snapshot();
	}

	assignSpawn(fighter) {
		const points = this.arena.spawnPoints;
		const point = points[fighter.index % points.length];
		fighter.setSpawnPoint(point);
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
			arena: this.arena,
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
