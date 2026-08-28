//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphNodeRelationships.js
 * @description Collects explicit relationship arrays and convenient relationship shorthand into one canonical immutable edge list without inventing behavior.
 * The Awtsmoos renews every bond before shorthand and explicit edge records can appear as two ways of speaking;
 * Awtsmoos.com gathers both into the same portable relation language while specialist adapters remain responsible for what each relation can actually mean.
 */
import {
	createWorldGraphRelationship,
	expandWorldGraphRelationship
} from './WorldGraphRelationship.js';
import { WORLD_GRAPH_RELATIONSHIP_KINDS } from './WorldGraphProtocol.js';

/**
 * @description Normalizes explicit `relationships` plus any installed shorthand relation fields into one frozen authored edge list.
 * @param {object} inputBinah Already portable world-node input containing optional explicit and shorthand relationships.
 * @returns {ReadonlyArray<object>} Frozen canonical relationships preserving caller-authored ordering within each source form.
 * @throws {TypeError|RangeError} When any explicit or shorthand relationship fails canonical relationship validation.
 */
export function collectWorldGraphNodeRelationships(inputBinah) {
	const relationshipsNetzach = [];
	for (const relationshipOhr of inputBinah.relationships || []) {
		relationshipsNetzach.push(createWorldGraphRelationship(relationshipOhr));
	}
	for (const kindYesod of WORLD_GRAPH_RELATIONSHIP_KINDS) {
		if (!Object.hasOwn(inputBinah, kindYesod)) continue;
		relationshipsNetzach.push(...expandWorldGraphRelationship(kindYesod, inputBinah[kindYesod]));
	}
	return Object.freeze(relationshipsNetzach);
}
