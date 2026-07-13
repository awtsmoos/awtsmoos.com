//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the grid views vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { ADVENTURE_WORLDS } from '../data/adventure/adventureWorlds.js';
import { reveal } from './domForge.js';
import { arenaCard, levelCard } from './menuCards.js';

/**
 * Reveals VS arenas as a free grid and Adventure as ten readable world chapters.
 * Sixty gates are many, but not chaos: the Awtsmoos unifies them into a road whose
 * worlds, counts, goals, and treasure remain legible on phone and desktop.
 */
export function showCardGrid(host, config) {
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel' },
		children: [
			backButton(),
			{ tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['instant battle'] },
			{ tag: 'h2', children: [config.title] },
			{ tag: 'p', attrs: { class: 'menuPoem' }, children: [config.subtitle] },
			{
				tag: 'div',
				attrs: { class: 'instructionBox' },
				children: ['Dash, short-hop, aim attacks, fast-fall, shield, grab, and recover.']
			},
			{
				tag: 'div',
				attrs: { class: 'cardGrid' },
				children: config.items.map(item => {
					return arenaCard(item, config.onPick);
				})
			}
		]
	});
}

/**
 * Reveals the show adventure grid behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} host The host value entering this behavior.
 * @param {*} config The config value entering this behavior.
 */
export function showAdventureGrid(host, config) {
	const cleared = config.items.filter(item => item.adventureUi?.cleared).length;
	const perutas = config.items.reduce((sum, item) => {
		return sum + Number(item.adventureUi?.perutasFound || 0);
	}, 0);
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel adventurePanel' },
		children: [
			backButton(),
			{
				tag: 'p',
				attrs: { class: 'menuEyebrow' },
				children: ['ten-world platform campaign']
			},
			{ tag: 'h2', children: ['Adventure Road'] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: [`${cleared}/60 gates cleared · ◈ ${perutas} Perutas preserved`]
			},
			{
				tag: 'div',
				attrs: { class: 'adventureRoad' },
				children: [
					'Malchus → Yesod → Hod → Netzach → Tiferes → Gevurah → Chesed → Binah → Chochmah → Keser'
				]
			},
			...worldSections(config.items, config.onPick)
		]
	});
}

function worldSections(items, onPick) {
	return ADVENTURE_WORLDS.map(world => {
		const levels = items.filter(item => item.adventure?.worldNo === world.no);
		const cleared = levels.filter(item => item.adventureUi?.cleared).length;
		return {
			tag: 'section',
			attrs: { class: 'adventureWorld', style: `--world-hue:${world.hue}` },
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
					children: levels.map(item => {
						return levelCard(item, onPick);
					})
				}
			]
		};
	});
}

function backButton() {
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
