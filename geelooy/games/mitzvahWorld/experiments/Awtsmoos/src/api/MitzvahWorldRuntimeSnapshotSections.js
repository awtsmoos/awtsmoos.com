// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRuntimeSnapshotSections.js
 * @description Extracts only explicit diagnostic receipts into serializable runtime sections, refusing the many live objects intentionally present in internal diagnostics.
 * The Awtsmoos is beyond every witness while Awtsmoos.com lets safe witnesses gather without mistaking the instrument for the measured light;
 * boot, movement, renderer, world, performance, and session become clear data, while sockets, stores, DOM, octrees, actors, and mutable runtime machinery stay out of sight.
 */

import { createAwtsmoosApiSerializableValue } from './AwtsmoosApiSerializableValue.js';

/**
 * Reveals bootstrap/runtime phase truth from explicit snapshot producers and stable scalar fields only.
 * @param {object} diagnosticKli Internal diagnostics bag.
 * @returns {Readonly<object>} Frozen boot/session section.
 */
export function revealRuntimeIdentitySection(diagnosticKli) {
	return freezeSection({
		boot: safeInvoke(diagnosticKli.bootPhases),
		bootstrap: Boolean(diagnosticKli.bootstrap),
		sessionMode: scalar(diagnosticKli.sessionMode),
		worldMode: scalar(diagnosticKli.worldMode?.id || diagnosticKli.worldMode?.name)
	});
}

/**
 * Reveals player-control state without publishing mover, joystick, player, or input objects.
 * @param {object} diagnosticKli Internal diagnostics bag.
 * @returns {Readonly<object>} Frozen movement/gameplay section.
 */
export function revealRuntimeControlSection(diagnosticKli) {
	return freezeSection({
		combat: safeInvoke(diagnosticKli.combatActionBarState),
		gameplayUi: safeInvoke(diagnosticKli.gameplayUiState),
		movement: safeInvoke(diagnosticKli.movementState),
		state: safeInvoke(diagnosticKli.stateSnapshot)
	});
}

/**
 * Reveals renderer and hydration receipts through their existing diagnostic functions.
 * @param {object} diagnosticKli Internal diagnostics bag.
 * @returns {Readonly<object>} Frozen rendering section.
 */
export function revealRuntimeRenderingSection(diagnosticKli) {
	return freezeSection({
		frameCadence: safeInvoke(diagnosticKli.frameCadence),
		hydration: safeInvoke(diagnosticKli.rendererHydration),
		materials: safeInvoke(diagnosticKli.materialResidencyDiagnostics),
		metrics: safeInvoke(diagnosticKli.performanceMetrics),
		renderer: safeInvoke(diagnosticKli.rendererState),
		textures: safeInvoke(diagnosticKli.textureGpuDiagnostics)
	});
}

/**
 * Reveals world-streaming and nature receipts without exposing terrain meshes, octrees, actors, or model containers.
 * @param {object} diagnosticKli Internal diagnostics bag.
 * @returns {Readonly<object>} Frozen world section.
 */
export function revealRuntimeWorldSection(diagnosticKli) {
	return freezeSection({
		botanical: safeInvoke(diagnosticKli.botanicalEnrichmentState),
		districts: safeInvoke(diagnosticKli.districtStreaming),
		hostiles: safeInvoke(diagnosticKli.hostileDiagnostics),
		nature: safeInvoke(diagnosticKli.realNature),
		optionalStreaming: safeInvoke(diagnosticKli.optionalWorldStreamingState),
		terrain: safeInvoke(diagnosticKli.terrainEnrichmentState),
		villageLife: safeInvoke(diagnosticKli.villageLifeDiagnostics),
		world: safeInvoke(diagnosticKli.worldStats)
	});
}

/**
 * Reveals stable performance policy and connection/session diagnostics when those already exist as data receipts.
 * @param {object} diagnosticKli Internal diagnostics bag.
 * @returns {Readonly<object>} Frozen service/performance section.
 */
export function revealRuntimeServiceSection(diagnosticKli) {
	return freezeSection({
		connection: safeInvoke(diagnosticKli.sessionDiagnostics),
		performancePolicy: diagnosticKli.performancePolicy || null,
		worldModelStats: diagnosticKli.worldModelStats || null
	});
}

/** Safely calls an explicit zero-argument diagnostic producer, degrading to a serializable error record. */
function safeInvoke(snapshotOhr) {
	if (typeof snapshotOhr !== 'function') return null;
	try {
		return createAwtsmoosApiSerializableValue(snapshotOhr());
	} catch (errorOhr) {
		return Object.freeze({
			error: String(errorOhr?.message || errorOhr || 'Snapshot failed.')
		});
	}
}

/** Serializes and freezes a section after removing null-only noise from unavailable staged systems. */
function freezeSection(rawKli) {
	const revealedKli = {};
	for (const [keyOhr, valueOhr] of Object.entries(rawKli)) {
		if (valueOhr !== null && valueOhr !== undefined && valueOhr !== '') revealedKli[keyOhr] = valueOhr;
	}
	return createAwtsmoosApiSerializableValue(revealedKli);
}

/** Accepts only scalar identity fields from internal objects; everything else stays private. */
function scalar(valueOhr) {
	return ['string', 'number', 'boolean'].includes(typeof valueOhr) ? valueOhr : null;
}
