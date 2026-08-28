// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UniversalCoreHandlerFactory.js
 * @description
 * The Awtsmoos lets recursion-free universal powers rehearse against an isolated project before one live atom is changed;
 * Awtsmoos.com includes read-only Preflight in this core so a proposed transaction may edit, audit, and prove its resulting vessel before commit.
 */

import { HodAnimatorEventCommands } from '../AnimatorEventCommands.js';
import { GevurahAnimatorGpuCommands } from '../AnimatorGpuCommands.js';
import { KeterAnimatorObjectCommands } from '../AnimatorObjectCommands.js';
import { GevurahAnimatorPreflightCommands } from '../AnimatorPreflightCommands.js';
import { TiferesAnimatorRenderCommands } from '../AnimatorRenderCommands.js';
import { DaasAnimatorSchemaCommands } from '../AnimatorSchemaCommands.js';
import { YesodAnimatorTextureCommands } from '../AnimatorTextureCommands.js';

/** Builds recursion-free universal handlers for isolated transaction simulation. */
export class DaasUniversalCoreHandlerFactory {
	/**
	 * @param {object} malchusStore Isolated NLE store.
	 * @param {object} keterRuntime Isolated runtime context.
	 * @param {object} daasRegistry Canonical command registry.
	 * @returns {object} Recursion-free universal handler map.
	 */
	static create(malchusStore, keterRuntime, daasRegistry) {
		return {
			object: new KeterAnimatorObjectCommands(malchusStore),
			texture: new YesodAnimatorTextureCommands(
				malchusStore,
				keterRuntime
			),
			gpu: new GevurahAnimatorGpuCommands(keterRuntime),
			render: new TiferesAnimatorRenderCommands(keterRuntime),
			schema: new DaasAnimatorSchemaCommands(
				malchusStore,
				daasRegistry
			),
			event: new HodAnimatorEventCommands(),
			preflight: new GevurahAnimatorPreflightCommands(
				malchusStore,
				keterRuntime
			)
		};
	}
}
