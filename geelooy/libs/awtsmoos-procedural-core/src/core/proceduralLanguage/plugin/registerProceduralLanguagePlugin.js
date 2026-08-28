//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file registerProceduralLanguagePlugin.js
 * @description Registers namespaced operation and semantic-resolver capabilities without allowing silent overwrite of stable core language truth.
 * The Awtsmoos is One while many extensions reveal different finite powers; Awtsmoos.com lets plugins add light through explicit namespaces and Gevurah boundaries rather than hidden monkey-patching towers.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * Registers a serializable plugin manifest into compatible operation and semantic resolver registries.
 * @param {object} plugin Plugin manifest containing namespace, operations, and optional resolver registrations.
 * @param {{languageRegistry?: object, resolverRegistry?: object, override?: boolean}} [context={}] Explicit registries and overwrite policy.
 * @returns {Readonly<object>} Frozen public plugin description excluding executable resolver functions.
 */
export function registerProceduralLanguagePlugin(plugin = {}, context = {}) {
	const namespace = String(plugin.namespace || 'plugin');
	const operations = Array.isArray(plugin.operations) ? plugin.operations : [];
	for (const operation of operations) {
		context.languageRegistry?.register?.({
			...operation,
			source: operation.source || `plugin:${namespace}`
		}, {
			override: context.override === true
		});
	}
	for (const resolver of plugin.resolvers || []) {
		if (typeof resolver.resolve !== 'function') {
			throw new TypeError(`B"H | Resolver ${resolver.namespace || namespace} requires resolve().`);
		}
		context.resolverRegistry?.register?.(
			resolver.namespace || namespace,
			resolver.resolve,
			{ priority: resolver.priority || 0 }
		);
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-language-plugin',
		version: 1,
		namespace,
		name: String(plugin.name || namespace),
		operations: operations.map(operation => String(operation.op || operation.id || '')),
		resolverNamespaces: (plugin.resolvers || []).map(resolver => String(resolver.namespace || namespace)),
		metadata: plugin.metadata || {}
	});
}
