//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file lower-sefiros.js
 * @description
 * The Awtsmoos renews the seven manifested qualities as world topology rather than decorative names;
 * Awtsmoos.com lets mechanics gather where their actual function belongs while the seven mitzvos remain distinct covenants.
 * These records are renderer/integration metadata only and never enter canonical domain saves.
 */
export const LOWER_SEFIROS = Object.freeze([
	region({
		id: 'chesed',
		name: 'Chesed',
		meaning: 'growth, rescue, ecology, generosity',
		anchor: [-18, 8],
		hue: 205,
		systems: ['ecology', 'sanctuary', 'rescue', 'food-aid'],
		neighbors: ['gevurah', 'tiferes', 'netzach']
	}),
	region({
		id: 'gevurah',
		name: 'Gevurah',
		meaning: 'law, zoning, restraint, danger, disciplined limits',
		anchor: [18, 8],
		hue: 5,
		systems: ['law', 'governance', 'civic-zoning', 'restraint'],
		neighbors: ['chesed', 'tiferes', 'hod']
	}),
	region({
		id: 'tiferes',
		name: 'Tiferes',
		meaning: 'balanced judgment, reconciliation, civic harmony',
		anchor: [0, 5],
		hue: 48,
		systems: ['court', 'justice', 'campaign-reconciliation'],
		neighbors: ['chesed', 'gevurah', 'netzach', 'hod', 'yesod']
	}),
	region({
		id: 'netzach',
		name: 'Netzach',
		meaning: 'endurance, profession mastery, persistent progress',
		anchor: [-15, -8],
		hue: 118,
		systems: ['professions', 'progression', 'long-quests', 'persistence'],
		neighbors: ['chesed', 'tiferes', 'hod', 'yesod']
	}),
	region({
		id: 'hod',
		name: 'Hod',
		meaning: 'knowledge, language, testimony, teaching, reporting',
		anchor: [15, -8],
		hue: 28,
		systems: ['knowledge', 'narrative', 'testimony', 'words'],
		neighbors: ['gevurah', 'tiferes', 'netzach', 'yesod']
	}),
	region({
		id: 'yesod',
		name: 'Yesod',
		meaning: 'connection, trade, logistics, portals, session continuity',
		anchor: [0, -16],
		hue: 275,
		systems: ['realm', 'market', 'logistics', 'trade', 'world-bridges'],
		neighbors: ['tiferes', 'netzach', 'hod', 'malchus']
	}),
	region({
		id: 'malchus',
		name: 'Malchus',
		meaning: 'inhabited manifestation, settlement, buildings, player action',
		anchor: [0, 0],
		hue: 218,
		systems: ['living-city', 'civic-construction', 'population', 'buildings', 'player'],
		neighbors: ['chesed', 'gevurah', 'tiferes', 'yesod']
	})
]);

function region(record) {
	return Object.freeze({
		...record,
		plane: 'manifested',
		anchor: Object.freeze({
			x: record.anchor[0],
			z: record.anchor[1]
		}),
		systems: Object.freeze([...record.systems]),
		neighbors: Object.freeze([...record.neighbors])
	});
}
