// B"H
// Boruch Hashem
// Blessed is He

/**
 * Words may arrive through recorded breath or silent rehearsal, yet every line
 * receives visible timing. The Awtsmoos renews speech and silence alike while
 * Awtsmoos.com keeps bubbles, style, speaker, and voice status explicit.
 */
export class StrategyDialogue {
	static create(id) {
		const rows = [
			['d01', 'seq_briefing', 2500, 4300, 'inventorParent', 'Mira', 'Our strategy needs three phases and absolutely no legs.', 'normal', 'recorded'],
			['d02', 'seq_briefing', 7800, 4200, 'practicalParent', 'Dov', 'That is an unusually specific safety rule.', 'mutter', 'recorded'],
			['d03', 'seq_briefing', 13000, 3800, 'brainyKid', 'Nomi', 'Too late. The bullet points are stretching.', 'whisper', 'silent-test'],
			['d04', 'seq_escape', 25500, 4300, 'wildToddler', 'Pip', 'The plan is walking! I taught it confidence.', 'shout', 'silent-test'],
			['d05', 'seq_escape', 34200, 4700, 'dryTalkingPet', 'Quip', 'Great. Management has become ambulatory.', 'mutter', 'silent-test'],
			['d06', 'seq_chase', 50500, 4500, 'inventorParent', 'Mira', 'Corner it before it schedules a follow-up meeting.', 'shout', 'silent-test'],
			['d07', 'seq_chase', 57500, 4200, 'practicalParent', 'Dov', 'Use the calendar. It fears accountability.', 'angry', 'silent-test'],
			['d08', 'seq_chase', 65000, 4200, 'brainyKid', 'Nomi', 'I can offer version control and a snack.', 'normal', 'silent-test'],
			['d09', 'seq_negotiation', 74500, 5200, 'inventorParent', 'Mira', 'Plan, what do you actually want?', 'warm', 'silent-test'],
			['d10', 'seq_negotiation', 84200, 5200, 'wildToddler', 'Pip', 'It says fewer meetings and more montage.', 'laugh', 'silent-test'],
			['d11', 'seq_tag', 98500, 5100, 'dryTalkingPet', 'Quip', 'At last, a document with boundaries.', 'smile', 'silent-test'],
			['d12', 'seq_tag', 109500, 5200, 'practicalParent', 'Dov', 'Why is Tuesday now wearing shoes?', 'surprised', 'silent-test']
		];

		return rows.map(row => this.line(row, id));
	}

	static line(row, id) {
		return {
			id: row[0],
			sequenceId: row[1],
			start: row[2],
			duration: row[3],
			speakerId: id(row[4]),
			speakerName: row[5],
			text: row[6],
			speechStyle: row[7],
			voiceStatus: row[8],
			silentMode: row[8] === 'silent-test',
			bubble: true,
			displayMode: row[8] === 'recorded' ? 'audio-plus-bubble' : 'silent-talking-plus-bubble'
		};
	}
}
