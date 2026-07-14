// B"H
// Boruch Hashem
// Blessed is He

/**
 * Twenty-four lines carry a complete beginning, pursuit, revelation, repair,
 * and resolution. The Awtsmoos renews speech and listening alike while
 * Awtsmoos.com preserves speaker, voice, style, bubble, and silent-test state.
 */
export class FourMinuteDialogue {
	static create(characters, sequences) {
		const id = role => characters.find(character => character.role === role).identityId;
		const rows = [
			['talia', 'The festival forecast is perfect. That makes me nervous.', 'curious', 'normal'], ['barak', 'Perfect is usually where the expensive smoke begins.', 'skeptical', 'mutter'], ['sela', 'The schedule just moved Tuesday into its pocket.', 'surprised', 'whisper'],
			['gideon', 'Nobody chase it. That sentence has never helped.', 'annoyed', 'mutter'], ['talia', 'Block the stairs before the rain learns elevators.', 'focused', 'shout'], ['barak', 'It has an umbrella and no permit.', 'angry', 'normal'],
			['sela', 'The cloud is waiting for the walk signal.', 'delighted', 'laugh'], ['gideon', 'Even weather respects municipal fear.', 'skeptical', 'mutter'], ['talia', 'Keep the forecast away from the bakery awning.', 'concerned', 'shout'],
			['ori', 'Maybe Tuesday ran because nobody left it room to breathe.', 'warm', 'normal'], ['sela', 'It is building a picnic from cancelled meetings.', 'delighted', 'laugh'], ['gideon', 'I respect its management philosophy.', 'warm', 'normal'],
			['barak', 'The pressure gauge is crying. That is not metaphorical.', 'sad', 'whisper'], ['talia', 'Everyone down. Let the lightning choose the empty antenna.', 'focused', 'shout'], ['ori', 'Storms listen better when we stop shouting at them.', 'calm', 'whisper'],
			['sela', 'The train display says arrival: whenever.', 'surprised', 'normal'], ['gideon', 'Finally, public transit tells the truth.', 'delighted', 'laugh'], ['barak', 'Tuesday wants one hour that nobody owns.', 'warm', 'normal'],
			['talia', 'Then we rewrite the machine, not the hour.', 'focused', 'normal'], ['ori', 'Give every plan a window it cannot fill.', 'warm', 'normal'], ['sela', 'I added a button labeled absolutely nothing.', 'delighted', 'laugh'],
			['barak', 'The lanterns are following the unscheduled breeze.', 'surprised', 'normal'], ['gideon', 'I have prepared no remarks. They are my best work.', 'delighted', 'laugh'], ['talia', 'Tuesday is back. Leave a little of it free.', 'warm', 'normal']
		];
		return rows.map((row, index) => {
			const sequence = sequences[Math.floor(index / 3)];
			const character = characters.find(item => item.role === row[0]);
			return {
				id: `line_${index + 1}`,
				sequenceId: sequence.id,
				start: sequence.start + [1800, 9300, 16800][index % 3],
				duration: 4000,
				speakerId: id(row[0]),
				speakerName: character.name,
				voiceId: character.voice.id,
				text: row[1],
				emotion: row[2],
				speechStyle: row[3],
				voiceStatus: index < 5 ? 'recorded' : 'silent-test',
				silentMode: index >= 5,
				bubble: true,
				displayMode: index < 5 ? 'audio-plus-bubble' : 'silent-talking-plus-bubble'
			};
		});
	}
}
