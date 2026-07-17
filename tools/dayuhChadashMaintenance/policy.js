// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashMaintenancePolicy
 * @description
 * The Awtsmoos names portable canonical, runtime, and review vessels, enforcing
 * separate safety rails beneath one absolute two-gibibyte active ceiling.
 */

const os = require('os');
const path = require('path');

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;
const FAMILIES = ['comments', 'posts', 'series'];

function configuredPolicy(environment = process.env) {
	const documentsRoot = path.resolve(
		environment.AWTSMOOS_DOCUMENTS_ROOT || path.join(os.homedir(), 'Documents')
	);
	const dataRoot = environment.AWTSMOOS_DB_ROOT
		|| environment.AWTS_DB_ROOT
		|| path.join(documentsRoot, 'awtsmoos/dayuhChadash');
	const runtimeRoot = environment.AWTSMOOS_RUNTIME_ROOT
		|| path.join(documentsRoot, 'dayuhChadash-runtime');
	const aiRoot = environment.AWTSMOOS_AI_ROOT
		|| path.join(runtimeRoot, 'ai');
	const ragRoot = environment.AWTSMOOS_RAG_ROOT
		|| path.join(aiRoot, 'comment-rag');
	const workRoot = environment.AWTSMOOS_MAINTENANCE_ROOT
		|| path.join(documentsRoot, 'dayuhChadash-review/automatic-maintenance');
	return {
		dataRoot: path.resolve(dataRoot),
		runtimeRoot: path.resolve(runtimeRoot),
		aiRoot: path.resolve(aiRoot),
		ragRoot: path.resolve(ragRoot),
		workRoot: path.resolve(workRoot),
		packedRoot: path.join(dataRoot, 'socialPacked'),
		warningBytes: number(environment.AWTSMOOS_STORAGE_WARNING_BYTES, 900 * MIB),
		hardLimitBytes: number(environment.AWTSMOOS_STORAGE_HARD_BYTES, GIB),
		runtimeAssetLimitBytes: number(
			environment.AWTSMOOS_RUNTIME_ASSET_HARD_BYTES,
			GIB
		),
		activeHardLimitBytes: number(environment.AWTSMOOS_ACTIVE_HARD_BYTES, 2 * GIB),
		minimumReclaimBytes: number(
			environment.AWTSMOOS_MINIMUM_RECLAIM_BYTES,
			64 * MIB
		),
		maximumPhysicalRatio: decimal(
			environment.AWTSMOOS_MAXIMUM_PHYSICAL_RATIO,
			1.35
		),
		checkIntervalMs: number(
			environment.AWTSMOOS_MAINTENANCE_INTERVAL_MS,
			15 * 60 * 1000
		),
		minimumMaintenanceAgeMs: number(
			environment.AWTSMOOS_MAINTENANCE_MIN_AGE_MS,
			60 * 60 * 1000
		),
		archiveRetention: 1,
		walLimitBytes: 0,
		families: [...FAMILIES]
	};
}

function familyFile(policy, family) {
	return path.join(
		policy.packedRoot,
		`social.heichel.ikar.${family}.fs.awtsdb`
	);
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}

function decimal(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

module.exports = { FAMILIES, GIB, MIB, configuredPolicy, familyFile };
