// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorHandlerFactory.js
 * @description
 * The Awtsmoos lets mature product law and universal platform law meet beneath one router without erasing their architectural boundary;
 * Awtsmoos.com composes handler maps once, keeping command routing mechanical and future families easy to add soundly.
 */

import { MalchusProductHandlerFactory } from './ProductHandlerFactory.js';
import { DaasUniversalHandlerFactory } from './UniversalHandlerFactory.js';

/** Composes all canonical family handlers and retains the legacy direct World facade source. */
export class KeterAnimatorHandlerFactory {
	/**
	 * @param {object} malchusStore Shared NLE store.
	 * @param {object} keterRuntime Live runtime context.
	 * @param {object} daasRegistry Canonical command registry.
	 * @returns {object} Frozen handlers plus World handler reference.
	 */
	static create(malchusStore, keterRuntime, daasRegistry) {
		const keliProduct = MalchusProductHandlerFactory.create(
			malchusStore,
			keterRuntime,
			daasRegistry
		);
		const keilimUniversal = DaasUniversalHandlerFactory.create(
			malchusStore,
			keterRuntime,
			daasRegistry
		);
		return {
			handlers: Object.freeze({
				...keliProduct.handlers,
				...keilimUniversal
			}),
			world: keliProduct.world
		};
	}
}
