/**
 * B"H
 * @module CampaignMapSetB
 * @description Court, market, forgetting, fire, and finale maps with semantic glyph lookup.
 */
import * as TileModule from '../TileLexicon.js';

const lexiconEntries = Object.values(TileModule)
	.flatMap(value => value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : [])
	.filter(([, meta]) => meta && typeof meta === 'object');

const glyphFor = (field, value, fallback) => {
	const found = lexiconEntries.find(([, meta]) => meta[field] === value);
	return found?.[0] || fallback;
};

const scroll = glyphFor('questItem', 'scroll', '≡');
const chest = glyphFor('questItem', 'chest', '▣');
const zohar = glyphFor('book', 'ZoharLamp', 'ז');
const mitzvah = glyphFor('kind', 'mitzvah', 'מ');

export const CampaignMapSetB = {
	Rambam_RecipientCourt: [
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
		'W2222222222222222222222222222W',
		'W2♔222222♬222222♙22222222222W',
		'W2222222222222222222222222222W',
		'←222222222⌁222222♨22222222→',
		'W2222222222222222222222222222W',
		'W222222222222משפט2222222222W',
		'W2222222222222222222222222222W',
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
	],
	Market_Of_Exchange: [
		'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
		'T2222222222222222222222222222T',
		`T2נ22${scroll}22${chest}22$22D22$222222T`,
		'←222222222222222222222222222→',
		'T2▲22◆22◇22●22◈22?22222222T',
		'T2222222222222222222222222222T',
		'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
	],
	House_Of_Forgetting: [
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
		`W222ב222${zohar}22מ222ת222222222W`,
		'W2▲222◆222◇222●222◈22222222W',
		'W2222222222222222222222222222W',
		'←2♔222♬222♙222⌁222♨2222222→',
		'W222שכחה222שמחה222פרי222222W',
		`W222C222ק222ג222D222${mitzvah}222222W`,
		'W2222222222222222222222222222W',
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
	],
	Sea_Of_Fire: [
		'FFFFFFFFFFFFFFFFFFFFFFFFF',
		'F222222222♨22222222222F',
		'F22יראה222כפרה222אור22F',
		'←222222222222222222222→',
		'F222222222222222222222F',
		'FFFFFFFFFFFFFFFFFFFFFFFFF'
	],
	Final_Declaration: [
		'WWWWWWWWWWWWWWWWWWWWWW',
		'W000000וידוי00000000W',
		'W00▲0◆0◇0●0◈000000W',
		'←00000ג00000000000→',
		'W000האור הגנוז00000W',
		'WWWWWWWWWWWWWWWWWWWWWW'
	],
	Hidden_Orchard: [
		'TTTTTTTTTTTTTTTTTTTTTT',
		'T111צמצום111דביקות111T',
		'T11111111111111111111T',
		'←11111נסתר111111111→',
		'T11111111111111111111T',
		'TTTTTTTTTTTTTTTTTTTTTT'
	],
	Ohr_HaGanuz_Realm: [
		'OOOOOOOOOOOOOOOOOOOOOOO',
		'O111אור111כתר111אמת11O',
		'O11111111111111111111O',
		'←11111ג1111111111111O',
		'O111אור הגנוז111111O',
		'OOOOOOOOOOOOOOOOOOOOOOO'
	]
};
