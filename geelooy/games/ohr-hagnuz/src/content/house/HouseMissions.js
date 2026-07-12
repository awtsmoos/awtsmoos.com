/** B"H @module HouseMissions - six chambers arranged into four deep chains. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const HouseMissions = [
	mission('house_blessings', 'Forgotten Blessings', 'house', 13, 'House Voice', 'House_Of_Forgetting', 'house_teachers', [
		o('enter_house', 'TRAVEL', 'House_Of_Forgetting', 'Enter the House of Forgetting.'),
		o('blessing_order', 'PUZZLE', 'blessing_order', 'Restore the order of the forgotten blessings.', { mapId: 'House_Of_Forgetting' }),
		o('blessing_battle', 'BATTLE', 'arrogance', 'Defeat the voice that blesses only itself.', { auto: true }),
		o('remember_name', 'MITZVAH', 'mitzvah', 'Mention the Source before taking the next step.')
	], { rewards: { exp: 110, zuzim: 35, sparks: 6 } }),
	mission('house_teachers', 'Forgotten Teachers', 'house', 13, 'Forest Mekubal ק', 'House_Of_Forgetting', 'house_students', [
		o('zohar_lamp', 'INSPECT', 'ZoharLamp', 'Relight the teaching hidden in the Zohar lamp.', { mapId: 'House_Of_Forgetting' }),
		o('meet_teacher', 'TALK', 'ק', 'Listen to the teacher without finishing the sentence.'),
		o('lesson_fragments', 'PUZZLE', 'lesson_fragments', 'Arrange the lesson from its surviving fragments.', { mapId: 'House_Of_Forgetting' }),
		o('teacher_battle', 'BATTLE', 'arrogance', 'Defeat certainty that refuses a teacher.', { auto: true })
	], { rewards: { exp: 120, zuzim: 38, items: { scroll: 2 } } }),
	mission('house_students', 'Forgotten Students', 'house', 14, 'Small Child C', 'House_Of_Forgetting', 'house_joy', [
		o('find_child', 'TALK', 'C', 'Find the students hidden behind the silent wall.'),
		o('protect_students', 'BATTLE', 'protect_students', 'Protect the students through the attack.', { auto: true }),
		o('student_kindness', 'MITZVAH', 'mitzvah', 'Give the weakest student the first recovery item.'),
		o('entrust_students', 'DELIVER', 'rescued_students', 'Entrust every rescued student to Guide ג.'),
		o('meet_dancer', 'TALK', 'D', 'Find the dancing chossid before the final chamber.')
	], { rewards: { exp: 135, zuzim: 42, sparks: 8 } }),
	mission('house_joy', 'Forgotten Joy', 'house', 15, 'Dancing Chossid D', 'House_Of_Forgetting', 'final_declaration', [
		o('restore_song', 'CHOICE', 'restore_song', 'Choose how joy enters before permission.', { sceneId: 'house_joy_choice' }),
		o('joy_mitzvah', 'MITZVAH', 'mitzvah', 'Make another person rejoice.'),
		o('apathy_boss', 'BATTLE', 'one_who_says_does_not_matter', 'Defeat the one who says nothing matters.', { auto: true }),
		o('sea_fire', 'TRAVEL', 'Sea_Of_Fire', 'Cross the Sea of Fire without abandoning memory.')
	], { rewards: { exp: 180, zuzim: 55, sparks: 12 } })
];
