/** B"H @module HouseScenes - memory becomes dungeon architecture. */
import { beat as b, pair, scene } from '../builders/SceneBuilder.js';

export const HouseScenes = [
	...pair('house_blessings', [
		b('House Voice', '⌂', 'You ate, built, studied, and survived. Name the One who gave the ability to name any of it.'),
		b('Ohr Chozer', 'א', 'Memory begins before possession and continues after satisfaction.')
	], [
		b('House Voice', '⌂', 'The first chamber remembers blessing.'),
		b('Forest Mekubal ק', 'ק', 'The second forgot every teacher but preserved every quotation.')
	]),
	...pair('house_teachers', [
		b('Forest Mekubal ק', 'ק', 'The room can repeat my words perfectly. It cannot admit that it received them.'),
		b('Arrogance', '▲', 'A teaching is mine the instant I understand it.')
	], [
		b('Forest Mekubal ק', 'ק', 'You restored the giver to the teaching without weakening the student.'),
		b('Small Child C', 'C', 'The next room remembers every teacher and has forgotten every child.')
	]),
	...pair('house_students', [
		b('Small Child C', 'C', 'The wall opens only when the strongest person walks behind everyone else.'),
		b('Ohr Chozer', 'א', 'Then the strongest place is the rear, where no one becomes forgotten.')
	], [
		b('Small Child C', 'C', 'Everyone came home. The House is angry that its missing names were counted.'),
		b('Dancing Chossid D', 'D', 'One chamber remains. It remembers duty and has murdered joy.')
	]),
	...pair('house_joy', [
		b('Dancing Chossid D', 'D', 'The room says rejoicing is childish while the world is broken.'),
		b('Ohr Chozer', 'א', 'Then joy will become our refusal to let brokenness own the whole world.')
	], [
		b('Dancing Chossid D', 'D', 'Apathy had no answer for joy that remembered pain and still chose life.'),
		b('Sea of Fire', 'F', 'Bring every restored memory through the fire. What is false will burn; what is entrusted will remain.')
	]),
	scene('house_joy_choice', [
		b('Dancing Chossid D', 'D', 'The room will not authorize joy. How will you enter anyway?', { choices: [
			{ id: 'sing', label: 'Sing before permission', action: 'missionChoice', value: 'restore_song' },
			{ id: 'dance', label: 'Dance for the forgotten', action: 'missionChoice', value: 'restore_song' }
		] })
	])
];
