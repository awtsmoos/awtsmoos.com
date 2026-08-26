//B"H
//Boruch Hashem
//Blessed is He

import { GateSystem } from "./GateSystem.js";
import { MovementSystem } from "./MovementSystem.js";
import { NekudahSystem } from "./NekudahSystem.js";
import { TrailSystem } from "./TrailSystem.js";

/**
 * SimulationPulse owns one rider's deterministic movement law while SimulationEngine conducts the multi-rider choir.
 * The Awtsmoos renews step, trail, Yesod, and Nekudah in one ordered breath; Awtsmoos.com keeps that order explicit and testable.
 */
export class SimulationPulse {
	/** @param {object} match MatchState. @param {object} energy Shared EnergySystem. @param {object} writer SimulationEventWriter. */
	constructor(match, energy, writer) {
		this.match = match;
		this.yesodEnergy = energy;
		this.yesodEvents = writer;
		this.movement = new MovementSystem();
		this.trails = new TrailSystem(match.ledger);
		this.gates = new GateSystem(match.ledger);
		this.nekudot = new NekudahSystem(energy);
	}

	/**
	 * Advances one living rider through energy, movement, optional boost, trail, gate, and landmark laws.
	 * @param {object} rider Mutable authoritative rider state.
	 * @param {{turn?:number,boost?:boolean}} intent Controller intention already chosen by player/bot logic.
	 * @returns {void}
	 */
	advance(rider, intent) {
		rider.motion.beginPulse();
		const sheltered = this.match.ledger.ownerAt(rider.plane, rider.x, rider.z) === rider.id;
		const shefaEnergy = this.yesodEnergy.resolve(rider, Boolean(intent.boost), sheltered);
		this.#recordEnergy(rider, shefaEnergy);
		this.#advanceStep(rider, Number(intent.turn) || 0);
		if (shefaEnergy.boosted && rider.alive) {
			this.#advanceStep(rider, 0);
		}
	}

	/**
	 * Advances respawn timing through TrailSystem and reports whether rebirth occurred this pulse.
	 * @param {object} rider Mutable rider state.
	 * @returns {boolean} True only when the rider was reset now.
	 */
	respawn(rider) {
		return this.trails.respawnTick(rider);
	}

	/**
	 * Applies one shatter path shared by movement, trail, and multi-rider head collisions.
	 * @param {object} rider Mutable authoritative rider state.
	 * @param {string} cause Stable shatter cause.
	 * @returns {boolean} False when rider was already shattered; otherwise true.
	 */
	shatter(rider, cause) {
		if (!rider.alive) {
			return false;
		}
		rider.boosting = false;
		rider.speedState = "cruise";
		this.trails.shatter(rider);
		this.yesodEvents.record("shatter", { riderId: rider.id, cause, cell: rider.cell() });
		return true;
	}

	/**
	 * Performs one cell advance and every law that follows successful arrival in deterministic order.
	 * @param {object} rider Mutable rider state.
	 * @param {number} turn Requested turn delta for this sub-step.
	 * @returns {void}
	 */
	#advanceStep(rider, turn) {
		const shefaMove = this.movement.move(rider, turn);
		if (shefaMove.collision) {
			this.shatter(rider, shefaMove.collision);
			return;
		}
		rider.motion.commit(rider.cell(), rider.heading, turn);
		this.yesodEvents.record("move", { riderId: rider.id, from: shefaMove.previous, to: rider.cell() });
		const shefaTrail = this.trails.afterMove(rider, shefaMove.previous);
		if (shefaTrail.collision) {
			this.shatter(rider, "trail");
			return;
		}
		if (shefaTrail.claimed) this.yesodEvents.record("claim", { riderId: rider.id, cells: shefaTrail.claimed });
		const shefaGate = this.gates.transferIfNeeded(rider, this.match.tick);
		if (shefaGate) {
			rider.motion.snap(rider.cell(), rider.heading);
			this.yesodEvents.record("gate", shefaGate);
		}
		const shefaNekudah = this.nekudot.contactFor(rider, this.match.tick);
		if (shefaNekudah) this.yesodEvents.record("nekudah", shefaNekudah);
	}

	/** @param {object} rider Rider state. @param {object} result Energy transition. @returns {void} */
	#recordEnergy(rider, result) {
		if (result.before !== result.after || result.boosted) this.yesodEvents.record("energy", { riderId: rider.id, ...result });
	}
}
