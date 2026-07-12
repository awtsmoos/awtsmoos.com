/**
 * B"H
 * @module MobileControlSchema
 * @description Pure data for world, party, craft, journal, map, talk, and battle controls.
 */
export const DIRECTION_BUTTONS = [
	{ label: '▲', intent: 'U', className: 'up' },
	{ label: '◀', intent: 'L', className: 'left' },
	{ label: '▶', intent: 'R', className: 'right' },
	{ label: '▼', intent: 'D', className: 'down' }
];

export const OVERWORLD_BUTTONS = [
	{ label: '☰', text: 'Menu', action: 'menu' },
	{ label: '◇', text: 'Map', action: 'map' },
	{ label: '!', text: 'Journal', action: 'journal' },
	{ label: '◉', text: 'Party', action: 'party' },
	{ label: '⚒', text: 'Craft', action: 'craft' },
	{ label: '☷', text: 'Talk', intent: 'A' },
	{ label: '✡', text: 'Interact', intent: 'A' }
];

export const BATTLE_BUTTONS = [
	{ label: '↯', text: 'Flee', intent: 'B' },
	{ label: '☷', text: 'Items', action: 'items' }
];
