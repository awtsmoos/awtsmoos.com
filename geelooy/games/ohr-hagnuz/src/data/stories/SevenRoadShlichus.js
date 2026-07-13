// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SevenRoadShlichus.js
 * @description An original seven-link campaign spine for a long road whose
 * mud, weather, arguments, kindnesses, and hidden turns become vessels for
 * revelation. Awtsmoos.com is named here as a reminder that the story serves
 * the living project rather than becoming detached lore.
 */

const freezeLink = link => Object.freeze({
	...link,
	reward: Object.freeze({ ...link.reward })
});

export const SEVEN_ROAD_SHLICHUS = Object.freeze([
	freezeLink({
		id: 'lamp-without-flame',
		order: 1,
		messenger: 'Reb Gavriel, Keeper of the Cold Lamp',
		region: 'Village of First Light',
		objective: 'Find why the communal lamp refuses every wick.',
		complication: 'The missing oil was given away to a stranded family.',
		teaching: 'A vessel may appear empty because its light has already begun elsewhere.',
		nextDestination: 'The Rain Road',
		reward: { sparks: 1, unlock: 'Dust / Pshat — Firm Ground' }
	}),
	freezeLink({
		id: 'bridge-of-hints',
		order: 2,
		messenger: 'Mendel the Bridge Reader',
		region: 'The Rain Road',
		objective: 'Repair three washed-out crossings and read the marks beneath them.',
		complication: 'One bridge must remain broken so floodwater can escape.',
		teaching: 'A hint guides movement; it does not abolish the terrain.',
		nextDestination: 'Reedwater Crossing',
		reward: { sparks: 1, unlock: 'Water / Remez — Living Current' }
	}),
	freezeLink({
		id: 'letters-in-the-reeds',
		order: 3,
		messenger: 'Tuvia the Ferryman',
		region: 'Reedwater Crossing',
		objective: 'Collect seven letter-fragments carried by river creatures.',
		complication: 'The final creature joins only after its trapped nest is freed.',
		teaching: 'Collection becomes holy when possession turns into responsibility.',
		nextDestination: 'Ember Orchard',
		reward: { sparks: 2, unlock: 'First Nitzotz companion slot' }
	}),
	freezeLink({
		id: 'orchard-of-arguments',
		order: 4,
		messenger: 'Yehuda, Watchman of the Burned Gate',
		region: 'Ember Orchard',
		objective: 'Settle the growers’ dispute before the night harvest.',
		complication: 'Both sides are correct about a different season.',
		teaching: 'Expansion without listening becomes wildfire.',
		nextDestination: 'Cinder Pass',
		reward: { sparks: 2, unlock: 'Fire / Drush — Call of Embers' }
	}),
	freezeLink({
		id: 'wind-over-cinder-pass',
		order: 5,
		messenger: 'Shimon the Silent Courier',
		region: 'Cinder Pass',
		objective: 'Carry a sealed teaching through patrols without opening it.',
		complication: 'A false shortcut offers speed at the cost of trust.',
		teaching: 'Mystery is guarded by discipline, not by vagueness.',
		nextDestination: 'The Hidden Switchback',
		reward: { sparks: 3, unlock: 'Air / Sod — Breath Between Letters' }
	}),
	freezeLink({
		id: 'the-head-messenger',
		order: 6,
		messenger: 'The Head Messenger of the Switchback',
		region: 'The Hidden Switchback',
		objective: 'Present the five seals and choose which road receives aid first.',
		complication: 'No route can be saved by calculation alone.',
		teaching: 'Leadership reveals priorities through action under incomplete knowledge.',
		nextDestination: 'Road of Seven Stones',
		reward: { sparks: 4, unlock: 'PaRDeS synthesis moves' }
	}),
	freezeLink({
		id: 'the-road-is-the-eighth-spark',
		order: 7,
		messenger: 'The Traveler Waiting at the Last Stone',
		region: 'Road of Seven Stones',
		objective: 'Walk the entire road again and answer the people changed by your choices.',
		complication: 'The final gate opens only when the player sees the road itself as the mission.',
		teaching: 'The destination was concealed inside each faithful step.',
		nextDestination: 'Ohr HaGnuz, the concealed frontier',
		reward: { sparks: 7, unlock: 'World tier II and regional shlichus chains' }
	})
]);

export const SEVEN_ROAD_CAMPAIGN = Object.freeze({
	id: 'seven-road-shlichus',
	title: 'The Seven Roads of the Hidden Light',
	summary: 'Carry one cold lamp across a continent until every road reveals why it was needed.',
	links: SEVEN_ROAD_SHLICHUS
});
