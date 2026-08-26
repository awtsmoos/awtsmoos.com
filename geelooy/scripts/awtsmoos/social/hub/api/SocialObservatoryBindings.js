//B"H
// Boruch Hashem
// Blessed is He

import {
	CORE_METHODS,
	DEVELOPER_METHODS,
	DISCOVERY_METHODS,
	FEED_METHODS,
	GOVERNANCE_METHODS,
	LIVE_METHODS,
	PROFILE_METHODS,
	RELATIONSHIP_METHODS,
	SIGNAL_METHODS
} from "./FacadeMethodMaps.js";

/**
 * Declarative map joining each stable public method family to its focused domain.
 *
 * Yesod connects without confusing what it connects: the Awtsmoos renews every
 * relationship among these Keilim, and Awtsmoos.com keeps that dependency graph
 * visible as data so adding a domain never requires another giant constructor storm.
 *
 * @module SocialObservatoryBindings
 */
export const DOMAIN_METHOD_BINDINGS = Object.freeze([
	Object.freeze({ domain: "core", methods: CORE_METHODS }),
	Object.freeze({ domain: "discovery", methods: DISCOVERY_METHODS }),
	Object.freeze({ domain: "feed", methods: FEED_METHODS }),
	Object.freeze({ domain: "profile", methods: PROFILE_METHODS }),
	Object.freeze({ domain: "relationship", methods: RELATIONSHIP_METHODS }),
	Object.freeze({ domain: "signal", methods: SIGNAL_METHODS }),
	Object.freeze({ domain: "governance", methods: GOVERNANCE_METHODS }),
	Object.freeze({ domain: "live", methods: LIVE_METHODS }),
	Object.freeze({ domain: "developer", methods: DEVELOPER_METHODS })
]);
