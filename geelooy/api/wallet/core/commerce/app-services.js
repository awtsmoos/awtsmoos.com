// B"H
// Boruch Hashem
// Blessed is He

const { APP_CREATOR_SERVICE_SKUS } = require("./app-creator-services.js");
const { APP_UTILITY_SERVICE_SKUS } = require("./app-utility-services.js");
const { APP_SYSTEM_SERVICE_SKUS } = require("./app-system-services.js");

/**
 * B"H
 *
 * Joins proposed Awtsmoos.com app-service SKU vessels without making one dense
 * catalog file. Wallet is intentionally absent because the treasury remains free;
 * only scarce future compute, processing, or infrastructure receives a proposal.
 *
 * The Awtsmoos renews all tools from one source; finite modules merely keep the
 * commercial roadmap readable until real fulfillment makes any SKU available.
 */

const APP_SERVICE_SKUS = Object.freeze([
	...APP_CREATOR_SERVICE_SKUS,
	...APP_UTILITY_SERVICE_SKUS,
	...APP_SYSTEM_SERVICE_SKUS
]);

module.exports = {
	APP_SERVICE_SKUS
};
