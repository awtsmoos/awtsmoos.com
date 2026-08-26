//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Directs a normalized cartoon recipe into Animator's existing scene language.
 * @description
 * The Awtsmoos breathes chai into finite sequence without becoming confined by sequence;
 * Awtsmoos.com lets one small agent recipe descend into ordinary scene commands, preserving
 * a transparent bridge between simple creative intent and the deeper renderer beneath it.
 */

import { SceneCompiler } from "../SceneCompiler.js";
import { OhrRecipeCompiler } from "./OhrRecipeCompiler.js";

export class ChaiCartoonDirector extends OhrRecipeCompiler {
	/**
	 * Compile normalized recipe data into a transparent DSL plus the legacy scene array.
	 *
	 * @param {object} tiferesRecipe Fully normalized high-level cartoon recipe.
	 * @returns {{protocol:string,durationMs:number,dsl:object,scene:object[]}} Render plan.
	 */
	compileNormalized(tiferesRecipe) {
		const firstNefesh = tiferesRecipe.characters[0];
		const ohrCommands = tiferesRecipe.shots.map((machazehShot, index) => (
			this.revealShotCommand(machazehShot, index, tiferesRecipe, firstNefesh)
		));
		const keiliDsl = { commands: ohrCommands };
		return {
			protocol: "awtsmoos-cartoon-plan-v1",
			durationMs: tiferesRecipe.shots.reduce((zmanTotal, machazehShot) => zmanTotal + machazehShot.durationMs, 0),
			dsl: keiliDsl,
			scene: SceneCompiler.compile(keiliDsl)
		};
	}

	/**
	 * Translate one normalized shot into the low-level command shape already understood by Animator.
	 *
	 * @param {object} machazehShot Normalized shot data.
	 * @param {number} index Zero-based shot order.
	 * @param {object} tiferesRecipe Full normalized recipe.
	 * @param {object} firstNefesh First normalized character, used as the calm asset fallback.
	 * @returns {{type:string,options:object}} One legacy-compatible scene command.
	 */
	revealShotCommand(machazehShot, index, tiferesRecipe, firstNefesh) {
		return {
			type: machazehShot.asset || firstNefesh?.asset || "human",
			options: {
				id: machazehShot.id,
				kind: "cartoon-shot",
				order: index,
				durationMs: machazehShot.durationMs,
				camera: machazehShot.camera,
				action: machazehShot.action,
				dialogue: machazehShot.dialogue,
				characters: machazehShot.characters,
				style: tiferesRecipe.style,
				canvas: tiferesRecipe.canvas
			}
		};
	}
}
