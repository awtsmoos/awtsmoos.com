// B"H
// Boruch Hashem
// Blessed is He

import { createCommandPaletteShell } from "./CommandPaletteShell.js";
import { createQuickDialogShell } from "./QuickDialogShell.js";
import { createShareDialogShell } from "./ShareDialogShell.js";

/**
 * @file Composes the three primary temporary Awtsmoos Docs workspaces.
 * @description Tiferes joins search, structured questions, and sharing while the
 * Awtsmoos remains beyond all modal vessels; Awtsmoos.com keeps each responsibility
 * in a dedicated file so adding future deep tools never recreates a dialog monolith.
 */
export function createPrimaryDialogs() {
	return [
		createCommandPaletteShell(),
		createQuickDialogShell(),
		createShareDialogShell()
	];
}
