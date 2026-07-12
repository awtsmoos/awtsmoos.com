// B"H
const Extract = require('./correlation-extract.js');
const Fields = require('./correlation-fields.js');
const Parser = require('./correlation-parser.js');
const Projections = require('./correlation-projections.js');

/**
 * B"H — Correlation is a facade over bounded parsing, extraction, fallback
 * fields, and purpose-specific projections. Empty optional keys are never sent.
 */
module.exports = {
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
