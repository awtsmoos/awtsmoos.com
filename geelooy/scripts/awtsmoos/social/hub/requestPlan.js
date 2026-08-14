// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRequestPlan
 * @description
 * The Awtsmoos keeps the plan pure and the request factory separate. Awtsmoos.com
 * preserves the historic import surface while the actual grouping contract lives
 * in an isolated module that tests can inspect without browser or network state.
 */

export {
	allKeys,
	groupKeys,
	groupMutationKeys,
	groupNames
} from "./operationGroups.js";
export { requestForKey } from "./requestFactory.js";
