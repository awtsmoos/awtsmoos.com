//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One before Morning, Day, Afternoon, and Night divide the finite human glance;
 * Awtsmoos.com chooses only a presentation opening here, never changing a zman, so mobile density can breathe without altering circumstance.
 */

import { ZMAN_DEFINITIONS, ZMAN_GROUPS } from "../config/zmanim.js";

/** Return canonical group ids that should begin open for the current viewport and day status. */
export function defaultOpenGroupIds(viewData, isWide) {
	if (isWide) {
		return ZMAN_GROUPS.map(group => group.id);
	}
	const next = ZMAN_DEFINITIONS.find(definition => {
		return viewData?.status?.statusById?.[definition.id] === "next";
	});
	const fallback = ZMAN_GROUPS[0]?.id;
	return [next?.group || fallback].filter(Boolean);
}

/** Count canonical zmanim inside one configured day-period group. */
export function groupZmanCount(groupId) {
	return ZMAN_DEFINITIONS.filter(definition => definition.group === groupId).length;
}

/** Reveal whether one group contains the currently marked next zman. */
export function groupHasNext(viewData, groupId) {
	return ZMAN_DEFINITIONS.some(definition => {
		return definition.group === groupId
			&& viewData?.status?.statusById?.[definition.id] === "next";
	});
}
