//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguageCompiler.js
 * @description Coordinates validation, deterministic planning, bounded caching, native mesh laws, trusted core execution, optional domain compilers, adapter deferral, and runtime reporting.
 * The Awtsmoos is One while preparation, execution, memory, and witness descend through separate kelim;
 * Awtsmoos.com keeps this compiler a small Tiferes coordinator so no convenience layer steals authority from the mature engines beneath it.
 */

import { ProceduralObjectCompiler } from '../../proceduralObject/compiler/ProceduralObjectCompiler.js';
import { createProceduralLanguageArtifact } from '../artifact/createProceduralLanguageArtifact.js';
import { ProceduralCompilationCache } from '../cache/ProceduralCompilationCache.js';
import {
	beginProceduralCompileReport,
	finishProceduralCompileReport
} from '../metrics/createProceduralCompileReport.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';
import { createProceduralCompileCacheKey } from './createProceduralCompileCacheKey.js';
import { executePreparedProceduralCompilation } from './executePreparedProceduralCompilation.js';
import { prepareProceduralCompilation } from './prepareProceduralCompilation.js';

/** Universal compiler coordinating additive language-native, domain, core, and adapter execution boundaries. */
export class ProceduralLanguageCompiler {
	/**
	 * @param {{registry?: object, coreCompiler?: object, domainRegistry?: object, cache?: object, cacheOptions?: object}} [options={}] Execution authorities and cache policy.
	 */
	constructor(options = {}) {
		this.registry = options.registry || createDefaultLanguageRegistry();
		this.coreCompiler = options.coreCompiler || new ProceduralObjectCompiler({ deferAdapterOperations: true });
		this.domainRegistry = options.domainRegistry || null;
		this.cache = options.cache || new ProceduralCompilationCache(options.cacheOptions || {});
	}

	/** Returns a validated deterministic dry compile plan without executing mesh, core, domain, or adapter work. */
	plan(input, options = {}) {
		return this.prepare(input, options).plan;
	}

	/** Compiles one JS or JSON definition through every applicable execution authority. */
	compile(input, options = {}) {
		throwIfAborted(options.signal);
		const prepared = this.prepare(input, options);
		if (options.dryRun === true) {
			return prepared.plan;
		}
		const measurement = beginProceduralCompileReport(prepared.plan);
		const cacheKey = createProceduralCompileCacheKey(prepared.definition, prepared.plan, options);
		const cached = options.cache === false ? undefined : this.cache.get(cacheKey);
		if (cached) {
			return revealCachedArtifact(cached, measurement, cacheKey);
		}
		throwIfAborted(options.signal);
		const executed = executePreparedProceduralCompilation(prepared, this.authorities(), options);
		throwIfAborted(options.signal);
		const report = finishProceduralCompileReport(measurement, {
			...executed,
			cacheKey,
			cacheHit: false
		});
		const artifact = createProceduralLanguageArtifact({
			...executed,
			report
		});
		if (options.cache !== false) {
			this.cache.set(cacheKey, artifact);
		}
		return artifact;
	}

	/** Normalizes, validates, and plans one definition before any execution begins. */
	prepare(input, options = {}) {
		return prepareProceduralCompilation(input, {
			registry: this.registry,
			validationMode: options.validationMode || 'strict'
		});
	}

	/** Returns runtime execution authorities without exposing mutable compiler internals to callers. */
	authorities() {
		return Object.freeze({
			registry: this.registry,
			coreCompiler: this.coreCompiler,
			domainRegistry: this.domainRegistry
		});
	}
}

/** Returns an immutable cache-hit view with fresh runtime report evidence. */
function revealCachedArtifact(artifact, measurement, cacheKey) {
	const report = finishProceduralCompileReport(measurement, {
		...artifact,
		cacheKey,
		cacheHit: true
	});
	return Object.freeze({
		...artifact,
		report
	});
}

/** Throws the platform-standard abort reason when cancellation was requested. */
function throwIfAborted(signal) {
	if (!signal?.aborted) {
		return;
	}
	if (typeof signal.throwIfAborted === 'function') {
		signal.throwIfAborted();
	}
	throw signal.reason || new Error('B"H | Procedural compilation aborted.');
}
