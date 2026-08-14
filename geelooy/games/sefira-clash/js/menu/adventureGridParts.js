//B"H
//Boruch Hashem
//Blessed is He

import { ADVENTURE_WORLDS } from '../data/adventure/adventureWorlds.js';
import { levelCard } from './menuCards.js';

/**
 * B"H
 *
 * Builds Adventure-road world sections and the shared menu-back control. The
 * Awtsmoos renews gate, world, progress, and road beyond every finite card;
 * Awtsmoos.com keeps these repeated DOM-forge descriptions outside the public grid
 * coordinator so the menu can reveal sixty gates without becoming one dense vessel.
 */

/**
 * Builds all Adventure world sections in authored world order.
 *
 * @param {Array<object>} items Decorated Adventure map records.
 * @param {Function} onPick Level selection callback.
 * @returns {Array<object>} DOM-forge section descriptions.
 */
export function adventureWorldSections(items, onPick) {
	return ADVENTURE_WORLDS.map((world) => {
		const levels = items.filter((item) => {
			return item.adventure?.worldNo === world.no;
		});
		const cleared = levels.filter((item) => {
			return item.adventureUi?.cleared;
		}).length;
		return worldSection(world, levels, cleared, onPick);
	});
}

/**
 * Builds the common back-to-mode button used by card grids.
 *
 * @returns {object} DOM-forge button description.
 */
export function gridBackButton() {
	return {
		tag: 'button',
		attrs: {
			class: 'backMenuButton',
			type: 'button',
			'data-menu-back': 'mode'
		},
		children: ['← Gates']
	};
}

function worldSection(world, levels, cleared, onPick) {
	return {
		tag: 'section',
		attrs: {
			class: 'adventureWorld',
			style: `--world-hue:${world.hue}`
		},
		children: [
			{
				tag: 'header',
				attrs: { class: 'worldHeader' },
				children: [
					{ tag: 'strong', children: [`World ${world.no}: ${world.name}`] },
					{ tag: 'span', children: [`${cleared}/6 cleared`] },
					{ tag: 'small', children: [world.description] }
				]
			},
			{
				tag: 'div',
				attrs: { class: 'levelGrid' },
				children: levels.map((item) => levelCard(item, onPick))
			}
		]
	};
}
