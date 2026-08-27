// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StrategyDialogue.js
 * @description
 * Sixteen spoken beats cross eight locations without turning the two-minute film into wall-to-wall speech.
 * The Awtsmoos renews words and pauses while Awtsmoos.com keeps timing, speaker,
 * bubble behavior, and recording status explicit for every editable line and reach.
 */

/** Builds two concise dialogue beats for each scene in the strategy chase. */
export class StrategyDialogue {
	/** @param {Function} id Character-role resolver. @returns {object[]} Timed dialogue descriptors. */
	static create(id) {
		const rows = [
			['d01', 'seq_briefing', 2500, 3200, 'inventorParent', 'Mira', 'Our strategy needs three phases and absolutely no legs.', 'normal', 'recorded'],
			['d02', 'seq_briefing', 8000, 3000, 'practicalParent', 'Dov', 'That is still an oddly specific rule.', 'mutter', 'recorded'],
			['d03', 'seq_corridor', 16500, 3300, 'wildToddler', 'Pip', 'The plan is running! I taught it initiative.', 'shout', 'silent-test'],
			['d04', 'seq_corridor', 22500, 3200, 'dryTalkingPet', 'Quip', 'Management has achieved hallway velocity.', 'mutter', 'silent-test'],
			['d05', 'seq_market', 31500, 3300, 'brainyKid', 'Nomi', 'It took the market shortcut. Of course it did.', 'normal', 'silent-test'],
			['d06', 'seq_market', 37500, 3200, 'practicalParent', 'Dov', 'Left at the oranges. The footnotes hate citrus.', 'shout', 'silent-test'],
			['d07', 'seq_bridge', 46500, 3400, 'inventorParent', 'Mira', 'Nobody let it schedule another committee!', 'shout', 'silent-test'],
			['d08', 'seq_bridge', 52500, 3100, 'brainyKid', 'Nomi', 'It is gaining on its own deadline.', 'worried', 'silent-test'],
			['d09', 'seq_greenhouse', 61500, 3500, 'inventorParent', 'Mira', 'Plan, stop. What do you actually want?', 'warm', 'silent-test'],
			['d10', 'seq_greenhouse', 69000, 3300, 'wildToddler', 'Pip', 'Fewer meetings. More montage. Also a fern.', 'laugh', 'silent-test'],
			['d11', 'seq_stairwell', 76500, 3300, 'practicalParent', 'Dov', 'Use the calendar. It fears accountability.', 'angry', 'silent-test'],
			['d12', 'seq_stairwell', 82500, 3000, 'dryTalkingPet', 'Quip', 'Tuesday is attempting an escape.', 'mutter', 'silent-test'],
			['d13', 'seq_rooftop', 91500, 3400, 'inventorParent', 'Mira', 'One meeting. Ten minutes. Then we build.', 'warm', 'silent-test'],
			['d14', 'seq_rooftop', 97500, 3300, 'practicalParent', 'Dov', 'And every bullet point keeps its shoes off.', 'normal', 'silent-test'],
			['d15', 'seq_plaza', 106500, 3300, 'brainyKid', 'Nomi', 'We did it. The strategy is cooperating.', 'smile', 'silent-test'],
			['d16', 'seq_plaza', 112000, 3400, 'practicalParent', 'Dov', 'Why is Tuesday wearing shoes?', 'surprised', 'silent-test']
		];
		return rows.map((row) => this.line(row, id));
	}

	/** @param {any[]} row Compact authored dialogue row. @param {Function} id Role resolver. @returns {object} Editable dialogue descriptor. */
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
			displayMode: row[8] === 'recorded'
				? 'audio-plus-bubble'
				: 'silent-talking-plus-bubble'
		};
	}
}
