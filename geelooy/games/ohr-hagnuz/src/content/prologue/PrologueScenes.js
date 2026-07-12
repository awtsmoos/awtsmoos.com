/** B"H @module PrologueScenes - the night the Aleph vanished. */
import { beat as b, pair, scene } from '../builders/SceneBuilder.js';

export const PrologueScenes = [
	scene('prologue_broken_aleph_intro', [
		b('Narrator', '✦', 'At midnight, every lamp in the village leaned east. The Aleph above the gate cracked without making a sound.'),
		b('Guide ג', 'ג', 'Do not chase the light. First choose the concept that will teach your hands how to return it.'),
		b('Three Musagim', '◇', 'Emes waits without flinching. Simcha hums beneath the fear. Gevurah stands between the village and the dark.', {
			choices: [
				{ id: 'emes', label: 'Choose Emes', action: 'starter', value: 'emes' },
				{ id: 'simcha', label: 'Choose Simcha', action: 'starter', value: 'simcha' },
				{ id: 'gevurah', label: 'Choose Gevurah', action: 'starter', value: 'gevurah' }
			]
		}),
		b('Guide ג', 'ג', 'Now speak with me beside the broken seal. A chosen companion is a beginning, not an answer.')
	]),
	scene('prologue_broken_aleph_complete', [
		b('Guide ג', 'ג', 'The spark returned, but its silence did not. Someone heard what the rest of us missed.'),
		b('Narrator', '✦', 'Across the square, a child held both hands over one ear and pointed toward a sefer stand.')
	]),
	...pair('prologue_silent_child', [
		b('Small Child', 'C', 'Everyone says nothing happened. But the nothing has a voice, and it keeps asking my name.'),
		b('Ohr Chozer', 'א', 'Show me where the sound began. We will answer it without pretending it is small.')
	], [
		b('Small Child', 'C', 'The question is still a question, but it is no longer hollow.'),
		b('Guide ג', 'ג', 'The village has seen you return one sound. Now it will ask whether you can return one another.')
	])
];
