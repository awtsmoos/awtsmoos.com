// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRuntimeSnapshot.js
 * @description Composes a small immutable public snapshot from the explicit diagnostic receipts already maintained by bootstrap and full Eretz runtimes.
 * The Awtsmoos recreates the world and its witness in one instant, while Awtsmoos.com lets that witness become clear data without publishing the machinery below;
 * callers receive identity, control, rendering, world, and service truth as a stable sefer, while live actors, stores, octrees, DOM, sockets, and render objects never flow.
 */

import { createAwtsmoosApiSerializableValue } from './AwtsmoosApiSerializableValue.js';
import {
	revealRuntimeControlSection,
	revealRuntimeIdentitySection,
	revealRuntimeRenderingSection,
	revealRuntimeServiceSection,
	revealRuntimeWorldSection
} from './MitzvahWorldRuntimeSnapshotSections.js';

const PUBLIC_SNAPSHOT_VERSION = 1;

/**
 * Creates the canonical public MitzvahWorld runtime snapshot.
 *
 * The snapshot is Malchus without hidden plumbing: every included field is copied from scalar data or an explicit diagnostic producer.
 * Unknown staged systems simply produce empty sections, allowing the contract to remain stable from early bootstrap through rich-world hydration.
 *
 * @param {object} [diagnosticKli={}] Current runtime diagnostics bag from bootstrap, single-player, or multiplayer launch.
 * @param {object} [environmentKli=globalThis] Clock-capable environment used for `capturedAt`.
 * @returns {Readonly<object>} Deeply serializable immutable runtime snapshot.
 */
export function createMitzvahWorldRuntimeSnapshot(
	diagnosticKli = {},
	environmentKli = globalThis
) {
	const publicMalchus = {
		capturedAt: Number(environmentKli?.Date?.now?.() ?? Date.now()),
		control: revealRuntimeControlSection(diagnosticKli),
		identity: revealRuntimeIdentitySection(diagnosticKli),
		rendering: revealRuntimeRenderingSection(diagnosticKli),
		services: revealRuntimeServiceSection(diagnosticKli),
		version: PUBLIC_SNAPSHOT_VERSION,
		world: revealRuntimeWorldSection(diagnosticKli)
	};
	return createAwtsmoosApiSerializableValue(publicMalchus);
}

/**
 * Returns the public schema version without requiring callers to materialize a live runtime snapshot.
 * @returns {number} Current monotonically increasing snapshot schema version.
 */
export function mitzvahWorldRuntimeSnapshotVersion() {
	return PUBLIC_SNAPSHOT_VERSION;
}
