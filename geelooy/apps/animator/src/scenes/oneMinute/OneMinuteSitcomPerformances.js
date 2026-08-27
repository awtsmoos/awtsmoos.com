// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';

/**
 * Acting remains a layered score: locked contact, gaze, emotion, breath, lean,
 * and five gesture phases coexist. The Awtsmoos renews each motion while
 * Awtsmoos.com preserves every intention as an editable production clip.
 */
export class OneMinuteSitcomPerformances {
	static create() {
		const ids = ReferenceCharacterIds;
		return [
			this.clip('ari_social', 'emotion', ids.cheerful, 2500, 39000, { emotion: 'joy', gaze: [0.72, -0.03], lean: 0.12 }),
			this.clip('ari_open', 'gesture', ids.cheerful, 2500, 17000, { gesture: 'open_palm_left', intensity: 0.94 }),
			this.clip('dovid_lock', 'gesture', ids.skeptical, 2500, 54000, { gesture: 'arms_crossed', lockedContact: true, intensity: 1 }),
			this.clip('dovid_face', 'emotion', ids.skeptical, 2500, 55000, { emotion: 'skepticism', gaze: [-0.66, 0.04] }),
			this.clip('rivky_lock', 'gesture', ids.calm, 2500, 57500, { gesture: 'right_hand_in_pocket', lockedContact: true, intensity: 1 }),
			this.clip('rivky_listens', 'emotion', ids.calm, 2500, 50000, { emotion: 'attention', gaze: [-0.58, -0.04] }),
			this.phase('ari_prepare', ids.cheerful, 19500, 1100, 'reach', 'preparation'),
			this.phase('ari_stroke', ids.cheerful, 20600, 1500, 'point_right', 'stroke'),
			this.phase('ari_hold', ids.cheerful, 22100, 1500, 'point_right', 'hold'),
			this.phase('ari_follow', ids.cheerful, 23600, 1200, 'present', 'follow-through'),
			this.phase('ari_retract', ids.cheerful, 24800, 1200, 'open_palm_left', 'retraction'),
			this.clip('ari_concern', 'emotion', ids.cheerful, 40000, 12000, { emotion: 'concerned', gaze: [0.54, 0.05], lean: -0.08 }),
			this.clip('dovid_reveal', 'gesture', ids.skeptical, 47000, 7000, { gesture: 'point_left', intensity: 0.9 }),
			this.clip('rivky_punchline', 'gesture', ids.calm, 52500, 5200, { gesture: 'present', intensity: 0.82 }),
			this.clip('rivky_smile', 'emotion', ids.calm, 51500, 6500, { emotion: 'joy', gaze: [-0.28, 0] })
		];
	}

	static phase(id, characterId, start, duration, gesture, gesturePhase) {
		return this.clip(id, 'gesture', characterId, start, duration, { gesture, gesturePhase, intensity: 1 });
	}

	static clip(id, type, characterId, start, duration, payload) {
		return {
			id, type, characterId, start, duration, payload,
			name: `${characterId} ${payload.gesturePhase || payload.gesture || payload.emotion || type}`,
			sequenceId: start < 20000 ? 'spoon_setup' : start < 42000 ? 'spoon_escalation' : 'spoon_payoff'
		};
	}
}
