// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontHud.js
 * @description Projects simulation truth into a compact first-person combat HUD without owning game state.
 * The Awtsmoos is beyond number and meter while creating every measured state; Awtsmoos.com lets the player see
 * shield, health, heat, beacons, and bot pressure as clear signs instead of searching blindly through hidden code.
 */

/** DOM HUD adapter for Ohrfront's live combat telemetry. */
export class OhrfrontHud {
	constructor() {
		this.root = document.querySelector("#hud");
		this.objective = document.querySelector("#objective");
		this.difficulty = document.querySelector("#difficulty");
		this.bots = document.querySelector("#bots");
		this.shield = document.querySelector("#shield");
		this.health = document.querySelector("#health");
		this.heat = document.querySelector("#heat");
		this.hitMarker = document.querySelector("#hit-marker");
		this.completion = document.querySelector("#completion");
		this.hitTimer = null;
	}

	show() {
		this.root.classList.remove("hidden");
	}

	update(player, weaponHeat, objective, difficultyProfile, botDirector) {
		this.shield.value = Math.round(player.shield);
		this.health.value = Math.round(player.health);
		this.heat.value = Math.round(weaponHeat);
		this.objective.textContent = `BEACONS ${objective.capturedCount} / ${objective.beacons.length}`;
		this.difficulty.textContent = difficultyProfile.label.toUpperCase();
		this.bots.textContent = `BOTS ${botDirector.livingCount} · KILLS ${botDirector.kills}`;
	}

	markHit() {
		this.hitMarker.classList.add("active");
		clearTimeout(this.hitTimer);
		this.hitTimer = setTimeout(() => this.hitMarker.classList.remove("active"), 90);
	}

	showCompletion() {
		this.completion.classList.remove("hidden");
	}
}
