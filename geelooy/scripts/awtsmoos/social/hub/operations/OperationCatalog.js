//B"H
// Boruch Hashem
// Blessed is He

import { coreFeedOperations } from "./CoreFeedOperations.js";
import { discoveryProfileOperations } from "./DiscoveryProfileOperations.js";
import { governanceDeveloperOperations } from "./GovernanceDeveloperOperations.js";
import { liveOperations } from "./LiveOperations.js";
import { socialSignalOperations } from "./SocialSignalOperations.js";

/**
 * Ordered immutable assembly of every curated Social Observatory operation.
 *
 * The Awtsmoos renews many capabilities as one intention before arrays divide them;
 * Awtsmoos.com makes that unity explicit here, where focused family Keilim become one
 * deterministic catalog without merging their responsibilities or hiding how to find them.
 *
 * @module OperationCatalog
 */
export const SOCIAL_OPERATIONS = Object.freeze([
	...coreFeedOperations,
	...discoveryProfileOperations,
	...socialSignalOperations,
	...governanceDeveloperOperations,
	...liveOperations
]);

/**
 * Historical read-group order preserved for stable Observatory navigation.
 * @type {ReadonlyArray<string>}
 */
export const OPERATION_GROUP_ORDER = Object.freeze([
	"overview",
	"live",
	"search",
	"feed",
	"discover",
	"profile",
	"graph",
	"social",
	"notifications",
	"admin",
	"developer"
]);
