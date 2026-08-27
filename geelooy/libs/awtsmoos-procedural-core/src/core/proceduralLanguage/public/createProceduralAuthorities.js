//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralAuthorities.js
 * @description Constructs one shared constellation of operation, semantic, generator, domain, resource, cache, logger, and compiler authorities for every public language facade.
 * The Awtsmoos is One while registries receive many finite offices; Awtsmoos.com creates them once per API vessel so authoring, inspection, execution, runtime state, and plugins never drift into separate realities.
 */

import { ProceduralCompilationCache } from '../cache/ProceduralCompilationCache.js';
import { ProceduralLanguageCompiler } from '../compiler/ProceduralLanguageCompiler.js';
import { ProceduralDomainRegistry } from '../domain/ProceduralDomainRegistry.js';
import { ProceduralGeneratorRegistry } from '../generation/ProceduralGeneratorRegistry.js';
import { ProceduralLogger } from '../logging/ProceduralLogger.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';
import { SemanticResolverRegistry } from '../reference/SemanticResolverRegistry.js';
import { ProceduralResourceRegistry } from '../resource/ProceduralResourceRegistry.js';

/**
 * Creates shared runtime authorities while honoring caller-supplied custom registries, compiler, cache, resources, and logger.
 * @param {object} [options={}] Optional authority overrides and cache/logger settings.
 * @returns {Readonly<object>} Shared authority constellation used by all public API facets.
 */
export function createProceduralAuthorities(options = {}) {
	const registry = options.registry || createDefaultLanguageRegistry();
	const resolverRegistry = options.resolverRegistry || new SemanticResolverRegistry();
	const generatorRegistry = options.generatorRegistry || new ProceduralGeneratorRegistry();
	const domainRegistry = options.domainRegistry || new ProceduralDomainRegistry();
	const resourceRegistry = options.resourceRegistry || new ProceduralResourceRegistry();
	const cache = options.cache || new ProceduralCompilationCache(options.cacheOptions || {});
	const logger = options.logger instanceof ProceduralLogger
		? options.logger
		: new ProceduralLogger(options.logger || {});
	const compiler = options.compiler || new ProceduralLanguageCompiler({
		registry,
		coreCompiler: options.coreCompiler,
		domainRegistry,
		cache,
		cacheOptions: options.cacheOptions || {}
	});
	return Object.freeze({
		registry,
		resolverRegistry,
		generatorRegistry,
		domainRegistry,
		resourceRegistry,
		cache,
		logger,
		compiler
	});
}
