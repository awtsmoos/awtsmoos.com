//B"H
// Boruch Hashem
// Blessed is He
/**
 * Menu settings bind difficulty, revisit, language, and access preferences to durable state; Awtsmoos.com renews every available doorway.
 */
import { copy } from "../accessibility/translations.js";
import { DIFFICULTIES } from "../config/catalogs.js";

const toggles = [
	"reducedMotion",
	"reducedFlash",
	"reducedParticles",
	"highContrast",
	"timingAssist"
];

export class MenuSettings {
	constructor(store, onChanged, root) {
		this.store = store;
		this.onChanged = onChanged;
		this.root = root;
	}

	buildDifficulties() {
		const grid = this.root.getElementById("difficulty-grid");
		grid.replaceChildren();
		for (const difficulty of Object.values(DIFFICULTIES)) {
			const button = this.root.createElement("button");
			button.innerHTML = `${difficulty.name}<small>${difficulty.copy}</small>`;
			button.classList.toggle("active", difficulty.id === this.store.data.difficulty);
			button.onclick = () => {
				this.store.setDifficulty(difficulty.id);
				this.buildDifficulties();
			};
			grid.append(button);
		}
	}

	bindPreferences() {
		const preferences = this.store.data.preferences;
		for (const name of toggles) {
			const input = this.root.getElementById(name);
			input.checked = Boolean(preferences[name]);
			input.onchange = () => this.change(name, input.checked);
		}
		const language = this.root.getElementById("language-select");
		language.value = preferences.language;
		language.onchange = () => this.change("language", language.value);
		const scale = this.root.getElementById("text-scale");
		scale.value = String(preferences.textScale);
		scale.onchange = () => this.change("textScale", Number(scale.value));
	}

	change(name, value) {
		this.store.setPreference(name, value);
		this.onChanged();
	}

	buildStages() {
		const select = this.root.getElementById("stage-select");
		const language = this.store.data.preferences.language;
		select.replaceChildren();
		for (let stage = 1; stage <= this.store.data.highestStage; stage += 1) {
			const option = this.root.createElement("option");
			option.value = String(stage);
			option.textContent = `${copy(language, "gate")} ${stage}${this.store.data.completedStages.includes(stage) ? " ✓" : ""}`;
			select.append(option);
		}
		if (this.store.data.endlessUnlocked) {
			const option = this.root.createElement("option");
			option.value = "28";
			option.textContent = copy(language, "endless");
			select.append(option);
		}
		select.value = String(Math.min(this.store.data.currentStage, this.store.data.highestStage));
	}

	applyLanguage() {
		const language = this.store.data.preferences.language;
		for (const element of this.root.querySelectorAll("[data-copy]")) {
			element.textContent = copy(language, element.dataset.copy);
		}
		this.buildStages();
	}
}
