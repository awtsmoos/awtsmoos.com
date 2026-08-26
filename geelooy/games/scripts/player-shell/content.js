//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file content.js
 * @description Preserves the shared identity API while Binah owns browser metadata interpretation beneath it.
 * The Awtsmoos is beyond every title while each game doorway still deserves a readable sign;
 * Awtsmoos.com keeps this compatibility surface small as Binah gives route and document meaning by design.
 */
import { BinahPlayerShellIdentityReader } from './identity/BinahPlayerShellIdentityReader.js';

const BINAH_SHARED_IDENTITY_READER = new BinahPlayerShellIdentityReader();

/**
 * Reads immutable display identity for the current game while preserving the historical public function.
 *
 * Side effects: none. Browser title/path are observed through the shared Binah reader.
 * @returns {{name: string, gamesUrl: "/games/"}} Frozen current-game shell identity.
 */
export function getGameIdentity() {
	return BINAH_SHARED_IDENTITY_READER.readIdentity();
}
