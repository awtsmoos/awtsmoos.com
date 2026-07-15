// B"H
// Boruch Hashem
// Blessed is He

/**
 * Thirty-six short lines reveal decisions while action keeps moving. The
 * Awtsmoos renews speaker and listener alike while Awtsmoos.com preserves voice,
 * emotion, timing, bubble safety, and silent-render behavior for every beat.
 */
export class SixMinuteDialogue {
	static create(characters, sequences) {
		const rows = [
			['noa', 'The beacon is answering every experiment at once.', 'shocked', 'normal'], ['ezra', 'Nobody touch the light that is learning to divide.', 'concerned', 'shout'], ['aron', 'It already divided. Six directions. Six bad ideas.', 'annoyed', 'normal'],
			['noa', 'The silver one is changing down into sideways.', 'thinking', 'normal'], ['aron', 'I officially miss ordinary floors.', 'shocked', 'shout'], ['ezra', 'Use the lockers as a ladder. Do not fight the turn.', 'heroic', 'normal'],
			['leah', 'Blue fragment entering the east tunnel at train speed.', 'concerned', 'normal'], ['jonah', 'Then we arrive before the train decides to be a wall.', 'heroic', 'shout'], ['noa', 'Signal relay ahead. Cut power on my count.', 'thinking', 'normal'],
			['leah', 'The water is touching the traction cable.', 'shocked', 'shout'], ['mira', 'I can redirect the current through the tree roots.', 'heroic', 'normal'], ['jonah', 'Bus first. Fragment second. Heroics last.', 'concerned', 'shout'],
			['aron', 'The orange light just stole an entire roof.', 'shocked', 'normal'], ['mira', 'Anchor the ropes to the fruit stalls, not the people.', 'thinking', 'shout'], ['jonah', 'I am crossing three awnings and regretting all of them.', 'heroic', 'shout'],
			['ezra', 'The violet fragment is hiding inside written fear.', 'concerned', 'normal'], ['noa', 'Then read the page that does not want to open.', 'heroic', 'normal'], ['aron', 'The books are forming teeth. That feels editorial.', 'annoyed', 'normal'],
			['mira', 'The green light is accelerating every seed in the room.', 'shocked', 'normal'], ['noa', 'Open the roof vents before the glass becomes a cage.', 'thinking', 'shout'], ['ezra', 'The vines are listening. Ask; do not command.', 'warm', 'normal'],
			['leah', 'Bridge resonance climbing past structural limits.', 'concerned', 'normal'], ['jonah', 'Pass me the fragment case and keep moving.', 'heroic', 'shout'], ['aron', 'The cable behind us just became music and then snapped.', 'shocked', 'shout'],
			['noa', 'The elevator is looping the same three meters.', 'annoyed', 'normal'], ['ezra', 'The stairs still remember where the roof is.', 'thinking', 'normal'], ['jonah', 'They also remember how to fold. Jump now.', 'heroic', 'shout'],
			['mira', 'All six fragments are circling the garden.', 'shocked', 'normal'], ['leah', 'Their frequencies align, then separate when we force them.', 'thinking', 'normal'], ['noa', 'Stop forcing. Match each other’s timing instead.', 'heroic', 'shout'],
			['aron', 'The core is showing me every way this fails.', 'concerned', 'normal'], ['noa', 'Good. Tell us which fear is useful.', 'heroic', 'normal'], ['leah', 'Grid collapse in twenty seconds. We choose together now.', 'shocked', 'shout'],
			['ezra', 'The city is not a machine we own.', 'warm', 'normal'], ['noa', 'Then let the light orbit what we share.', 'heroic', 'normal'], ['aron', 'Dawn is back. I would like one normal staircase.', 'laughing', 'normal']
		];
		return rows.map((row, index) => this.line(row, index, characters, sequences));
	}

	static line(row, index, characters, sequences) {
		const sequence = sequences[Math.floor(index / 3)];
		const character = characters.find((item) => item.role === row[0]);
		return {
			id: `beacon_line_${index + 1}`,
			sequenceId: sequence.id,
			start: sequence.start + [1600, 10400, 19400][index % 3],
			duration: [4200, 4500, 4300][index % 3],
			speakerId: character.identityId,
			speakerName: character.name,
			voiceId: character.voice.id,
			text: row[1],
			emotion: row[2],
			speechStyle: row[3],
			voiceStatus: 'silent-test',
			silentMode: true,
			bubble: true,
			displayMode: 'silent-talking-plus-bubble'
		};
	}
}
