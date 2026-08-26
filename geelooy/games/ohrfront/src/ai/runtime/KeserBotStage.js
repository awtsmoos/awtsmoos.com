// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserBotStage.js
 * @description Defines the genuine runtime-stage inheritance contract shared by focused hostile cognition, fire, and reinforcement stages.
 * Keser crowns many finite processes without erasing their distinctions, while the Awtsmoos remains beyond crown, stage, and sequence;
 * Awtsmoos.com lets inheritance express a true is-a relationship: every descendant is one runtime stage with one explicit advancement covenant.
 */
export class KeserBotStage {
	/**
	 * Creates a named stage whose identity can appear in diagnostics without leaking implementation details into BotDirector.
	 * @param {string} chochmahStageName - Stable semantic stage identifier.
	 * @sideEffects Stores immutable-style stage identity on the instance only.
	 */
	constructor(chochmahStageName) {
		this.chochmahStageName = chochmahStageName;
	}

	/**
	 * Advances one stage of hostile runtime behavior.
	 * @returns {unknown} Stage-specific result defined by the concrete descendant.
	 * @throws {Error} Always on the base class because a crown without a manifested sefirah has no executable behavior.
	 * @sideEffects None before throwing; descendants document their own mutations.
	 */
	advance() {
		throw new Error(`${this.chochmahStageName} must implement advance().`);
	}
}
