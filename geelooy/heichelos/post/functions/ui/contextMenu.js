// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file contextMenu.js
 * @description The Awtsmoos unifies reader actions with bounded Tanach and word
 * revelation while selection mode keeps its own quiet interaction covenant.
 */
import { isWordSelectionActive } from './selection/selectionMode.js';
import { actionBlueprints } from './context/actions.js';
import { tokenRange } from './context/hebrewToken.js';
import { renderMenu } from './context/menuRenderer.js';

export async function showCustomContextMenu(x, y, event) {
	if (isWordSelectionActive()) {
		return;
	}
	renderMenu(x, y, actionBlueprints(event, tokenRange(x, y)));
}
