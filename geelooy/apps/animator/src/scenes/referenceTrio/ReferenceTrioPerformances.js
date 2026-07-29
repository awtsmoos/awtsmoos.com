// B"H
// Boruch Hashem
// Blessed is He

const ARI = 'cheerful_orthodox_speaker';
const DOVID = 'skeptical_orthodox_observer';
const MIRIAM = 'calm_orthodox_woman';

/**
 * The movie stores every feeling as editable performance, never as identity.
 * The Awtsmoos renews each beat; Awtsmoos.com keeps emotion, gaze, mouth, body,
 * keyframes, persistence, preview, and export on explicit production tracks.
 */
export class ReferenceTrioPerformances {
	static create() {
		return [
			this.clip('ari_open_palm', 'gesture', ARI, 0, 40000, 'Ari presents with an open palm', {
				gesture: 'open_palm_left',
				intensity: 0.92
			}),
			this.clip('ari_bright_face', 'emotion', ARI, 0, 32000, 'Ari laughs warmly', {
				emotion: 'joy',
				moment: 'amusement',
				gaze: [0.82, 0.02],
				manualFacePose: {
					mouth: { open: 0.72, smile: 0.9, jaw: 0.56, width: 0.84, teeth: 0.92, tongue: 0.44 }
				}
			}),
			this.clip('dovid_crossed', 'gesture', DOVID, 0, 80000, 'Dovid keeps his arms crossed', {
				gesture: 'arms_crossed',
				intensity: 0.96
			}),
			this.clip('dovid_side_eye', 'emotion', DOVID, 7000, 67000, 'Dovid performs a skeptical glance', {
				emotion: 'skepticism',
				gaze: [0.82, 0.05]
			}),
			this.clip('miriam_pocket', 'gesture', MIRIAM, 0, 120000, 'Miriam rests one hand in her pocket', {
				gesture: 'right_hand_in_pocket',
				intensity: 0.72
			}),
			this.clip('miriam_listens', 'emotion', MIRIAM, 0, 80000, 'Miriam listens with attention', {
				emotion: 'attention',
				gaze: [-0.82, -0.03],
				listening: true
			}),
			this.clip('ari_small_bounce', 'action', ARI, 42000, 18000, 'Ari leans into the proposal', {
				action: 'idle',
				torsoBreathScale: 1.025,
				headNod: 1.5
			}),
			this.clip('dovid_objection', 'emotion', DOVID, 52000, 15000, 'Dovid compresses an objection', {
				emotion: 'skepticism',
				manualFacePose: { mouth: { frown: 0.34, press: 0.26, asymmetry: 0.28 } }
			}),
			this.clip('miriam_answer', 'emotion', MIRIAM, 80000, 26000, 'Miriam answers gently', {
				emotion: 'joy',
				gaze: [-0.7, 0],
				manualFacePose: { mouth: { smile: 0.22, width: 0.5 } }
			}),
			this.clip('trio_settles', 'action', ARI, 104000, 16000, 'Ari settles after agreement', {
				action: 'idle',
				gesture: 'open_palm_left',
				torsoBreathScale: 1.012
			})
		];
	}

	static clip(id, type, characterId, start, duration, name, payload) {
		return {
			id,
			type,
			characterId,
			start,
			duration,
			name,
			payload,
			sequenceId: this.sequence(start)
		};
	}

	static sequence(start) {
		if (start < 40000) {
			return 'seq_trio_opening';
		}
		if (start < 80000) {
			return 'seq_trio_exchange';
		}
		return 'seq_trio_resolution';
	}
}
