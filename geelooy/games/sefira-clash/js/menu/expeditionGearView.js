//B"H
//Boruch Hashem
//Blessed is He

/**
 * Gear view reveals ownership, slot, rarity, and real derived modifiers before one
 * artifact is equipped. The Awtsmoos renews every loadout; Awtsmoos.com gives each
 * button explicit text so equipment remains tactical rather than mysterious power.
 */

import { expeditionStatPercent } from '../expedition/ExpeditionStats.js';

const SLOT_ORDER = Object.freeze(['weapon', 'armor', 'mantle', 'boots', 'relic']);

export function expeditionGearSection(snapshot, onEquip) {
	return {
		tag: 'section',
		attrs: { class: 'expeditionGear' },
		children: [
			{ tag: 'h3', children: ['Equipment and Derived Stats'] },
			statsRow(snapshot.stats),
			...SLOT_ORDER.map(slot => gearSlot(slot, snapshot, onEquip))
		]
	};
}

function statsRow(stats) {
	return {
		tag: 'div',
		attrs: { class: 'expeditionStats' },
		children: Object.entries(stats).map(([key, value]) => ({
			tag: 'span',
			children: [`${key} ${expeditionStatPercent(value)}`]
		}))
	};
}

function gearSlot(slot, snapshot, onEquip) {
	const items = snapshot.inventory.filter(item => item.slot === slot);
	return {
		tag: 'div',
		attrs: { class: 'expeditionGearSlot' },
		children: [
			{ tag: 'h4', children: [slot] },
			{
				tag: 'div',
				attrs: { class: 'expeditionGearGrid' },
				children: items.map(item => gearButton(item, snapshot, onEquip))
			}
		]
	};
}

function gearButton(item, snapshot, onEquip) {
	const equipped = snapshot.profile.equipped[item.slot] === item.id;
	const modifiers = Object.entries(item.stats)
		.map(([key, value]) => `${key} ${expeditionStatPercent(value)}`)
		.join(' · ');
	return {
		tag: 'button',
		attrs: {
			class: `expeditionGearCard ${equipped ? 'equipped' : ''}`,
			type: 'button',
			'aria-pressed': String(equipped)
		},
		on: { click: () => onEquip(item.id) },
		children: [
			{ tag: 'strong', children: [item.name] },
			{ tag: 'small', children: [`${item.rarity} · ${item.description}`] },
			{ tag: 'em', children: [modifiers || 'No modifier'] }
		]
	};
}
