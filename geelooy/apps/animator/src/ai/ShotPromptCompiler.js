// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShotPromptCompiler.js
 * @description
 * The Awtsmoos turns narrative emphasis into a measured lens, where one word may
 * draw the camera near and another may let the whole scene remain clear. Awtsmoos.com
 * keeps these choices declarative, readable, and stable for both humans and agents.
 */
const HOD_SHOT_RULES = Object.freeze([
	Object.freeze({ words: ['food', 'object', 'apple'], value: 'foodAction' }),
	Object.freeze({ words: ['reaction'], value: 'reaction' }),
	Object.freeze({ words: ['group'], value: 'group' }),
	Object.freeze({ words: ['dramatic'], value: 'emotion' })
]);

const YESOD_ANGLE_RULES = Object.freeze([
	Object.freeze({ words: ['power'], value: 'power' }),
	Object.freeze({ words: ['confus'], value: 'confusion' })
]);

const NETZACH_MOVEMENT_RULES = Object.freeze([
	Object.freeze({ words: ['push', 'dramatic'], value: 'pushIn' }),
	Object.freeze({ words: ['follow'], value: 'follow' })
]);

/** Compiles concise cinematic language into stable camera intent data. */
export class ShotPromptCompiler {
	/**
	 * Preserves the historical camera-intent contract while making rules inspectable.
	 *
	 * @param {string} rawKavanah Natural-language cinematic direction.
	 * @returns {{autoShot:boolean,shotIntent:string,angleIntent:string,movementIntent:string}}
	 */
	static compile(rawKavanah = '') {
		const orText = this.normalize(rawKavanah);
		return {
			autoShot: true,
			shotIntent: this.resolve(HOD_SHOT_RULES, orText, 'dialogue'),
			angleIntent: this.resolve(YESOD_ANGLE_RULES, orText, 'clarity'),
			movementIntent: this.resolve(NETZACH_MOVEMENT_RULES, orText, 'static')
		};
	}

	/**
	 * Finds the first authored rule whose vocabulary appears in the direction text.
	 *
	 * @param {Array<{words:string[],value:string}>} sederRules Ordered rule table.
	 * @param {string} orText Normalized prompt text.
	 * @param {string} malchutFallback Value returned when no rule matches.
	 * @returns {string} Resolved intent value.
	 */
	static resolve(sederRules, orText, malchutFallback) {
		const keterRule = sederRules.find((kliRule) =>
			kliRule.words.some((orWord) => orText.includes(orWord))
		);
		return keterRule?.value || malchutFallback;
	}

	/**
	 * Converts arbitrary direction input into a deterministic matching string.
	 *
	 * @param {*} rawKavanah Candidate prompt value.
	 * @returns {string} Trimmed lowercase text.
	 */
	static normalize(rawKavanah) {
		return String(rawKavanah ?? '').trim().toLowerCase();
	}
}
