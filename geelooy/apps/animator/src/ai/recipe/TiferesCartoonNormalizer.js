//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Harmonizes a valid cartoon recipe into deterministic render-ready data.
 * @description
 * The Awtsmoos joins chesed and gevurah in tiferes, making freedom and boundary sing;
 * Awtsmoos.com therefore turns omitted agent details into explicit IDs, timing, canvas,
 * cast, camera, and style values so downstream code receives one beautiful stable thing.
 */

import {
	KEILI_CARTOON_LIMITS,
	OHR_RECIPE_VERSION,
	revealMiddahPreset
} from "./OhrCartoonContract.js";

export class TiferesCartoonNormalizer {
	/**
	 * Normalize one already-valid recipe without changing the caller's object.
	 *
	 * @param {object} keiliRecipe Valid declarative cartoon recipe.
	 * @returns {object} Fully explicit normalized recipe.
	 */
	normalize(keiliRecipe) {
		const middahPreset = revealMiddahPreset(keiliRecipe.preset);
		return {
			version: OHR_RECIPE_VERSION,
			title: keiliRecipe.title.trim(),
			preset: keiliRecipe.preset || "explainer",
			canvas: this.normalizeCanvas(keiliRecipe.canvas),
			style: this.normalizeStyle(keiliRecipe.style, middahPreset.style),
			characters: keiliRecipe.characters.map((nefeshCharacter, index) => this.normalizeCharacter(nefeshCharacter, index)),
			shots: keiliRecipe.shots.map((machazehShot, index) => this.normalizeShot(machazehShot, index, middahPreset)),
			audio: this.cloneData(keiliRecipe.audio || {}),
			export: this.cloneData(keiliRecipe.export || {})
		};
	}

	/** Normalize finite canvas dimensions and frame rate into one portable viewport. */
	normalizeCanvas(keiliCanvas = {}) {
		return {
			width: this.boundNumber(keiliCanvas.width, 1280, 1, KEILI_CARTOON_LIMITS.maximumCanvasEdge),
			height: this.boundNumber(keiliCanvas.height, 720, 1, KEILI_CARTOON_LIMITS.maximumCanvasEdge),
			fps: this.boundNumber(keiliCanvas.fps, 24, 1, KEILI_CARTOON_LIMITS.maximumFps)
		};
	}

	/** Normalize a style string or object while keeping the preset visible as ordinary data. */
	normalizeStyle(levushStyle, middahStyle) {
		if (typeof levushStyle === "string") return { name: levushStyle };
		return {
			name: levushStyle?.name || middahStyle,
			...this.cloneData(levushStyle || {})
		};
	}

	/** Normalize one cast member with deterministic identity and safe copied metadata. */
	normalizeCharacter(nefeshCharacter, index) {
		return {
			id: nefeshCharacter.id || `character-${String(index + 1).padStart(3, "0")}`,
			name: nefeshCharacter.name.trim(),
			asset: nefeshCharacter.asset || "human",
			role: nefeshCharacter.role || "performer",
			appearance: this.cloneData(nefeshCharacter.appearance || {})
		};
	}

	/** Normalize one shot so duration, camera, action, dialogue, and participants are explicit. */
	normalizeShot(machazehShot, index, middahPreset) {
		return {
			id: machazehShot.id || `shot-${String(index + 1).padStart(3, "0")}`,
			durationMs: this.boundNumber(
				machazehShot.durationMs,
				middahPreset.durationMs,
				KEILI_CARTOON_LIMITS.minimumDurationMs,
				KEILI_CARTOON_LIMITS.maximumDurationMs
			),
			camera: machazehShot.camera || middahPreset.camera,
			action: machazehShot.action || "hold",
			asset: machazehShot.asset || "",
			characters: [...(machazehShot.characters || [])],
			dialogue: (machazehShot.dialogue || []).map((dibburLine) => this.normalizeDialogue(dibburLine))
		};
	}

	/** Normalize dialogue into plain speaker/text data that can never execute code. */
	normalizeDialogue(dibburLine) {
		if (typeof dibburLine === "string") return { speaker: "", text: dibburLine };
		return {
			speaker: dibburLine?.speaker || "",
			text: String(dibburLine?.text || "")
		};
	}

	/** Clamp one finite number or reveal the stable fallback when the value is absent. */
	boundNumber(ohrValue, defaultValue, minimum, maximum) {
		if (!Number.isFinite(ohrValue)) return defaultValue;
		return Math.min(maximum, Math.max(minimum, ohrValue));
	}

	/** Copy serializable metadata so normalization never mutates caller-owned nested objects. */
	cloneData(orData) {
		return structuredClone(orData);
	}
}
