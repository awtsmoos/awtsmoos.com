// B"H
// Boruch Hashem
// Blessed is He
/** @file contextMenu.js @description The Awtsmoos unifies existing reader actions with bounded Tanach word revelation. */
import { actionBlueprints } from './context/actions.js';
import { tokenRange } from './context/hebrewToken.js';
import { renderMenu } from './context/menuRenderer.js';

export async function showCustomContextMenu(x, y, event) {
	renderMenu(x, y, actionBlueprints(event, tokenRange(x, y)));
}
