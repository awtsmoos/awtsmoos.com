//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAwtsmoosAuthorities.js
 * @description Composes one isolated semantic kernel, compiler namespace, constraint registry, compilation cache, and inspectable pipeline for the universal five-verb lifecycle.
 * The Awtsmoos renews every authority before high-level composition can call them one API;
 * Awtsmoos.com joins existing vessels by reference so no facade secretly creates a second compiler, cache, or semantic sky.
 */
import { ProceduralCompilationCache } from '../proceduralLanguage/cache/ProceduralCompilationCache.js';
import { installDefaultProceduralCompilers } from '../proceduralLanguage/capability/installDefaultProceduralCompilers.js';
import { UniversalConstraintSolverRegistry } from '../proceduralLanguage/constraint/UniversalConstraintSolverRegistry.js';
import { createUniversalSemanticKernel } from '../proceduralLanguage/universalKernel/createUniversalSemanticKernel.js';
import { createAwtsmoosCacheNamespace } from './AwtsmoosCache.js';
import { createAwtsmoosCompilerNamespace } from './AwtsmoosCompilers.js';
import { createAwtsmoosConstraintNamespace } from './AwtsmoosConstraints.js';
import { createAwtsmoosPipelineNamespace } from './AwtsmoosPipeline.js';

/**
 * @description Creates the shared authorities used by lightweight and full universal facades.
 * @param {object} [options={}] Existing authorities, registrations, cache options, and default-compiler installation policy.
 * @returns {Readonly<object>} Internal authority bundle consumed by Awtsmoos constructors.
 */
export function createAwtsmoosAuthorities(options = {}) {
	const suppliedSemantic = options.semantic || options.semanticKernel || null;
	const semantic = suppliedSemantic || createUniversalSemanticKernel();
	installCompilersWhenRequested(semantic, suppliedSemantic, options);
	const constraintRegistry = options.constraintRegistry || new UniversalConstraintSolverRegistry();
	const compileCache = options.compileCache || new ProceduralCompilationCache(options.cacheOptions || {});
	const compilers = createAwtsmoosCompilerNamespace(semantic);
	const constraints = createAwtsmoosConstraintNamespace(constraintRegistry);
	registerCompilers(compilers, options.compilers || []);
	registerSolvers(constraints, options.constraintSolvers || []);
	return Object.freeze({
		semantic,
		compilers,
		constraints,
		cache: createAwtsmoosCacheNamespace(compileCache),
		pipeline: createAwtsmoosPipelineNamespace(),
		constraintRegistry,
		compileCache
	});
}

function installCompilersWhenRequested(semantic, suppliedSemantic, options) {
	const install = suppliedSemantic
		? options.installDefaultCompilers === true
		: options.installDefaultCompilers !== false;
	if (install) installDefaultProceduralCompilers(semantic);
}

function registerCompilers(namespace, entries) {
	for (const entry of entries) {
		namespace.register(entry.capability, entry.executor || null, entry.options || {});
	}
}

function registerSolvers(namespace, entries) {
	for (const entry of entries) {
		namespace.register(entry.capability, entry.solver || null, entry.options || {});
	}
}
