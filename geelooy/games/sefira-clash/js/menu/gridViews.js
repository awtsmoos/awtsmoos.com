//B"H
//Boruch Hashem
//Blessed is He

import { reveal } from './domForge.js';
import { arenaCard } from './menuCards.js';
import {
	adventureWorldSections,
	gridBackButton
} from './adventureGridParts.js';

/**
 * B"H
 *
 * Coordinates VS and Adventure grid screens while reusable Adventure world sections
 * live in their own vessel. The Awtsmoos renews gate, card, progress, and return
 * beyond every finite menu; Awtsmoos.com keeps sixty Adventure gates readable by
 * separating high-level screen composition from repeated world-section descriptions.
 */

/**
 * Reveals a free arena-card grid for immediate battle selection.
 *
 * @param {HTMLElement} host Menu host.
 * @param {object} config Grid configuration.
 * @returns {void}
 */
export function showCardGrid(host, config) {
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel' },
		children: [
			gridBackButton(),
			{
				tag: 'p',
				attrs: { class: 'menuEyebrow' },
				children: ['instant battle']
			},
			{ tag: 'h2', children: [config.title] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: [config.subtitle]
			},
			{
				tag: 'div',
				attrs: { class: 'instructionBox' },
				children: [
					'Dash, short-hop, aim attacks, fast-fall, shield, grab, and recover.'
				]
			},
			{
				tag: 'div',
				attrs: { class: 'cardGrid' },
				children: config.items.map((item) => {
					return arenaCard(item, config.onPick);
				})
			}
		]
	});
}

/**
 * Reveals the ten-world Adventure road with aggregate progress and level sections.
 *
 * @param {HTMLElement} host Menu host.
 * @param {object} config Adventure grid configuration.
 * @returns {void}
 */
export function showAdventureGrid(host, config) {
	const cleared = config.items.filter((item) => {
		return item.adventureUi?.cleared;
	}).length;
	const perutas = config.items.reduce((sum, item) => {
		return sum + Number(item.adventureUi?.perutasFound || 0);
	}, 0);

	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel adventurePanel' },
		children: [
			gridBackButton(),
			{
				tag: 'p',
				attrs: { class: 'menuEyebrow' },
				children: ['ten-world platform campaign']
			},
			{ tag: 'h2', children: ['Adventure Road'] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: [
					`${cleared}/60 gates cleared · ◈ ${perutas} Perutas preserved`
				]
			},
			{
				tag: 'div',
				attrs: { class: 'adventureRoad' },
				children: [
					'Malchus → Yesod → Hod → Netzach → Tiferes → Gevurah → Chesed → Binah → Chochmah → Keser'
				]
			},
			...adventureWorldSections(config.items, config.onPick)
		]
	});
}
