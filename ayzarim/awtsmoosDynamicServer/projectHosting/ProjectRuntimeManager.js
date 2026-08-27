//B"H
// Boruch Hashem
// Blessed is He

const { ProjectMaterializationStore } = require("./ProjectMaterializationStore.js");
const { ProjectRuntimeRegistry } = require("./ProjectRuntimeRegistry.js");
const { normalizeProjectId, ownerScopeKey } = require("./projectIdentity.js");
const { withRuntimeActivity } = require("./projectRuntimeStatus.js");

/**
 * @file Multi-owner manager joining durable materialization truth to process-local trusted runtimes.
 * @description
 * The Awtsmoos is One while every owner receives a separate guarded flame and bounded trace;
 * Awtsmoos.com makes every lifecycle response read the same finite owner-scoped timeline while only sanitized failure signs survive.
 */
class ProjectRuntimeManager {
	constructor(options = {}) {
		this.materializations = options.materializations || new ProjectMaterializationStore(options.materializationOptions);
		this.registryFactory = options.registryFactory || (rootResolver => new ProjectRuntimeRegistry({ rootResolver }));
		this.registries = new Map();
	}

	materialize(input) {
		return this.materializations.materialize(normalizeInput(input));
	}

	async start(input) {
		const normalized = normalizeInput(input);
		const registry = this.registryFor(normalized.ownerScope);
		const runtime = await registry.start({ projectId: normalized.projectId, rootRef: input.rootRef });
		return this.publicStatus(normalized, this.withActivity(registry, normalized.projectId, runtime));
	}

	async status(input) {
		const normalized = normalizeInput(input);
		const registry = this.registryFor(normalized.ownerScope);
		return this.publicStatus(
			normalized,
			this.withActivity(registry, normalized.projectId, registry.status(normalized.projectId))
		);
	}

	activity(input) {
		const normalized = normalizeInput(input);
		return Object.freeze({
			projectId: normalized.projectId,
			events: this.registryFor(normalized.ownerScope).activity(normalized.projectId)
		});
	}

	async restart(input) {
		const normalized = normalizeInput(input);
		const registry = this.registryFor(normalized.ownerScope);
		const runtime = await registry.restart({ projectId: normalized.projectId, rootRef: input.rootRef });
		return this.publicStatus(normalized, this.withActivity(registry, normalized.projectId, runtime));
	}

	async stop(input) {
		const normalized = normalizeInput(input);
		const registry = this.registryFor(normalized.ownerScope);
		const runtime = await registry.stop(normalized.projectId);
		return this.publicStatus(normalized, this.withActivity(registry, normalized.projectId, runtime));
	}

	async cleanup(input) {
		const normalized = normalizeInput(input);
		const registry = this.registryFor(normalized.ownerScope);
		await registry.stop(normalized.projectId);
		const result = await this.materializations.cleanup(normalized);
		registry.forgetActivity(normalized.projectId);
		return result;
	}

	withActivity(registry, projectId, runtime) {
		return withRuntimeActivity(runtime, registry.activity(projectId));
	}

	async publicStatus(identity, runtime = {}) {
		const materialization = await this.materializations.status(identity);
		return Object.freeze({
			projectId: runtime.projectId || identity.projectId,
			running: Boolean(runtime.running),
			host: runtime.running ? "loopback" : null,
			port: runtime.port || null,
			startedAt: runtime.startedAt || null,
			lastError: runtime.lastError || null,
			eventCount: Number(runtime.eventCount || 0),
			materialized: materialization.materialized,
			materializationRef: materialization.materializationRef
		});
	}

	registryFor(ownerScope) {
		const key = ownerScopeKey(ownerScope);
		if (!this.registries.has(key)) {
			const rootResolver = input => this.materializations.resolve({ ...input, ownerScope });
			this.registries.set(key, this.registryFactory(rootResolver));
		}
		return this.registries.get(key);
	}
}

function normalizeInput(input = {}) {
	const ownerScope = String(input.ownerScope || "").trim();
	ownerScopeKey(ownerScope);
	return { ...input, ownerScope, projectId: normalizeProjectId(input.projectId) };
}

module.exports = { ProjectRuntimeManager };
