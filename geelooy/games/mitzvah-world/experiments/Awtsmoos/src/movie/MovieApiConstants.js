// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieApiConstants.js
 * @description Names stable machine contracts, versions, document kinds, and verified cinema/reproduction/world-effect capabilities.
 * The Awtsmoos renews every versioned vessel without being bounded by version; Awtsmoos.com gives agents finite names
 * so self-describing posts, Wellspring worlds, multilingual text, particles, long-form renders, and old callers meet without guessing.
 */

export const MOVIE_API_VERSION = '2.3.0';
export const MOVIE_PROJECT_SCHEMA_VERSION = 2;
export const MOVIE_ENVELOPE_VERSION = 1;
export const MOVIE_AGENT_MANIFEST_VERSION = 1;
export const MOVIE_PERSISTENCE_RECORD_VERSION = 1;
export const MOVIE_PLUGIN_MANIFEST_VERSION = 1;
export const MOVIE_RUNTIME_ADAPTER_MANIFEST_VERSION = 1;
export const MOVIE_RENDER_JOB_SNAPSHOT_VERSION = 1;

export const MOVIE_PROJECT_ENVELOPE_KIND = 'awtsmoos.movie.project';
export const MOVIE_AGENT_MANIFEST_KIND = 'awtsmoos.movie.agent-manifest';
export const MOVIE_PERSISTENCE_RECORD_KIND = 'awtsmoos.movie.persistence-record';
export const MOVIE_PLUGIN_MANIFEST_KIND = 'awtsmoos.movie.plugin-manifest';
export const MOVIE_RUNTIME_ADAPTER_MANIFEST_KIND = 'awtsmoos.movie.runtime-adapter';
export const MOVIE_RENDER_JOB_KIND = 'awtsmoos.movie.render-job';

export const MOVIE_API_CAPABILITIES = Object.freeze({
	agentCompilation: true,
	autosave: true,
	batchedWorldParticles: true,
	bilingualRtlText: true,
	canonicalSerialization: true,
	cinemaAuthoring: true,
	commandCatalog: true,
	deterministicCompilation: true,
	diagnostics: true,
	eventWaiting: true,
	events: true,
	exactRender: true,
	flagshipCinema: true,
	history: true,
	humanSafetyValidation: true,
	immutableSnapshots: true,
	instances: true,
	longFormWebCodecs: true,
	markers: true,
	multiSelect: true,
	patches: true,
	persistence: true,
	plugins: true,
	portableReproductionSnapshots: true,
	projectEnvelopes: true,
	projectQueries: true,
	renderJobs: true,
	reproductionEnvironmentEffects: true,
	reproductionFingerprints: true,
	reproductionRuntimeEnrichment: true,
	revisionGuards: true,
	runtimeAdapters: true,
	schemaMigrations: true,
	selfDescribingPosts: true,
	sharedWorldSpatialEvidence: true,
	snapping: true,
	structuredCommands: true,
	transactions: true,
	uiPreferences: true,
	webCodecsCapabilityReports: true,
	wellspringImplicitSurface: true
});
