// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';

/**
 * Ten shots preserve conversational geography while changing emphasis. The
 * Awtsmoos renews each witness point; Awtsmoos.com keeps eyelines, safe text,
 * close reactions, and the final trio silhouette editable as camera clips.
 */
export class OneMinuteSitcomShots {
	static create() {
		const ids = ReferenceCharacterIds;
		const cast = [ids.cheerful, ids.skeptical, ids.calm];
		const rows = [
			['spoon_s1', 'spoon_setup', 0, 'group', 'eyeLevel', 'locked', cast, 'title and trio establish'],
			['spoon_s2', 'spoon_setup', 2500, 'closeUp', 'threeQuarter', 'slowPush', [ids.cheerful], 'Ari presents the backup'],
			['spoon_s3', 'spoon_setup', 8000, 'reaction', 'threeQuarter', 'locked', [ids.skeptical], 'Dovid protects his doubt'],
			['spoon_s4', 'spoon_setup', 13500, 'reaction', 'profile', 'locked', [ids.calm], 'Rivky observes the contradiction'],
			['spoon_s5', 'spoon_escalation', 20000, 'twoShot', 'eyeLevel', 'slowPush', [ids.cheerful, ids.skeptical], 'calendar proposal and resistance'],
			['spoon_s6', 'spoon_escalation', 26500, 'closeUp', 'threeQuarter', 'locked', [ids.skeptical], 'calendar joke lands'],
			['spoon_s7', 'spoon_escalation', 33000, 'reaction', 'profile', 'locked', [ids.calm], 'invitation declined'],
			['spoon_s8', 'spoon_payoff', 41000, 'group', 'eyeLevel', 'pullBack', cast, 'storage crisis'],
			['spoon_s9', 'spoon_payoff', 47500, 'twoShot', 'threeQuarter', 'slowPush', [ids.skeptical, ids.cheerful], 'the spoon is discovered'],
			['spoon_s10', 'spoon_payoff', 53500, 'group', 'eyeLevel', 'locked', cast, 'punchline and final reaction']
		];
		return rows.map((row, index) => this.shot(row, index, rows));
	}

	static shot(row, index, rows) {
		const end = rows[index + 1]?.[2] ?? 60000;
		return {
			id: row[0], sequenceId: row[1], start: row[2], duration: end - row[2],
			camera: { size: row[3], angle: row[4], move: row[5], purpose: row[7] },
			transition: index === 0 ? 'fade' : 'cut', characters: row[6],
			composition: { bubbleSafe: true, textSafe: true, depthLayers: 2 },
			continuity: { screenDirection: 'leftToRight', eyeLineAxis: 'spoonAxis', bubbleSafe: true }
		};
	}
}
