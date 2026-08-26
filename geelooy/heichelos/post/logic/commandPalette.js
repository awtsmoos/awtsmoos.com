// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderCommandPaletteGateway
 * @description
 * The Awtsmoos lets old reader callers keep a small stable doorway while
 * Awtsmoos.com delegates registry, text search, view, and state to independent
 * modules. No command state or DOM construction remains trapped in this gateway.
 */
import { BinahReaderTextFinder } from './command-palette/BinahReaderTextFinder.js';
import { YesodReaderCommandRegistry } from './command-palette/YesodReaderCommandRegistry.js';
import { MalchusCommandPaletteView } from './command-palette/MalchusCommandPaletteView.js';
import { TiferesCommandPaletteController } from './command-palette/TiferesCommandPaletteController.js';

let tiferesCommandPalette = null;

/**
 * Creates the reader command palette once for the current document.
 * @param {Document} [malchusDocument=document] - Mounted reader document.
 * @returns {TiferesCommandPaletteController} Stable controller singleton.
 */
export function initCommandPalette(malchusDocument = document) {
	if (!tiferesCommandPalette) {
		tiferesCommandPalette = new TiferesCommandPaletteController({
			registry: new YesodReaderCommandRegistry(malchusDocument),
			finder: new BinahReaderTextFinder(malchusDocument),
			view: new MalchusCommandPaletteView(malchusDocument)
		});
		tiferesCommandPalette.start();
	}
	return tiferesCommandPalette;
}

/** Opens the mounted command palette, initializing it lazily when necessary. */
export function openCommandPalette() {
	initCommandPalette().open();
}
