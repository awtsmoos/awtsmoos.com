// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UniversalHandlerFactory.js
 * @description
 * The Awtsmoos lets object, texture, GPU, render, schema, events, transactions, and preflight gather as one modular platform layer;
 * Awtsmoos.com keeps orchestration above the recursion-free core so simulation and audits stay bounded while public capability grows.
 */

import { HodAnimatorEventCommands } from '../AnimatorEventCommands.js';
import { GevurahAnimatorGpuCommands } from '../AnimatorGpuCommands.js';
import { KeterAnimatorObjectCommands } from '../AnimatorObjectCommands.js';
import { GevurahAnimatorPreflightCommands } from '../AnimatorPreflightCommands.js';
import { TiferesAnimatorRenderCommands } from '../AnimatorRenderCommands.js';
import { DaasAnimatorSchemaCommands } from '../AnimatorSchemaCommands.js';
import { YesodAnimatorTextureCommands } from '../AnimatorTextureCommands.js';
import { MalchusAnimatorTransactionCommands } from '../AnimatorTransactionCommands.js';

/** Builds universal platform handlers from one canonical store/runtime context. */
export class DaasUniversalHandlerFactory {
	/** @param {object} malchusStore Store. @param {object} keterRuntime Runtime. @param {object} daasRegistry Registry. @returns {object} Handler map. */
	static create(malchusStore, keterRuntime, daasRegistry) {
		return {
			object: new KeterAnimatorObjectCommands(malchusStore),
			texture: new YesodAnimatorTextureCommands(malchusStore, keterRuntime),
			gpu: new GevurahAnimatorGpuCommands(keterRuntime),
			render: new TiferesAnimatorRenderCommands(keterRuntime),
			schema: new DaasAnimatorSchemaCommands(malchusStore, daasRegistry),
			event: new HodAnimatorEventCommands(),
			transaction: new MalchusAnimatorTransactionCommands(malchusStore),
			preflight: new GevurahAnimatorPreflightCommands(malchusStore, keterRuntime)
		};
	}
}
