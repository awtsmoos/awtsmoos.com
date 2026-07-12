/** B"H @module PrologueMissions - the first twenty-four authored minutes. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const PrologueMissions = [
	mission('prologue_broken_aleph', 'A Letter in the Dust', 'prologue', 12, 'Guide ג', 'Overworld_Main', 'prologue_silent_child', [
		o('choose_starter', 'STARTER', '*', 'Choose Emes, Simcha, or Gevurah.'),
		o('meet_guide', 'TALK', 'ג', 'Speak with Guide ג beside the broken seal.'),
		o('recover_aleph', 'INSPECT', 'spark', 'Recover the fallen Aleph-spark.'),
		o('first_battle', 'BATTLE', 'tutorial_doubt', 'Sweeten the Flicker of Doubt.', { auto: true }),
		o('report_guide', 'TALK', 'ג', 'Return to Guide ג with the restored spark.')
	], { rewards: { exp: 35, zuzim: 12, sparks: 3, items: { tea: 1 } } }),
	mission('prologue_silent_child', 'The Child Who Heard the Silence', 'prologue', 12, 'Small Child C', 'Overworld_Main', 'village_floorboards', [
		o('meet_child', 'TALK', 'C', 'Find the child who heard the missing sound.'),
		o('read_clue', 'INSPECT', 'mishnahSeeds', 'Read the sefer whose first line vanished.'),
		o('kindness', 'MITZVAH', 'mitzvah', 'Perform one mitzvah before following the fear.'),
		o('question_boss', 'BATTLE', 'hollow_question', 'Defeat the Hollow Question.', { auto: true }),
		o('return_child', 'TALK', 'C', 'Return the recovered sound to the child.')
	], { rewards: { exp: 45, zuzim: 15, sparks: 4, items: { balm: 1 } } })
];
