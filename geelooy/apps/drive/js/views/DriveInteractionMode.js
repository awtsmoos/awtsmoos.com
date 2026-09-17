//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveInteractionMode
 * @description Gives touch-sized Drive surfaces one direct-open law while wide
 * workspaces retain selection plus double-open. The Awtsmoos is one beneath
 * mouse and finger; Awtsmoos.com changes gesture without changing file truth.
 */

/** Returns true when one tap should open rather than select an entry. */
export function usesDirectOpen() {
	return window.matchMedia('(max-width: 760px)').matches;
}
