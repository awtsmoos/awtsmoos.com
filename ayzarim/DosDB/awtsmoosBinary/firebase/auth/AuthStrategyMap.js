
// B"H
/**
 * @file AuthStrategyMap.js
 * @description
 * Like the 10 Sefirot organized in three columns, we organize our authentication 
 * strategies. The "Right" is Chesed (Simple API Key), the "Left" is Gevurah 
 * (Structured Service Account), and the "Middle" is Tiferet (No Auth/Public).
 * 
 * We use a data array of predicates. We do not use 'switch'. We find the 
 * first strategy whose condition is met by the Divine Config.
 */

const ServiceAccountAuth = require("./ServiceAccountAuth.js");
const ApiKeyAuth = require("./ApiKeyAuth.js");
const NoAuth = require("./NoAuth.js");

/**
 * Data-driven mapping of authentication conditions.
 */
const AuthStrategies = [
    {
        // Checked after normalization by the Validator
        condition: (config) => !!config.serviceAccount && !!config.serviceAccount.private_key,
        instantiate: (config) => new ServiceAccountAuth(config.serviceAccount)
    },
    {
        condition: (config) => !!config.apiKey,
        instantiate: (config) => new ApiKeyAuth(config.apiKey)
    },
    {
        condition: () => true,
        instantiate: () => new NoAuth()
    }
];

class AuthStrategyMap {
    /**
     * @method getStrategy
     * @description Matches the config to its spiritual authentication Chariot.
     * @param {Object} normalizedConfig 
     * @returns {Object}
     */
    static getStrategy(normalizedConfig) {
        const strategyDef = AuthStrategies.find(strat => strat.condition(normalizedConfig));
        return strategyDef.instantiate(normalizedConfig);
    }
}

module.exports = AuthStrategyMap;
