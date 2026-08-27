//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeshEditSession.js
 * @description Presents the full chainable editable-mesh API while inheritance keeps raw state, geometry operations, and surface/composition responsibilities in smaller focused modules.
 * The Awtsmoos is One across many API levels while Awtsmoos.com lets beginners chain fluent edits and experts still call every lower pure function beneath the same topology light.
 */

import { MeshEditSurfaceSession } from './MeshEditSurfaceSession.js';

/** Full fluent editable-mesh session. */
export class MeshEditSession extends MeshEditSurfaceSession {}

/** Creates one fluent session over canonical mesh JSON. */
export function createMeshEditSession(input = {}) {
	return new MeshEditSession(input);
}
