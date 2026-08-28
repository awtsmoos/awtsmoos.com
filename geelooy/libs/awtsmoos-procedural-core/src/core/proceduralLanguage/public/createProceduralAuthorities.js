//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralAuthorities.js
 * @description Constructs one shared constellation of operation, resolver, semantic compiler, generator, domain, resource, cache, logger, and established compiler authorities for every public language facade.
 * The Awtsmoos is One while registries receive many finite offices beneath the same light;
 * Awtsmoos.com creates them once per API vessel so authoring, planning, universal artifacts, execution, inspection, and plugins never drift into separate nights.
 */

import { ProceduralCompilationCache } from '../cache/ProceduralCompilationCache.js';
import { ProceduralCompilerCapabilityRegistry } from '../capability/ProceduralCompilerCapabilityRegistry.js';
import { ProceduralLanguageCompiler } from '../compiler/ProceduralLanguageCompiler.js';
import { ProceduralDomainRegistry } from '../domain/ProceduralDomainRegistry.js';
import { ProceduralGeneratorRegistry } from '../generation/ProceduralGeneratorRegistry.js';
import { ProceduralLogger } from '../logging/ProceduralLogger.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';
import { SemanticResolverRegistry } from '../reference/SemanticResolverRegistry.js';
import { ProceduralResourceRegistry } from '../resource/ProceduralResourceRegistry.js';

/**
 * @description Creates shared runtime authorities while honoring caller-supplied registry/compiler/cache/resource/logger overrides, including the semantic compiler-capability registry used by universal artifact planning.
 * @param {object} [chochmahOptions={}] Optional authority overrides and cache/logger/compiler construction settings.
 * @returns {Readonly<object>} Frozen shared authority constellation consumed by all public API facets.
 */
export function createProceduralAuthorities(chochmahOptions = {}) {
	const binahRegistry = chochmahOptions.registry
		|| createDefaultLanguageRegistry();
	const daasResolverRegistry = chochmahOptions.resolverRegistry
		|| new SemanticResolverRegistry();
	const tiferesCompilerRegistry = chochmahOptions.compilerRegistry
		|| new ProceduralCompilerCapabilityRegistry();
	const chesedGeneratorRegistry = chochmahOptions.generatorRegistry
		|| new ProceduralGeneratorRegistry();
	const gevurahDomainRegistry = chochmahOptions.domainRegistry
		|| new ProceduralDomainRegistry();
	const yesodResourceRegistry = chochmahOptions.resourceRegistry
		|| new ProceduralResourceRegistry();
	const netzachCache = chochmahOptions.cache
		|| new ProceduralCompilationCache(chochmahOptions.cacheOptions || {});
	const hodLogger = chochmahOptions.logger instanceof ProceduralLogger
		? chochmahOptions.logger
		: new ProceduralLogger(chochmahOptions.logger || {});
	const malchusCompiler = chochmahOptions.compiler
		|| new ProceduralLanguageCompiler({
			registry: binahRegistry,
			coreCompiler: chochmahOptions.coreCompiler,
			domainRegistry: gevurahDomainRegistry,
			cache: netzachCache,
			cacheOptions: chochmahOptions.cacheOptions || {}
		});
	return Object.freeze({
		registry: binahRegistry,
		resolverRegistry: daasResolverRegistry,
		compilerRegistry: tiferesCompilerRegistry,
		generatorRegistry: chesedGeneratorRegistry,
		domainRegistry: gevurahDomainRegistry,
		resourceRegistry: yesodResourceRegistry,
		cache: netzachCache,
		logger: hodLogger,
		compiler: malchusCompiler
	});
}
