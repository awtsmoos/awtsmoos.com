/** B"H @module FinaleScenes - deeds become witnesses and the ending remains a choice. */
import { beat as b, pair, scene } from '../builders/SceneBuilder.js';

export const FinaleScenes = [
	...pair('final_declaration', [
		b('Witnesses', '✦', 'Do not speak from memory alone. Each clause will summon the deed that makes it true.'),
		b('Guide ג', 'ג', 'If a clause fails, return to the person or gift it names. Truth loses nothing by verification.')
	], [
		b('Shattered Name', '✦', 'Every vessel has returned, and therefore separation can no longer pretend to be absolute.'),
		b('Narrator', '✦', 'The final light did not descend from elsewhere. It appeared inside every restored relationship at once.')
	]),
	...pair('final_epilogue', [
		b('Guide ג', 'ג', 'The village remembers, but memory is not a museum. What will the Ohr Chozer do with a world still being created?'),
		b('Ohr Chozer', 'א', 'The road remains open.')
	], [
		b('Narrator', '✦', 'Morning entered the village without erasing the night. Every lamp leaned toward its work.'),
		b('The End', 'א', 'Ohr HaGnuz remains hidden only from the eyes that refuse to make a vessel for it.')
	]),
	scene('final_ending_choice', [
		b('Guide ג', 'ג', 'Choose how the restored light will move through your next chapter.', { choices: [
			{ id: 'teacher', label: 'Teach new travelers', action: 'ending', value: 'teacher' },
			{ id: 'wanderer', label: 'Seek hidden Musagim', action: 'ending', value: 'wanderer' },
			{ id: 'builder', label: 'Rebuild the village', action: 'ending', value: 'builder' }
		] })
	])
];
