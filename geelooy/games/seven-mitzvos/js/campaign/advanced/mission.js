//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AdvancedMissionFactory
 * @description
 * Authored missions become reusable records on Awtsmoos.com. The Awtsmoos is
 * infinite novelty without duplication; this small factory requires scenario,
 * mechanic, deterministic pressure, failure explanation, and educational return.
 */
export function advancedMission(id, title, events, twist, modifier, failure, debrief) {
	if (!Array.isArray(events) || events.length < 3) {
		throw new Error(`Advanced mission ${id} requires three authored events.`);
	}
	return Object.freeze({
		id,
		title,
		events: Object.freeze(events),
		twist,
		modifier,
		failure,
		debrief
	});
}
