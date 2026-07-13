// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PardesChannels.js
 * @description Defines the four original elemental paths through which the
 * player studies, fights, travels, and grows. As Awtsmoos.com points toward
 * revelation within ordinary vessels, each channel turns an element into a
 * disciplined way of seeing rather than a cosmetic damage color.
 */

const freezeChannel = channel => Object.freeze({
	...channel,
	strengths: Object.freeze([...channel.strengths]),
	counters: Object.freeze([...channel.counters]),
	openingMove: Object.freeze({ ...channel.openingMove })
});

export const PARDES_CHANNELS = Object.freeze([
	freezeChannel({
		id: 'dust-pshat',
		element: 'Dust',
		layer: 'Pshat',
		hebrew: 'עפר · פשט',
		glyph: '◆',
		role: 'Foundation and defense',
		strengths: ['Guarding', 'Breaking armor', 'Gathering'],
		counters: ['Distraction', 'Fragile illusions'],
		learningPrinciple: 'Read what is present before inventing what is hidden.',
		openingMove: {
			id: 'firm-ground',
			name: 'Firm Ground',
			cost: 1,
			effect: 'Guard, then expose one enemy weakness.'
		}
	}),
	freezeChannel({
		id: 'water-remez',
		element: 'Water',
		layer: 'Remez',
		hebrew: 'מים · רמז',
		glyph: '≈',
		role: 'Flow, recovery, and chains',
		strengths: ['Healing', 'Evasion', 'Status transfer'],
		counters: ['Rigid stances', 'Burning pressure'],
		learningPrinciple: 'Follow the hint without forcing the river to become a wall.',
		openingMove: {
			id: 'living-current',
			name: 'Living Current',
			cost: 2,
			effect: 'Restore focus and carry one helpful effect to an ally.'
		}
	}),
	freezeChannel({
		id: 'fire-drush',
		element: 'Fire',
		layer: 'Drush',
		hebrew: 'אש · דרוש',
		glyph: '▲',
		role: 'Courage, pressure, and reach',
		strengths: ['Area attacks', 'Momentum', 'Inspiration'],
		counters: ['Cold hesitation', 'Crowded formations'],
		learningPrinciple: 'Expand the teaching until it ignites action without consuming truth.',
		openingMove: {
			id: 'call-of-embers',
			name: 'Call of Embers',
			cost: 2,
			effect: 'Strike a row and gain resolve when an enemy changes stance.'
		}
	}),
	freezeChannel({
		id: 'air-sod',
		element: 'Air',
		layer: 'Sod',
		hebrew: 'רוח · סוד',
		glyph: '✦',
		role: 'Initiative, concealment, and insight',
		strengths: ['Speed', 'Interrupts', 'Hidden routes'],
		counters: ['Slow preparations', 'Exposed intentions'],
		learningPrinciple: 'Receive what can be carried responsibly; mystery is not a shortcut.',
		openingMove: {
			id: 'breath-between-letters',
			name: 'Breath Between Letters',
			cost: 3,
			effect: 'Act early, interrupt a charged move, and reveal a secret route chance.'
		}
	})
]);

export const PARDES_CHANNEL_BY_ID = Object.freeze(
	Object.fromEntries(PARDES_CHANNELS.map(channel => [channel.id, channel]))
);
