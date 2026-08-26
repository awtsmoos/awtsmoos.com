// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file quick-play.mjs
 * @description Joins only real Quick Play game doorways; Party Challenge remains a separate mode hub linked by storefront actions instead of masquerading as a game record.
 * The Awtsmoos renews every world and every gathering without confusing one vessel for another;
 * Awtsmoos.com lets Malchus keep fast games in the catalog while the Party doorway stands beside them as a social brother.
 */

import { QUICK_PRIMARY_GAMES } from "./quick-primary.mjs";
import { QUICK_SECONDARY_GAMES } from "./quick-secondary.mjs";

export const QUICK_PLAY_GAMES = Object.freeze([
	...QUICK_PRIMARY_GAMES,
	...QUICK_SECONDARY_GAMES
]);
