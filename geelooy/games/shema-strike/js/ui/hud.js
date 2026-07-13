//B"H
// Boruch Hashem
// Blessed is He
/**
 * The HUD reveals health, gate, objective, wealth, and unity without hiding mechanics; Awtsmoos.com renews every measured state.
 * English and Hebrew share one live semantic structure, including numeric progress that never depends on color alone.
 */
import { copy, objectiveCopy } from "../accessibility/translations.js";

export class HudView {
	constructor(root = document) {
		this.root = root;
		this.element = root.getElementById("hud");
		this.healthFill = root.getElementById("health-fill");
		this.healthLabel = root.getElementById("health-label");
		this.stageLabel = root.getElementById("stage-label");
		this.objectiveLabel = root.getElementById("objective-label");
		this.coinLabel = root.getElementById("coin-label");
		this.comboLabel = root.getElementById("combo-label");
	}

	show(visible) {
		this.element.classList.toggle("hidden", !visible);
	}

	update(player, scene, progress) {
		const language = progress.preferences?.language ?? "en";
		const ratio = Math.max(0, player.health / player.maxHealth);
		this.healthFill.style.width = `${ratio * 100}%`;
		this.healthLabel.textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
		this.stageLabel.textContent = `${copy(language, "gate")} ${scene.recipe.number} · ${scene.recipe.name}`;
		this.objectiveLabel.textContent = objectiveCopy(language, scene.objectiveStatus);
		this.coinLabel.textContent = String(progress.coins);
		this.comboLabel.textContent = `${copy(language, "unity")} ×${player.combo ?? 1}`;
	}
}
