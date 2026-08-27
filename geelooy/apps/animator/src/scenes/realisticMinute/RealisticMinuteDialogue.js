// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';
import { StableSpeechCuePlanner } from '../../performance/speech/lipsync/StableSpeechCuePlanner.js';

/**
 * Twelve original lines drive voice, viseme, expression, timing, and anchored
 * speech bubbles. The Awtsmoos renews each syllable; Awtsmoos.com lets the same
 * text animate mouths, shape reactions, persist in the NLE, and sound in export.
 */
export class RealisticMinuteDialogue {
	static create() {
		const ids = ReferenceCharacterIds;
		const rows = [
			['cup_d1', 'cup_arrival', 3000, 3300, ids.cheerful, 'Ari', 'Emergency! The machine says there is one cup left.', 'alarm', 'Alex', 190],
			['cup_d2', 'cup_arrival', 6800, 3000, ids.skeptical, 'Dovid', 'Then stop running toward it.', 'skepticism', 'Fred', 155],
			['cup_d3', 'cup_arrival', 10300, 3000, ids.calm, 'Rivky', 'He cannot. The cup has momentum.', 'attention', 'Samantha', 175],
			['cup_d4', 'cup_negotiation', 15000, 3100, ids.cheerful, 'Ari', 'I booked it before the meeting.', 'concerned', 'Alex', 182],
			['cup_d5', 'cup_negotiation', 18500, 2800, ids.skeptical, 'Dovid', 'You booked coffee?', 'skepticism', 'Fred', 150],
			['cup_d6', 'cup_negotiation', 21800, 3200, ids.calm, 'Rivky', 'He also invited the mug.', 'joy', 'Samantha', 172],
			['cup_d7', 'cup_chaos', 29000, 3000, ids.cheerful, 'Ari', 'Why is the machine shaking?', 'alarm', 'Alex', 188],
			['cup_d8', 'cup_chaos', 32500, 3100, ids.skeptical, 'Dovid', 'Because it read the calendar.', 'skepticism', 'Fred', 152],
			['cup_d9', 'cup_chaos', 36500, 3200, ids.calm, 'Rivky', 'Catch the cup. I have the spoon.', 'focus', 'Samantha', 180],
			['cup_d10', 'cup_chaos', 42000, 3100, ids.cheerful, 'Ari', 'Nobody move. We achieved balance.', 'relief', 'Alex', 176],
			['cup_d11', 'cup_resolution', 48000, 3000, ids.skeptical, 'Dovid', 'The printer is making something.', 'attention', 'Fred', 150],
			['cup_d12', 'cup_resolution', 53500, 3700, ids.calm, 'Rivky', 'Free tea. The machine chose diplomacy.', 'joy', 'Samantha', 170]
		];
		return rows.map(row => this.line(row));
	}

	static line(row) {
		const lipSyncCues = StableSpeechCuePlanner.plan({ speech: row[6], duration: row[3] });
		return {
			id: row[0], sequenceId: row[1], start: row[2], duration: row[3],
			speakerId: row[4], speakerName: row[5], text: row[6], emotion: row[7],
			voice: row[8], speechRate: row[9], voiceStatus: 'generated-speech',
			silentMode: false, bubble: true, displayMode: 'anchored-character-bubble',
			lipSyncCues, mouthPerformanceData: {
				mode: 'deterministic-phoneme', source: 'text-derived', cueVersion: 1, cueCount: lipSyncCues.length
			}
		};
	}
}
