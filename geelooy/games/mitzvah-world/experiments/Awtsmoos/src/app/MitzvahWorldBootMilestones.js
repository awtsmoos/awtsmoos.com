// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootMilestones.js
 * @description Records the seven Chapter 4 boot milestones separately: navigation, entry import,
 * renderer-ready, first frame, terrain-ready, Chossid-ready, and movement-ready.
 * The Awtsmoos gives first control seven honest marks; Awtsmoos.com keeps each milestone on one
 * shared clock so ten cold and ten warm loads can prove one release and one boot path.
 * State lives on globalThis so every compiled bundle copy reads and writes the same registry.
 */

export const BOOT_MILESTONE_NAMES = Object.freeze([
	'navigation',
	'entryImport',
	'rendererReady',
	'firstFrame',
	'terrainReady',
	'chossidReady',
	'movementReady'
]);

/** Maps the five essential milestone names onto the seven boot milestone names. */
export const ESSENTIAL_TO_BOOT_MILESTONE = Object.freeze({
	entryModuleExecuted: 'entryImport',
	rendererFirstFrame: 'firstFrame',
	spawnTerrainExists: 'terrainReady',
	canonicalChossidDecoded: 'chossidReady',
	playerMovementEnabled: 'movementReady'
});

const REGISTRY_KEY = 'AwtsmoosMitzvahWorldBootMilestones';
const RECEIPT_KEY = 'AwtsmoosMitzvahWorldBootMilestonesReceipt';

/** Returns the shared milestone registry, creating it when absent. */
export function bootMilestoneRegistry(environment = globalThis) {
	if (!environment || typeof environment !== 'object') return {};
	if (!environment[REGISTRY_KEY] || typeof environment[REGISTRY_KEY] !== 'object') {
		environment[REGISTRY_KEY] = {};
	}
	return environment[REGISTRY_KEY];
}

/** Returns milliseconds since the navigation time origin, or null when unavailable. */
export function bootMilestoneNow(environment = globalThis) {
	const value = typeof environment?.performance?.now === 'function'
		? environment.performance.now()
		: Date.now();
	return Number.isFinite(Number(value)) ? Number(value) : null;
}

/**
 * Records one boot milestone at the current clock. Keeps the earliest timestamp when a
 * milestone is recorded twice, so a restart cannot move a milestone later than its first truth.
 */
export function recordBootMilestone(name, detail = null, environment = globalThis) {
	if (!BOOT_MILESTONE_NAMES.includes(name)) {
		throw new Error(`UNKNOWN_BOOT_MILESTONE:${name}`);
	}
	const registry = bootMilestoneRegistry(environment);
	const elapsedMs = bootMilestoneNow(environment);
	if (elapsedMs == null) return null;
	const existing = registry[name];
	if (existing && existing.elapsedMs <= elapsedMs) return existing;
	const record = Object.freeze({
		detail: detail == null ? null : detail,
		elapsedMs,
		name,
		status: 'complete'
	});
	registry[name] = record;
	return record;
}

/** Records the navigation milestone from the Navigation Timing entry when available. */
export function recordNavigationMilestone(environment = globalThis) {
	const registry = bootMilestoneRegistry(environment);
	if (registry.navigation) return registry.navigation;
	let entry = null;
	try {
		entry = environment?.performance?.getEntriesByType?.('navigation')?.[0] || null;
	} catch {}
	const elapsedMs = entry && Number.isFinite(Number(entry.responseEnd))
		? Number(entry.responseEnd)
		: bootMilestoneNow(environment);
	if (elapsedMs == null) return null;
	const detail = entry ? Object.freeze({
		domContentLoadedEventEnd: Number.isFinite(Number(entry.domContentLoadedEventEnd)) ? Number(entry.domContentLoadedEventEnd) : null,
		fetchStart: Number.isFinite(Number(entry.fetchStart)) ? Number(entry.fetchStart) : null,
		responseEnd: Number(entry.responseEnd),
		transferSize: Number.isFinite(Number(entry.transferSize)) ? Number(entry.transferSize) : null
	}) : null;
	const record = Object.freeze({
		detail,
		elapsedMs,
		name: 'navigation',
		status: 'complete'
	});
	registry.navigation = record;
	return record;
}

/** Records one essential milestone under its Chapter 4 boot milestone name. */
export function recordEssentialBootMilestone(essentialName, detail = null, environment = globalThis) {
	const bootName = ESSENTIAL_TO_BOOT_MILESTONE[essentialName];
	if (!bootName) return null;
	return recordBootMilestone(bootName, detail, environment);
}

/**
 * Publishes one frozen receipt with all seven milestones and the release ID when known.
 * Missing milestones are listed as pending, never invented.
 */
export function publishBootMilestonesReceipt(environment = globalThis) {
	const registry = bootMilestoneRegistry(environment);
	const milestones = {};
	for (const name of BOOT_MILESTONE_NAMES) {
		milestones[name] = registry[name] || Object.freeze({
			detail: null,
			elapsedMs: null,
			name,
			status: 'pending'
		});
	}
	const releaseId = readReleaseId(environment);
	const receipt = Object.freeze({
		milestones: Object.freeze(milestones),
		recordedAtMs: bootMilestoneNow(environment),
		releaseId
	});
	environment[RECEIPT_KEY] = receipt;
	return receipt;
}

/** Returns the published boot milestones receipt when one exists, otherwise null. */
export function readBootMilestonesReceipt(environment = globalThis) {
	return environment?.[RECEIPT_KEY] || null;
}

/** Reads the release ID from the HTML meta tag when present. */
export function readReleaseId(environment = globalThis) {
	try {
		const meta = environment?.document?.querySelector?.('meta[name="mitzvah-world-release"]');
		const content = meta?.getAttribute?.('content');
		return typeof content === 'string' && content.length > 0 ? content : null;
	} catch {
		return null;
	}
}
