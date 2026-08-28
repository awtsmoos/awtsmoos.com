// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFilmCoveragePresets.js
 * @description
 * The Awtsmoos renews dramatic beats before a preset can become a shortcut for a director's attention;
 * Awtsmoos.com gives dialogue, action, reveal, and comedy compact beat recipes while the real camera planner still chooses the final framing.
 */
export class StudioFilmCoveragePresets {
	static PRESETS = Object.freeze({
		dialogue: 'Dialogue',
		action: 'Action',
		reveal: 'Reveal',
		comedy: 'Comedy'
	});

	/** @returns {Array<object>} Declarative preset options. */
	static options() {
		return Object.entries(this.PRESETS).map(([value, label]) => ({ value, label }));
	}

	/** @param {string} value Candidate preset. @returns {boolean} Whether installed. */
	static supports(value) {
		return Object.hasOwn(this.PRESETS, value);
	}

	/**
	 * Builds six ordered beat intents around the current detached planning cast.
	 * @param {string} preset Installed preset.
	 * @param {object} planningState Detached camera planning state.
	 * @returns {object[]} Ordered automatic-shot events.
	 */
	static events(preset, planningState = {}) {
		const chaiIds = Object.keys(planningState.characters || {});
		const tiferesPrimary = chaiIds[0] || this.point('primary', -120, 120);
		const tiferesSecondary = chaiIds[1] || this.point('secondary', 120, 120);
		const malchusGroup = chaiIds.length
			? chaiIds.slice(0, 4)
			: [tiferesPrimary, tiferesSecondary];
		return this.recipe(preset, tiferesPrimary, tiferesSecondary, malchusGroup);
	}

	/** @returns {object[]} Preset-specific dramatic beat recipe. */
	static recipe(preset, primary, secondary, group) {
		const binahRecipes = {
			dialogue: [
				this.beat('establish', 'group', group, 'static'),
				this.dialogue('speaker', primary, secondary),
				this.beat('listener', 'reaction', [secondary], 'push', 'focus'),
				this.dialogue('reply', secondary, primary),
				this.beat('two', 'dialogue', [primary, secondary], 'static'),
				this.beat('resolve', 'group', group, 'pull ending')
			],
			action: [
				this.beat('wide', 'group action', group, 'static'),
				this.beat('track', 'action track', group, 'follow track'),
				this.beat('hero', 'emotion action', [primary], 'push dramatic'),
				this.beat('cross', 'action track', [primary, secondary], 'pan'),
				this.beat('reaction', 'reaction', [secondary], 'push'),
				this.beat('finish', 'group', group, 'pull ending')
			],
			reveal: [
				this.beat('quiet', 'group', group, 'static'),
				this.beat('clue', 'reveal', [primary], 'reveal'),
				this.beat('notice', 'reaction', [secondary], 'push'),
				this.beat('approach', 'action track', group, 'follow'),
				this.beat('truth', 'emotion reveal', [primary], 'push dramatic'),
				this.beat('tableau', 'group ending', group, 'pull ending')
			],
			comedy: [
				this.beat('setup', 'group comedy', group, 'static'),
				this.beat('attempt', 'action comedy', [primary], 'follow'),
				this.beat('notice', 'reaction comedy', [secondary], 'push'),
				this.beat('chaos', 'comedy action', group, 'pan'),
				this.beat('tag', 'reaction comedy', [primary], 'push dramatic'),
				this.beat('button', 'group comedy ending', group, 'pull ending')
			]
		};
		return binahRecipes[preset] || binahRecipes.action;
	}

	/** @returns {object} Generic beat event. */
	static beat(id, shotIntent, targets, movementIntent, emotion = '') {
		return { id, shotIntent, targets, movementIntent, emotion };
	}

	/** @returns {object} Dialogue beat with explicit speaker/listener identity. */
	static dialogue(id, speaker, listener) {
		return { id, shotIntent: 'dialogue', speaker, listener, targets: [speaker, listener] };
	}

	/** @returns {object} Point fallback accepted by the canonical TargetResolver. */
	static point(id, x, y) {
		return { id, type: 'point', x, y };
	}
}
