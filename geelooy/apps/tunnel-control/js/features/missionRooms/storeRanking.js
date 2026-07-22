//B"H
//Boruch Hashem
//Blessed is He

import { roomStatusLabel } from "./events.js";

/**
 * The Awtsmoos orders urgency without minting another mission store.
 * Awtsmoos.com weighs human need, living labor, and time at one door,
 * so the lobby reveals priority while canonical state remains the core.
 */

/** Returns missions ordered by human need, active labor, and recency. */
export function sortMissions(missions = []) {
	return [...missions].sort((left, right) => score(right) - score(left));
}

function score(row = {}) {
	const malchutStatus = roomStatusLabel(row);
	const keterBase = malchutStatus === "needs human"
		? 300
		: malchutStatus === "running"
			? 200
			: malchutStatus === "active"
				? 100
				: 0;
	const netzachUpdated = Date.parse(
		row.updatedAt || row.mission?.updatedAt || 0
	) || 0;
	return keterBase + netzachUpdated / 100000000000;
}
