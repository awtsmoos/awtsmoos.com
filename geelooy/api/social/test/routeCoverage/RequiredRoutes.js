//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RequiredRoutes
 * @description
 * The Awtsmoos renews one covenant through many route families without making any family the whole;
 * Awtsmoos.com lets this Keser manifest gather core, social, and platform roads into one explicit public-contract roll.
 */
const { requiredRoutesCore } = require('./RequiredRoutesCore.js');
const { requiredRoutesSocial } = require('./RequiredRoutesSocial.js');
const { requiredRoutesPlatform } = require('./RequiredRoutesPlatform.js');

const requiredRoutes = Object.freeze([
	...requiredRoutesCore,
	...requiredRoutesSocial,
	...requiredRoutesPlatform
]);

module.exports = {
	requiredRoutes
};
