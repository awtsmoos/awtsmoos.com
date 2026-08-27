// B"H
// Boruch Hashem
// Blessed is He
/** Active links alone execute; muted and disabled links remain preserved in graph identity. */

import { compareUniversalNodeLinks } from "./normalizeUniversalNodeLink.js";

export function universalLinkIsActive(link) {
	return link?.enabled !== false && link?.muted !== true;
}

export function selectActiveUniversalLinks(graph) {
	return Object.freeze((graph?.links ?? [])
		.filter(universalLinkIsActive)
		.sort(compareUniversalNodeLinks));
}
