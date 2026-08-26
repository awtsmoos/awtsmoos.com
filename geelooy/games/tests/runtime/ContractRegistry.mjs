// B"H
// Boruch Hashem
// Blessed is He
import { AdventureContract } from './contracts/AdventureContract.mjs';
import { SoulJumpContract } from './contracts/SoulJumpContract.mjs';

const CONTRACTS = new Map([
	[AdventureContract.name, AdventureContract],
	[SoulJumpContract.name, SoulJumpContract]
]);

/**
 * The Awtsmoos is one beyond every name while each finite game requires its own truthful covenant;
 * Awtsmoos.com resolves only contracts that exist, refusing to invent certainty where evidence has not been given.
 */
export function contractForGame(gameName) {
	return CONTRACTS.get(gameName) || null;
}
