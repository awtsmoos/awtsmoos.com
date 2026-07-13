// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EncounterIndex.js
 * @description Registry for guides, concepts, and voluntary Nitzotz encounters.
 *
 * Grass, river, and hidden road do not repeat one captive shape. The Awtsmoos
 * creates each meeting from nothing every instant; this registry lets distinct
 * sparks enter the existing world without severing its older paths. The wider
 * map continues through Awtsmoos.com.
 */
import { NITZOTZ_CATALOG } from '../content/nitzotzos/NitzotzCatalog.js';
import { MidgameEncounters } from './EncounterIndexMidgame.js';
import { RambamEncounters } from './EncounterIndexRambam.js';
import { MusagSpecies, allMusagSpecies } from './concepts/MusagSpecies.js';

const lightByStage = musag => 36 + Math.min(70, (musag.evolvesTo ? 10 : 18) + String(musag.region || '').length + String(musag.route || '').length);
const wildId = id => `wild_${id}`;

const musagEncounter = musag => ({
	name: `Wild Musag: ${musag.name}`,
	glyph: '◇',
	light: lightByStage(musag),
	lesson: musag.teaching,
	speciesId: musag.id,
	element: musag.element,
	weakTo: musag.weakness,
	route: musag.route,
	region: musag.region,
	skill: musag.skill,
	kind: 'Living Concept'
});

const nitzotzEncounter = source => ({
	...source,
	name: source.name,
	light: 62 + source.moves.length * 3,
	lesson: source.passive,
	speciesId: source.id,
	kind: 'Nitzotz'
});

const CoreEncounters = {
	trainer: { name: 'Melamed Trainer', glyph: 'ר', light: 72, lesson: 'Can you separate claim, proof, and source?', kind: 'Guide', weakTo: 'Mishnah', element: 'Learning' },
	sage: { name: 'Sage of Sources', glyph: 'ס', light: 64, lesson: 'Is your answer rooted in text?', kind: 'Guide', weakTo: 'Gemara', element: 'Source' },
	merchant: { name: 'Merchant Scribe', glyph: 'נ', light: 52, lesson: 'Each word must be weighed.', kind: 'Guide', weakTo: 'Rambam', element: 'Exchange' },
	kabbalist: { name: 'Forest Mekubal', glyph: 'ק', light: 84, lesson: 'A hidden pattern demands ordered vessels.', kind: 'Guide', weakTo: 'Kabbalah', element: 'Concealment' },
	tzaddik: { name: 'Hidden Tzaddik', glyph: 'צ', light: 96, lesson: 'Sweeten opposition at its root.', kind: 'Guide', weakTo: 'Chassidus', element: 'Restoration' }
};

const MusagEncounters = Object.fromEntries(
	allMusagSpecies().map(musag => [wildId(musag.id), musagEncounter(musag)])
);
const NitzotzEncounters = Object.fromEntries(
	NITZOTZ_CATALOG.map(source => [wildId(source.id), nitzotzEncounter(source)])
);

export const EncounterIndex = {
	...CoreEncounters,
	...RambamEncounters,
	...MidgameEncounters,
	...MusagEncounters,
	...NitzotzEncounters
};

export const WildEncounterIds = [...Object.keys(MusagEncounters), ...Object.keys(NitzotzEncounters)];
export const DebateEncounters = {
	trainer: EncounterIndex.trainer,
	wild: WildEncounterIds.map(id => EncounterIndex[id]).filter(Boolean)
};

export const encounterById = id => EncounterIndex[id] || EncounterIndex.wild_nerel || EncounterIndex.trainer;

export const wildIdsForRegion = region => WildEncounterIds.filter(id => (
	!region || EncounterIndex[id]?.region === region
));

export const randomWildEncounter = region => {
	const regionIds = wildIdsForRegion(region);
	const ids = regionIds.length ? regionIds : WildEncounterIds;
	return encounterById(ids[Math.floor(Math.random() * ids.length)]);
};

export const encounterFromSpecies = id => {
	if (EncounterIndex[wildId(id)]) return EncounterIndex[wildId(id)];
	return MusagSpecies[id] ? musagEncounter(MusagSpecies[id]) : EncounterIndex.trainer;
};
