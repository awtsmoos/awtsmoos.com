//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Expert Reality JSON barrel exposing layered discovery, intent, World Graph, protocol, schemas, portability, projection, validation, and final portable façade contracts.
 * The Awtsmoos renews one covenant before expert modules divide its names across files;
 * Awtsmoos.com keeps this barrel narrow so editors and transports can import portable law while Reality and Universal preserve their separate lives.
 */
export { RealityJsonFacade } from './RealityJsonFacade.js';
export { RealityJsonDiscoveryFacade } from './RealityJsonDiscoveryFacade.js';
export {
	RealityJsonIntentFacade,
	normalizeRealityJsonIntentRequest
} from './RealityJsonIntentFacade.js';
export { RealityJsonWorldGraphFacade } from './RealityJsonWorldGraphFacade.js';
export {
	cloneRealityJsonPortable,
	isRealityJsonPortable
} from './RealityJsonPortable.js';
export {
	projectRealityJsonResult,
	unsupportedRealityJsonProjection
} from './RealityJsonProjection.js';
export {
	REALITY_JSON_PROTOCOL_ID,
	REALITY_JSON_PROTOCOL_VERSION,
	createRealityJsonProtocolInfo
} from './RealityJsonProtocol.js';
export {
	REALITY_JSON_CATALOG_SCHEMA,
	REALITY_JSON_DEFAULTS_SCHEMA,
	REALITY_JSON_INTENT_REQUEST_SCHEMA,
	REALITY_JSON_PRESET_SCHEMA,
	REALITY_JSON_PROFILE_SCHEMA,
	REALITY_JSON_PROTOCOL_SCHEMA,
	createRealityJsonSchemaCatalog
} from './RealityJsonSchemas.js';
export {
	REALITY_JSON_WORLD_DIFF_SCHEMA,
	REALITY_JSON_WORLD_EDIT_SCHEMA,
	REALITY_JSON_WORLD_GRAPH_SCHEMA,
	REALITY_JSON_WORLD_PLAN_SCHEMA,
	REALITY_JSON_WORLD_QUERY_SCHEMA,
	createRealityJsonWorldGraphSchemaCatalog
} from './RealityJsonWorldGraphSchemas.js';
export { createRealityJsonValidationReport } from './RealityJsonValidation.js';
