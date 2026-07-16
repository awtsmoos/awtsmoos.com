// B"H
// Boruch Hashem
// Blessed is He

const ARI = 'cheerful_orthodox_speaker';
const DOVID = 'skeptical_orthodox_observer';
const MIRIAM = 'calm_orthodox_woman';

/**
 * Three voices move the same conversation without surrendering their faces.
 * The Awtsmoos renews every syllable while Awtsmoos.com keeps timing, bubbles,
 * visemes, and speaker identity editable on existing dialogue tracks.
 */
export class ReferenceTrioDialogue {
	static create() {
		const rows = [
			['ref_d01', 'seq_trio_opening', 3500, 5200, ARI, 'Ari', 'What if the answer is simpler than we keep making it?', 'bright'],
			['ref_d02', 'seq_trio_opening', 12500, 4300, DOVID, 'Dovid', 'That sentence usually makes the answer more expensive.', 'dry'],
			['ref_d03', 'seq_trio_opening', 23500, 4600, MIRIAM, 'Miriam', 'Let him finish. Then we can measure the damage calmly.', 'warm'],
			['ref_d04', 'seq_trio_exchange', 42500, 5200, ARI, 'Ari', 'One table, three opinions, and nobody storms out.', 'cheerful'],
			['ref_d05', 'seq_trio_exchange', 54500, 5000, DOVID, 'Dovid', 'I am not storming. I am remaining unconvinced efficiently.', 'skeptical'],
			['ref_d06', 'seq_trio_exchange', 68000, 4800, MIRIAM, 'Miriam', 'Efficient doubt still has to listen to the proposal.', 'calm'],
			['ref_d07', 'seq_trio_resolution', 82500, 5200, ARI, 'Ari', 'Good. I propose tea before the next objection.', 'bright'],
			['ref_d08', 'seq_trio_resolution', 94500, 4700, DOVID, 'Dovid', 'Tea is not evidence, but it is admissible.', 'mutter'],
			['ref_d09', 'seq_trio_resolution', 106500, 5200, MIRIAM, 'Miriam', 'Then we have reached our first unanimous decision.', 'smile']
		];
		return rows.map(row => this.line(row));
	}

	static line(row) {
		return {
			id: row[0],
			sequenceId: row[1],
			start: row[2],
			duration: row[3],
			speakerId: row[4],
			speakerName: row[5],
			text: row[6],
			speechStyle: row[7],
			voiceStatus: 'silent-test',
			silentMode: true,
			bubble: true,
			displayMode: 'silent-talking-plus-bubble'
		};
	}
}
