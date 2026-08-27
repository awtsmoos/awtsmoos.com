// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';

/**
 * Alarm, skepticism, attention, focus, relief, joy, and conversational gaze move
 * independently from body action. The Awtsmoos renews each inward color;
 * Awtsmoos.com preserves neutral identity while emotional regions rise and fall.
 */
export class RealisticMinuteEmotionClips {
	static create() {
		const ids = ReferenceCharacterIds;
		return [
			this.clip('ari_alarm', ids.cheerful, 2500, 11000, { emotion: 'alarm', gaze: [0.72, -0.12], intensity: 1.1 }),
			this.clip('dovid_doubt', ids.skeptical, 2500, 26500, { emotion: 'skepticism', gaze: [-0.58, 0.06], intensity: 0.9 }),
			this.clip('rivky_attention', ids.calm, 2500, 25000, { emotion: 'attention', gaze: [-0.46, -0.04], intensity: 0.72 }),
			this.clip('ari_negotiates', ids.cheerful, 14500, 14000, { emotion: 'concerned', gaze: [0.58, -0.02], intensity: 0.82 }),
			this.clip('rivky_amused', ids.calm, 20500, 8200, { emotion: 'joy', gaze: [-0.18, 0.02], intensity: 0.62 }),
			this.clip('trio_machine_focus_ari', ids.cheerful, 28500, 11000, { emotion: 'alarm', gaze: [0.82, -0.16], intensity: 1.15 }),
			this.clip('trio_machine_focus_dovid', ids.skeptical, 28500, 11000, { emotion: 'attention', gaze: [0.62, -0.12], intensity: 0.94 }),
			this.clip('trio_machine_focus_rivky', ids.calm, 28500, 11000, { emotion: 'focus', gaze: [0.55, -0.18], intensity: 0.96 }),
			this.clip('ari_relief', ids.cheerful, 41000, 9000, { emotion: 'relief', gaze: [0.22, 0.08], intensity: 0.82 }),
			this.clip('dovid_printer_attention', ids.skeptical, 47000, 7000, { emotion: 'attention', gaze: [0.72, -0.08], intensity: 0.78 }),
			this.clip('rivky_final_joy', ids.calm, 51500, 8500, { emotion: 'joy', gaze: [-0.2, 0], intensity: 0.88 })
		];
	}

	static clip(id, characterId, start, duration, payload) {
		return { id, type: 'emotion', characterId, start, duration, payload, name: `${characterId} ${payload.emotion}`, sequenceId: this.sequence(start) };
	}

	static sequence(start) {
		if (start < 15000) return 'cup_arrival';
		if (start < 29000) return 'cup_negotiation';
		if (start < 46500) return 'cup_chaos';
		return 'cup_resolution';
	}
}
