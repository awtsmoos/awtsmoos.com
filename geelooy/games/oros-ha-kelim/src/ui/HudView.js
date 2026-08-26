//B"H
//Boruch Hashem
//Blessed is He

import { PLANES } from "../config/gameConfig.js";
import { OlamAffinity } from "../game/OlamAffinity.js";
import { TikkunFormat } from "./TikkunFormat.js";
import { TikkunMeasure } from "./TikkunMeasure.js";

/**
 * HudView keeps only glanceable world, time, Tikkun and Ohr truth visible above the larger arena.
 * The Awtsmoos renews number and moment while the half-kilometer world stays primary to the eye;
 * Awtsmoos.com lets tiny beginnings remain readable without turning the compact HUD into a data sky.
 */
export class HudView {
	constructor(root = document) {
		this.plane = root.getElementById("hud-plane");
		this.time = root.getElementById("hud-time");
		this.territory = root.getElementById("hud-territory");
		this.territoryFill = root.getElementById("hud-territory-fill");
		this.energy = root.getElementById("hud-energy");
		this.energyFill = root.getElementById("hud-energy-fill");
		this.toast = root.getElementById("hud-toast");
		this.toastUntil = 0;
		this.lastToastKey = "";
	}

	sync(match, events = []) {
		const player = match.player();
		const plane = PLANES[player.plane] || PLANES[0];
		const affinity = OlamAffinity.forPlane(player.plane);
		const territoryCount = match.ledger.territoryCount(player.id);
		const share = TikkunMeasure.percentage(territoryCount);
		this.plane.textContent = `${plane.name} · ${affinity.label}`;
		this.time.textContent = this.#clock(match.remainingSeconds());
		this.territory.textContent = TikkunFormat.percentage(share);
		this.territoryFill.style.width = `${share}%`;
		this.energy.textContent = `${Math.round(player.energy)}%`;
		this.energyFill.style.width = `${Math.min(100, Math.max(0, player.energy))}%`;
		this.#toast(player, affinity, events);
	}

	#toast(player, affinity, events) {
		const latest = [...events].reverse().find((event) => event.riderId === player.id || event.type === "round-end");
		const key = latest ? `${latest.tick}:${latest.type}:${latest.riderId || "round"}` : "";
		if (latest && key !== this.lastToastKey) {
			this.lastToastKey = key;
			this.toast.textContent = this.#message(latest, affinity);
			this.toastUntil = this.#now() + 1700;
		}
		this.toast.dataset.visible = String(Boolean(this.toast.textContent) && this.#now() < this.toastUntil);
	}

	#message(event, affinity) {
		if (event.type === "claim") {
			return `${event.cells} Kelim settled`;
		}
		if (event.type === "gate") {
			return `${affinity.world} · ${affinity.description}`;
		}
		if (event.type === "shatter") {
			return "Keli shattered · gathering sparks";
		}
		if (event.type === "respawn") {
			return "Keli restored";
		}
		if (event.type === "energy" && event.boosted) {
			return `${affinity.label} boost · ${event.boostCost} Ohr`;
		}
		if (event.type === "round-end") {
			return "The Tikkun is measured";
		}
		return "";
	}

	#clock(seconds) {
		const wholeSeconds = Math.max(0, Math.ceil(Number(seconds) || 0));
		const minutes = Math.floor(wholeSeconds / 60);
		return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
	}

	#now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}
}
