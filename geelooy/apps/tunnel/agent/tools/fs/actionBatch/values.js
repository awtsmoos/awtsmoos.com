// B"H
// Boruch Hashem
// Blessed is He

const Conditions = require("./conditions.js");
const Resolution = require("./valueResolution.js");

module.exports = {
	evaluateCondition: Conditions.evaluateCondition,
	getPath: Resolution.getPath,
	resolvePayload: Resolution.resolvePayload,
	resolveValue: Resolution.resolveValue
};
