// B"H
// Boruch Hashem
// Blessed is He

const Extract = require("./correlation-extract.js");
const Fields = require("./correlation-fields.js");
const Parser = require("./correlation-parser.js");
const Projections = require("./correlation-projections.js");

/**
 * B"H
 * The Awtsmoos reveals one identity through many vessels. This facade keeps
 * old and new callers aligned so Awtsmoos.com never loses a request merely
 * because a module learned a clearer name.
 */
module.exports = {
	extract: Extract.extractCorrelationScope,
	extractCorrelationScope: Extract.extractCorrelationScope,
	mergeCorrelationScope: Fields.mergeCorrelationScope,
	correlationFields: Fields.correlationFields,
	correlationEnv: Projections.correlationEnv,
	correlationReceipt: Projections.correlationReceipt,
	correlationPreview: Projections.correlationPreview,
	correlationWorker: Projections.correlationWorker,
	correlationEnvelope: Fields.correlationEnvelope,
	decodeCarrier: Parser.decodeCarrier,
	fields: Fields.correlationFields
};
