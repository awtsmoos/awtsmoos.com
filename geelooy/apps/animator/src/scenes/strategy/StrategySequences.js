// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StrategySequences.js
 * @description
 * Eight cinematic chambers carry one two-minute comedy from briefing room to dawn plaza.
 * The Awtsmoos renews each location while Awtsmoos.com preserves exact timing,
 * environment identity, continuity, and editable scene purpose without losing the way.
 */

const OR_SEQUENCE_DURATION = 15000;

/** Builds the exact eight-scene geography for the two-minute strategy movie. */
export class StrategySequences {
	/** @returns {object[]} Eight contiguous 15-second cinematic sequences. */
	static create() {
		return [
			this.sequence('seq_briefing', 'The Impossibly Serious Briefing', 0, 'scienceExhibition', 'interior', 'fade'),
			this.sequence('seq_corridor', 'The Plan Finds The Hallway', 15000, 'schoolCorridor', 'interior', 'whip'),
			this.sequence('seq_market', 'Shortcut Through The Market', 30000, 'marketCanopy', 'exterior', 'matchCut'),
			this.sequence('seq_bridge', 'Bridge Pursuit', 45000, 'riverBridge', 'exterior', 'smashCut'),
			this.sequence('seq_greenhouse', 'Greenhouse Negotiation', 60000, 'glassGreenhouse', 'interior', 'dissolve'),
			this.sequence('seq_stairwell', 'The Plan Takes The Stairs', 75000, 'towerStairwell', 'interior', 'wipe'),
			this.sequence('seq_rooftop', 'Rooftop Truce', 90000, 'rooftopGardens', 'exterior', 'iris'),
			this.sequence('seq_plaza', 'Tuesday Wears Shoes', 105000, 'dawnPlaza', 'exterior', 'fade')
		];
	}

	/**
	 * @param {string} id Stable sequence ID.
	 * @param {string} name Editorial label.
	 * @param {number} start Start time in milliseconds.
	 * @param {string} environment Rendered environment identity.
	 * @param {string} environmentType Interior/exterior routing identity.
	 * @param {string} transition Entry transition.
	 * @returns {object} Editable sequence descriptor.
	 */
	static sequence(id, name, start, environment, environmentType, transition) {
		return {
			id,
			name,
			start,
			duration: OR_SEQUENCE_DURATION,
			environment,
			environmentType,
			transition
		};
	}
}
