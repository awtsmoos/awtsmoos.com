// B"H
/** Defines stable social identity, places, dialogue, and daily anchors for village NPCs. */

import { CANONICAL_HOUSES_BY_ID } from '../village/CanonicalVillageHouses.js';

const SPECS = new Map([
	['great-spark-refinement', spec('elder shliach', 'H12', 'beis-chabad-courtyard', 'guide-visitors', 'inner refinement', [])],
	['light-at-river-crossing', spec('bridge keeper', 'H27', 'village-stone-bridge', 'maintain-bridge', 'responsibility', ['treated-timber'])],
	['sparks-at-east-gate', spec('rabbi', 'H20', 'east-gate', 'counsel-travelers', 'courage', [])],
	['guard-the-shul', spec('gabbai', 'H17', 'shul-plaza', 'prepare-shul', 'communal prayer', [])],
	['shepherds-mercy', spec('shepherd', 'H26', 'upper-pasture', 'tend-flock', 'mercy', ['animal-feed'])],
	['kosher-provision', spec('provisioner', 'H24', 'market-provisions', 'prepare-provisions', 'mindful eating', ['bread', 'cheese'])],
	['orchard-defense', spec('orchard keeper', 'H23', 'east-orchard', 'tend-orchard', 'guardianship', ['orchard-fruit'])],
	['wings-over-lake', spec('watchman', 'H25', 'lake-overlook', 'watch-lake', 'vigilance', [])],
	['wood-for-the-shul', spec('carpenter', 'H16', 'carpenter-workshop', 'shape-timber', 'building together', ['treated-timber'])],
	['flowers-for-shabbos', spec('gardener', 'H22', 'riverfront-gardens', 'tend-flowers', 'Shabbos beauty', ['flower-bundle'])],
	['lost-scroll-by-stream', spec('scribe', 'H18', 'scribe-study', 'write-scroll', 'careful remembrance', ['ink', 'parchment'])],
	['forest-predator-patrol', spec('ranger', 'H21', 'forest-gate', 'patrol-forest', 'protecting life', [])],
	['words-of-light', spec('teacher', 'H19', 'beis-midrash', 'teach-torah', 'words of light', [])]
]);

const PASSAGES = Object.freeze([
	'modeh-ani', 'shema-unity', 'guardian-path', 'peace-prayer', 'living-water'
]);

/** Returns deeply stable life metadata for one canonical quest giver. */
export function friendlyNpcLifeMetadata(quest, index, name = quest.giver.name) {
	const details = SPECS.get(quest.id) || spec('village resident', 'H10', 'market-square', 'serve-neighbors', 'kindness', []);
	const homeSite = CANONICAL_HOUSES_BY_ID[details.homeId] || CANONICAL_HOUSES_BY_ID.H10;
	const home = place(homeSite.id, `House ${homeSite.id}`, homeSite.x, homeSite.z);
	const workplace = place(details.workplaceId, title(details.workplaceId), quest.giver.position.x, quest.giver.position.z);
	const vendor = details.inventory.length ? Object.freeze({
		currency: 'perutas',
		inventory: details.inventory
	}) : null;
	return Object.freeze({
		dailyAnchors: Object.freeze({
			morning: anchor(gatheringPlace('shul-plaza', -72, -48, index), 'pray-shacharis'),
			day: anchor(workplace, details.dayAction),
			evening: anchor(gatheringPlace('market-square', -62, 30, index), 'join-village-gathering'),
			night: anchor(home, 'rest-at-home')
		}),
		dialogue: dialogue(name, details, quest, vendor),
		dialogueModes: dialogueModes(vendor),
		home,
		quest: Object.freeze({ giver: true, ids: Object.freeze([quest.id]) }),
		relationship: Object.freeze({ initial: 'neighbor', targetable: true }),
		role: details.role,
		torah: Object.freeze({ passageIds: Object.freeze([PASSAGES[index % PASSAGES.length]]), topic: details.topic }),
		vendor,
		workplace
	});
}

function spec(role, homeId, workplaceId, dayAction, topic, inventory) {
	return Object.freeze({ dayAction, homeId, inventory: Object.freeze(inventory), role, topic, workplaceId });
}

function dialogue(name, details, quest, vendor) {
	return Object.freeze({
		combatWarning: 'Stay near the lanterns when concealment gathers.',
		farewell: 'Go in peace, and return safely.',
		greeting: `Shalom. I am ${name}, the village ${details.role}.`,
		questCompletion: 'Your help has brought lasting light to our neighbors.',
		questOffer: quest.storyIntroduction || quest.description,
		questProgress: 'Let us review what remains in this Shlichus.',
		torahDiscussion: `We can learn together about ${details.topic}.`,
		vendor: vendor ? 'These provisions are set aside for honest village work.' : null
	});
}

function dialogueModes(vendor) {
	const modes = ['greeting', 'quest-offer', 'quest-progress', 'quest-completion', 'torah-discussion', 'combat-warning', 'farewell'];
	if (vendor) modes.splice(4, 0, 'vendor');
	return Object.freeze(modes);
}

function gatheringPlace(id, x, z, index) {
	const angle = index * 2.399963;
	const radius = 2.2 + index % 4 * 1.15;
	return place(`${id}-${index + 1}`, title(id), x + Math.cos(angle) * radius, z + Math.sin(angle) * radius);
}

function anchor(location, action) {
	return Object.freeze({ action, location });
}

function place(id, label, x, z) {
	return Object.freeze({ id, label, x: Number(x), z: Number(z) });
}

function title(id) {
	return id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}
