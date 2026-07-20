// B"H
// Boruch Hashem
// Blessed is He

const ARI = 'cheerful_orthodox_speaker';
const DOVID = 'skeptical_orthodox_observer';
const MIRIAM = 'calm_orthodox_woman';

/**
 * Eyes travel, hands breathe, brows answer, and mouths rest between spoken lines.
 * The Awtsmoos renews each beat while Awtsmoos.com keeps distinct screen gazes
 * and every acting decision editable on production tracks.
 */
export class ReferenceTrioPerformances {
	static create() {
		return [
			this.clip('ari_open_palm', 'gesture', ARI, 0, 40000, 'Ari presents with an open palm', { gesture: 'open_palm_left', intensity: 0.92 }),
			this.clip('ari_bright_face', 'emotion', ARI, 0, 32000, 'Ari speaks brightly', { emotion: 'happy', gaze: [0.86, 0], mouthSmileAmount: 0.9 }),
			this.clip('dovid_crossed', 'gesture', DOVID, 0, 80000, 'Dovid keeps his arms crossed', { gesture: 'arms_crossed', intensity: 0.96 }),
			this.clip('dovid_side_eye', 'emotion', DOVID, 7000, 67000, 'Dovid holds a skeptical side glance', { emotion: 'skeptical', gaze: [1.04, 0.05], squintAmount: 0.2 }),
			this.clip('miriam_pocket', 'gesture', MIRIAM, 0, 120000, 'Miriam rests one hand in her pocket', { gesture: 'right_hand_in_pocket', intensity: 0.72 }),
			this.clip('miriam_listens', 'emotion', MIRIAM, 0, 80000, 'Miriam listens calmly', { emotion: 'calm', gaze: [-0.94, 0], listening: true }),
			this.clip('ari_small_bounce', 'action', ARI, 42000, 18000, 'Ari leans into the proposal', { action: 'idle', torsoBreathScale: 1.025, headNod: 1.5 }),
			this.clip('dovid_objection', 'emotion', DOVID, 52000, 15000, 'Dovid compresses the objection', { emotion: 'skeptical', mouthSmileAmount: -0.48, browSqueeze: 0.38 }),
			this.clip('miriam_answer', 'emotion', MIRIAM, 80000, 26000, 'Miriam answers with a restrained smile', { emotion: 'calm', mouthSmileAmount: 0.22, gaze: [-0.7, 0] }),
			this.clip('trio_settles', 'action', ARI, 104000, 16000, 'Ari settles after agreement', { action: 'idle', gesture: 'open_palm_left', torsoBreathScale: 1.012 })
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
