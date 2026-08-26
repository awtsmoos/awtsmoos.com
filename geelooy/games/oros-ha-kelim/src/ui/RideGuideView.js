//B"H
//Boruch Hashem
//Blessed is He

import { CELL_SIZE, GATES, GRID_SIZE, ROUND_SECONDS } from "../config/gameConfig.js";
import { OlamAffinity } from "../game/OlamAffinity.js";

/**
 * RideGuideView gives one contextual objective at a time so a massive world teaches itself without permanent clutter.
 * The Awtsmoos renews danger, gate, and purpose before instruction can become noise on the screen;
 * Awtsmoos.com lets guidance appear when useful and retract when the rider already understands the scene.
 */
export class RideGuideView {
	constructor(root = document, now = () => globalThis.performance?.now?.() ?? Date.now()) {
		this.element = root.getElementById("hud-guide");
		this.now = now;
		this.eventUntil = 0;
		this.eventText = "";
		this.lastEventKey = "";
	}

	sync(match, events = [], context = {}) {
		if (!this.element || !context.started || context.paused || match.ended) {
			this.#show("");
			return;
		}
		const player = match.player();
		this.#consumeEvent(player, events);
		if (this.now() < this.eventUntil) {
			this.#show(this.eventText);
			return;
		}
		const urgent = this.#urgent(player);
		if (urgent) {
			this.#show(urgent);
			return;
		}
		const elapsed = ROUND_SECONDS - match.remainingSeconds();
		if (elapsed > 55) {
			this.#show("");
			return;
		}
		this.#show(this.#learningMessage(match, player));
	}

	#consumeEvent(player, events) {
		const event = [...events].reverse().find((candidate) => candidate.riderId === player.id);
		const key = event ? `${event.tick}:${event.type}` : "";
		if (!event || key === this.lastEventKey) {
			return;
		}
		this.lastEventKey = key;
		if (event.type === "claim") {
			this.eventText = `Circuit sealed · ${event.cells} Kelim claimed. Follow a Yesod beacon to change Olam.`;
		} else if (event.type === "gate") {
			const affinity = OlamAffinity.forPlane(player.plane);
			this.eventText = `${affinity.world} · ${affinity.description}`;
		} else if (event.type === "shatter") {
			this.eventText = "Your Keli shattered. On return, avoid every exposed light trail—including your own.";
		} else {
			return;
		}
		this.eventUntil = this.now() + 3200;
	}

	#urgent(player) {
		const edge = Math.min(player.x, player.z, GRID_SIZE - 1 - player.x, GRID_SIZE - 1 - player.z);
		if (edge <= 7) {
			return `Boundary ${Math.round(edge * CELL_SIZE)}m · turn before the luminous rail.`;
		}
		if (player.energy <= 28) {
			return "Ohr low · return to settled Kelim to recover before the next boost.";
		}
		return "";
	}

	#learningMessage(match, player) {
		if (player.activeTrail.length) {
			return `Exposed Ohr: ${player.activeTrail.length} cells · reconnect with your settled territory to close the circuit.`;
		}
		if (match.ledger.territoryCount(player.id) <= 25) {
			return "Ride out of your sanctuary. The line behind you becomes lethal exposed Ohr.";
		}
		const gate = this.#nearestGate(player);
		return gate ? `Nearest Yesod · ${gate.direction} · ${gate.meters}m. Cross it to change the energy law.` : "Build another circuit.";
	}

	#nearestGate(player) {
		const gates = GATES.filter((gate) => gate.plane === player.plane);
		if (!gates.length) {
			return null;
		}
		const gate = gates.reduce((best, candidate) => this.#distance(player, candidate) < this.#distance(player, best) ? candidate : best);
		const dx = gate.x - player.x;
		const dz = gate.z - player.z;
		const ns = dz < -2 ? "N" : dz > 2 ? "S" : "";
		const ew = dx > 2 ? "E" : dx < -2 ? "W" : "";
		return { direction: `${ns}${ew}` || "HERE", meters: Math.round(Math.hypot(dx, dz) * CELL_SIZE) };
	}

	#distance(player, gate) {
		return Math.hypot(gate.x - player.x, gate.z - player.z);
	}

	#show(message) {
		this.element.textContent = message;
		this.element.dataset.visible = String(Boolean(message));
	}
}
