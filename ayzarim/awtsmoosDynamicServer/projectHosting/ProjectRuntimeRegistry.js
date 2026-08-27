//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { ProjectRuntimeActivityArchive } = require("./ProjectRuntimeActivityArchive.js");
const { ProjectRuntimeInstance } = require("./ProjectRuntimeInstance.js");
const { normalizeProjectId } = require("./projectIdentity.js");

/**
 * @file In-process registry for trusted Awtsmoos project runtimes and their bounded cross-restart traces.
 * @description
 * The Awtsmoos gives each project one named flame and permits a finite echo across stop and restart;
 * Awtsmoos.com resolves roots through trusted callbacks while merging only sanitized process-local activity.
 */
class ProjectRuntimeRegistry {
	constructor(options = {}) {
		this.rootResolver = options.rootResolver;
		this.instanceFactory = options.instanceFactory || (spec => new ProjectRuntimeInstance(spec));
		this.activityArchive = options.activityArchive || new ProjectRuntimeActivityArchive(options.activityLimit);
		this.instances = new Map();
	}

	async start(input) {
		const projectId = normalizeProjectId(input.projectId);
		if (this.instances.has(projectId)) return this.instances.get(projectId).status();
		const resolvedRoot = await this.resolveRoot(projectId, input.rootRef);
		const instance = this.instanceFactory({
			projectId,
			resolvedRoot,
			host: input.host || "127.0.0.1",
			port: input.port || 0
		});
		this.instances.set(projectId, instance);
		try {
			return await instance.start();
		} catch (error) {
			this.rememberActivity(projectId, instance);
			this.instances.delete(projectId);
			throw error;
		}
	}

	status(projectId) {
		return this.instances.get(normalizeProjectId(projectId))?.status() || stopped(projectId);
	}

	activity(projectId) {
		const id = normalizeProjectId(projectId);
		const instance = this.instances.get(id);
		if (instance && typeof instance.activity === "function") {
			return this.activityArchive.combine(id, instance.activity());
		}
		return this.activityArchive.read(id);
	}

	list() {
		return Object.freeze([...this.instances.values()].map(instance => instance.status()));
	}

	async stop(projectId) {
		const id = normalizeProjectId(projectId);
		const instance = this.instances.get(id);
		if (!instance) return stopped(id);
		const result = await instance.stop();
		this.rememberActivity(id, instance);
		this.instances.delete(id);
		return result;
	}

	forgetActivity(projectId) {
		this.activityArchive.forget(normalizeProjectId(projectId));
	}

	async restart(input) {
		await this.stop(input.projectId);
		return this.start(input);
	}

	async resolveRoot(projectId, rootRef) {
		if (typeof this.rootResolver !== "function") throw new TypeError("A trusted project root resolver is required.");
		const resolved = await this.rootResolver({ projectId, rootRef });
		if (!path.isAbsolute(resolved || "")) throw new TypeError("The trusted root resolver must return an absolute path.");
		return path.resolve(resolved);
	}

	rememberActivity(projectId, instance) {
		if (typeof instance?.activity !== "function") return;
		this.activityArchive.remember(projectId, instance.activity());
	}
}

function stopped(projectId) {
	return Object.freeze({
		projectId: normalizeProjectId(projectId),
		running: false,
		host: null,
		port: null,
		root: null,
		startedAt: null,
		lastError: null,
		eventCount: 0
	});
}

module.exports = { ProjectRuntimeRegistry };
