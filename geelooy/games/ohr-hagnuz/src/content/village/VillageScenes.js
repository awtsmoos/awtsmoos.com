/** B"H @module VillageScenes - neighbors become a story instead of counters. */
import { beat as b, pair } from '../builders/SceneBuilder.js';

export const VillageScenes = [
	...pair('village_floorboards', [
		b('Elder E', 'E', 'My lamp has oil. That is not the problem. Beneath the floor, something whispers that another home deserves darkness more.'),
		b('Guide ג', 'ג', 'Gather clean wicks, carry one flame through the synagogue, and listen before deciding where it burns first.')
	], [
		b('Elder E', 'E', 'You gave light without using another person’s darkness as fuel.'),
		b('Narrator', '✦', 'The floorboards stopped arguing. From the Beis Midrash came the sound of a clasp snapping shut.')
	]),
	...pair('village_sefer', [
		b('Sage ס', 'ס', 'This sefer opens for neither strength nor cleverness. Its two clasps demand precision and warmth together.'),
		b('Sage ס', 'ס', 'Read one page that orders the mind and one that awakens the heart. Then enter the page where distraction hides.')
	], [
		b('Sage ס', 'ס', 'A book opens when the reader agrees to be opened as well.'),
		b('Guide ג', 'ג', 'Good. Now bring those opened voices to the synagogue before midnight.')
	]),
	...pair('village_minyan', [
		b('Guide ג', 'ג', 'We have nine bodies and six listening hearts. A minyan cannot be repaired by counting only what is visible.'),
		b('Guide ג', 'ג', 'Invite the child. Invite the elder. Perform one deed together. Then face the noise that imitates community.')
	], [
		b('Village', '⌂', 'Amen.'),
		b('Narrator', '✦', 'The single word crossed the square like warm rain. The merchant opened his shutters for the first honest market day.')
	]),
	...pair('village_market_day', [
		b('Merchant נ', 'נ', 'Trade is not the enemy. Confusion is. Buy what is ordinary, sell what is yours, and guard what was entrusted.'),
		b('Guide ג', 'ג', 'Learn the difference here, before the greater market tries to erase it.')
	], [
		b('Merchant נ', 'נ', 'You paid for tea and kept the gift beyond price. Remember that distinction.'),
		b('Garden Shepherd', 'ש', 'A basket waits east of the village. It is empty because the orchard has forgotten who receives first.')
	])
];
