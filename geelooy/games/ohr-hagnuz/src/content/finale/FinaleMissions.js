/** B"H @module FinaleMissions - declaration, final battle, and lived epilogue. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const FinaleMissions = [
	mission('final_declaration', 'The Final Declaration', 'finale', 17, 'Witnesses of the Road', 'Final_Declaration', 'final_epilogue', [
		o('enter_declaration', 'TRAVEL', 'Final_Declaration', 'Enter the chamber where every deed becomes testimony.'),
		o('six_clauses', 'DECLARE', 'declaration_clause', 'Speak all six clauses from verified campaign actions.', { count: 6 }),
		o('shattered_name', 'BATTLE', 'shattered_name', 'Defeat the Shattered Name.', { auto: true })
	], { rewards: { exp: 250, zuzim: 100, sparks: 20 } }),
	mission('final_epilogue', 'The Village Remembers', 'finale', 8, 'Guide ג', 'Ohr_HaGanuz_Realm', null, [
		o('enter_realm', 'TRAVEL', 'Ohr_HaGanuz_Realm', 'Enter the restored realm.'),
		o('final_guide', 'TALK', 'ג', 'Hear what changed in the village and in you.'),
		o('ending_choice', 'CHOICE', 'ending_path', 'Choose how the Ohr Chozer will continue serving.', { sceneId: 'final_ending_choice' })
	], { rewards: { exp: 100, zuzim: 0, sparks: 0 }, finale: true })
];
