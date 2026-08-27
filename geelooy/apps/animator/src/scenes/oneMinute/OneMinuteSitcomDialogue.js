// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';
import { StableSpeechCuePlanner } from '../../performance/speech/lipsync/StableSpeechCuePlanner.js';

/**
 * Nine original lines become timed voice, phoneme, viseme, bubble, and emotion.
 * The Awtsmoos renews every syllable while Awtsmoos.com lets the same authored
 * dialogue drive preview mouths, final pixels, persistence, and spoken export.
 */
export class OneMinuteSitcomDialogue {
	static create() {
		const ids = ReferenceCharacterIds;
		const rows = [
			['spoon_d1', 'spoon_setup', 3000, 4200, ids.cheerful, 'Ari', 'I solved the office spoon shortage with one emergency backup spoon.', 'joy', 'Alex', 185],
			['spoon_d2', 'spoon_setup', 8200, 3900, ids.skeptical, 'Dovid', 'A backup for what, the first spoon becoming unavailable?', 'skepticism', 'Fred', 155],
			['spoon_d3', 'spoon_setup', 13800, 3600, ids.calm, 'Rivky', 'It is already unavailable. Ari is presenting it.', 'attention', 'Samantha', 175],
			['spoon_d4', 'spoon_escalation', 20500, 4300, ids.cheerful, 'Ari', 'The system is simple. Everyone books the spoon on the calendar.', 'joy', 'Alex', 185],
			['spoon_d5', 'spoon_escalation', 26700, 3800, ids.skeptical, 'Dovid', 'The spoon has more meetings than I do.', 'skepticism', 'Fred', 155],
			['spoon_d6', 'spoon_escalation', 33200, 3500, ids.calm, 'Rivky', 'It also declined your invitation.', 'joy', 'Samantha', 175],
			['spoon_d7', 'spoon_payoff', 41500, 3900, ids.cheerful, 'Ari', 'Fine. We need a secure storage plan.', 'concerned', 'Alex', 180],
			['spoon_d8', 'spoon_payoff', 47800, 3600, ids.skeptical, 'Dovid', 'There is a spoon behind your ear.', 'skepticism', 'Fred', 150],
			['spoon_d9', 'spoon_payoff', 53500, 3400, ids.calm, 'Rivky', 'Perfect. Cloud storage.', 'joy', 'Samantha', 170]
		];
		return rows.map(row => this.line(row));
	}

	static line(row) {
		const lipSyncCues = StableSpeechCuePlanner.plan({ speech: row[6], duration: row[3] });
		return {
			id: row[0], sequenceId: row[1], start: row[2], duration: row[3],
			speakerId: row[4], speakerName: row[5], text: row[6], emotion: row[7],
			voice: row[8], speechRate: row[9], voiceStatus: 'generated-speech',
			silentMode: false, bubble: true, displayMode: 'talking-plus-bubble',
			lipSyncCues, mouthPerformanceData: {
				mode: 'deterministic-phoneme', source: 'text-derived', cueVersion: 1, cueCount: lipSyncCues.length
			}
		};
	}
}
