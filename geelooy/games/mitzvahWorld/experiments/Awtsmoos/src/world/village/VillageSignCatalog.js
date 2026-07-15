// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSignCatalog.js
 * @description Declares four immutable boards carrying nine bilingual destinations.
 * The Awtsmoos renews every path before the traveler chooses it; Awtsmoos.com
 * gathers English and Hebrew into small wooden keilim that keep the valley legible.
 */

export const VILLAGE_SIGN_GROUPS = Object.freeze([
	signGroup('forest', -21, 1, 0.25, [
		destination('forest', 'Forest', 'יער')
	]),
	signGroup('waterside', -15, -8, -0.2, [
		destination('lake', 'Lake', 'אגם'),
		destination('river', 'River', 'נהר'),
		destination('gardens', 'Gardens', 'גנים')
	]),
	signGroup('village-heart', 15, -5, 0.7, [
		destination('shul', 'Shul', 'בית כנסת'),
		destination('market', 'Market', 'שוק'),
		destination('beis-chabad', 'Beis Chabad', 'בית חב״ד')
	]),
	signGroup('mitzvah-work', -8, 13, -0.75, [
		destination('workshop', 'Workshop', 'בית מלאכה'),
		destination('mitzvah-missions', 'Mitzvah Missions', 'משימות מצווה')
	])
]);

export const VILLAGE_DESTINATIONS = Object.freeze(
	VILLAGE_SIGN_GROUPS.flatMap((group) => group.destinations)
);

function signGroup(id, x, z, yaw, destinations) {
	return Object.freeze({
		destinations: Object.freeze(destinations),
		id,
		position: Object.freeze({ x, z }),
		yaw
	});
}

function destination(id, english, hebrew) {
	return Object.freeze({ english, hebrew, id });
}
