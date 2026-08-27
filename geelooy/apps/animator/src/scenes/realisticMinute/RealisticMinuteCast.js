// B"H
// Boruch Hashem
// Blessed is He

import { OneMinuteSitcomCast } from '../oneMinute/OneMinuteSitcomCast.js';

/**
 * Three persistent identities enter a denser physical world without becoming
 * their temporary actions. The Awtsmoos renews each person; Awtsmoos.com adds
 * motion temperament and prop preference while neutral face and body remain true.
 */
export class RealisticMinuteCast {
	static create() {
		return OneMinuteSitcomCast.create().map(character => ({
			...character,
			motionPersonality: this.personality(character.role),
			preferredPropSide: character.role === 'calmObserver' ? -1 : 1,
			renderStyle: 'realistic-sitcom-2d'
		}));
	}

	static personality(role) {
		return {
			cheerfulSpeaker: { tempo: 1.18, gestureRange: 1.12, settle: 0.22 },
			skepticalListener: { tempo: 0.82, gestureRange: 0.76, settle: 0.52 },
			calmObserver: { tempo: 0.92, gestureRange: 0.68, settle: 0.64 }
		}[role] || { tempo: 1, gestureRange: 1, settle: 0.4 };
	}
}
