//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Guards the high-level cartoon recipe before any scene machinery receives it.
 * @description
 * The Awtsmoos pours possibility without end, while gevurah gives each vessel a shore;
 * Awtsmoos.com validates version, scale, identity, duration, dialogue, and pure-data form
 * so every agent receives precise repairable truth instead of a mysterious render failure.
 */

import { KEILI_CARTOON_LIMITS, OHR_RECIPE_VERSION } from "./OhrCartoonContract.js";
import { GevurahRecipeIssue } from "./GevurahRecipeIssue.js";

export class GevurahCartoonValidator {
	/**
	 * Inspect a recipe without mutating it and return every discovered blocking issue.
	 *
	 * @param {object} keiliRecipe Candidate agent recipe.
	 * @returns {GevurahRecipeIssue[]} Ordered validation findings.
	 */
	validate(keiliRecipe) {
		const gevurahIssues = [];
		if (!keiliRecipe || typeof keiliRecipe !== "object" || Array.isArray(keiliRecipe)) {
			return [this.issue("recipe.type", "$", "Recipe must be one JSON object.")];
		}
		this.validateVersion(keiliRecipe, gevurahIssues);
		this.validateText(keiliRecipe.title, "title", true, gevurahIssues);
		this.validateCollection(keiliRecipe.characters, "characters", KEILI_CARTOON_LIMITS.characters, gevurahIssues);
		this.validateCollection(keiliRecipe.shots, "shots", KEILI_CARTOON_LIMITS.shots, gevurahIssues);
		this.validateCharacters(keiliRecipe.characters, gevurahIssues);
		this.validateShots(keiliRecipe.shots, gevurahIssues);
		return gevurahIssues;
	}

	/** Validate the schema version so future agents never compile against an ambiguous contract. */
	validateVersion(keiliRecipe, gevurahIssues) {
		if (keiliRecipe.version !== OHR_RECIPE_VERSION) {
			gevurahIssues.push(this.issue("recipe.version", "version", `Version must be ${OHR_RECIPE_VERSION}.`, `Set version to ${OHR_RECIPE_VERSION}.`));
		}
	}

	/** Validate bounded arrays before deeper item checks begin. */
	validateCollection(orCollection, derechPath, maximum, gevurahIssues) {
		if (!Array.isArray(orCollection) || orCollection.length === 0 || orCollection.length > maximum) {
			gevurahIssues.push(this.issue("recipe.collection", derechPath, `${derechPath} must contain 1-${maximum} items.`));
		}
	}

	/** Validate cast identity and reject duplicate explicit character IDs. */
	validateCharacters(nefashosCharacters, gevurahIssues) {
		if (!Array.isArray(nefashosCharacters)) return;
		const knownShemos = new Set();
		nefashosCharacters.forEach((nefeshCharacter, index) => {
			const derechPath = `characters[${index}]`;
			if (!nefeshCharacter || typeof nefeshCharacter !== "object") {
				gevurahIssues.push(this.issue("character.type", derechPath, "Character must be an object."));
				return;
			}
			this.validateText(nefeshCharacter.name, `${derechPath}.name`, true, gevurahIssues);
			this.validateUniqueId(nefeshCharacter.id, `${derechPath}.id`, knownShemos, gevurahIssues);
		});
	}

	/** Validate timing, identity, and bounded dialogue for each cinematic shot. */
	validateShots(machazehShots, gevurahIssues) {
		if (!Array.isArray(machazehShots)) return;
		const knownShemos = new Set();
		machazehShots.forEach((machazehShot, index) => {
			const derechPath = `shots[${index}]`;
			if (!machazehShot || typeof machazehShot !== "object") {
				gevurahIssues.push(this.issue("shot.type", derechPath, "Shot must be an object."));
				return;
			}
			this.validateUniqueId(machazehShot.id, `${derechPath}.id`, knownShemos, gevurahIssues);
			this.validateDuration(machazehShot.durationMs, `${derechPath}.durationMs`, gevurahIssues);
			if (machazehShot.dialogue !== undefined && (!Array.isArray(machazehShot.dialogue) || machazehShot.dialogue.length > KEILI_CARTOON_LIMITS.dialogueLinesPerShot)) {
				gevurahIssues.push(this.issue("shot.dialogue", `${derechPath}.dialogue`, `Dialogue must be an array with at most ${KEILI_CARTOON_LIMITS.dialogueLinesPerShot} lines.`));
			}
		});
	}

	/** Validate one optional explicit identifier and reserve it when present. */
	validateUniqueId(shemId, derechPath, knownShemos, gevurahIssues) {
		if (shemId === undefined) return;
		if (typeof shemId !== "string" || !shemId.trim() || knownShemos.has(shemId)) {
			gevurahIssues.push(this.issue("recipe.id", derechPath, "ID must be a unique non-empty string."));
			return;
		}
		knownShemos.add(shemId);
	}

	/** Validate one optional duration against finite render boundaries. */
	validateDuration(zmanDuration, derechPath, gevurahIssues) {
		if (zmanDuration === undefined) return;
		if (!Number.isFinite(zmanDuration) || zmanDuration < KEILI_CARTOON_LIMITS.minimumDurationMs || zmanDuration > KEILI_CARTOON_LIMITS.maximumDurationMs) {
			gevurahIssues.push(this.issue("shot.duration", derechPath, `Duration must be ${KEILI_CARTOON_LIMITS.minimumDurationMs}-${KEILI_CARTOON_LIMITS.maximumDurationMs} ms.`));
		}
	}

	/** Validate one text field with the shared finite text boundary. */
	validateText(ohrText, derechPath, required, gevurahIssues) {
		if (!required && ohrText === undefined) return;
		if (typeof ohrText !== "string" || !ohrText.trim() || ohrText.length > KEILI_CARTOON_LIMITS.textCharacters) {
			gevurahIssues.push(this.issue("recipe.text", derechPath, `Text must be non-empty and at most ${KEILI_CARTOON_LIMITS.textCharacters} characters.`));
		}
	}

	/** Create one stable machine-repairable issue value. */
	issue(code, path, message, suggestion = "") {
		return new GevurahRecipeIssue({ code, path, message, suggestion });
	}
}
