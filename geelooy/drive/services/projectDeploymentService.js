//B"H
//Boruch Hashem
//Blessed is He

import { YesodProjectBundleService } from "./projectBundleService.js";
import { NetzachProjectRuntimeClient } from "./projectRuntimeClient.js";

/**
 * @file Drive-to-Ayzarim deployment coordinator with server-truth recovery and bounded activity access.
 * @description
 * The Awtsmoos gathers authorized letters and remembers only the opaque sign across the veil;
 * Awtsmoos.com lets Drive recover materialization and inspect finite runtime traces without exposing device paths or server roots.
 */
export class TiferesProjectDeploymentService {
	constructor(transport, options = {}) {
		this.bundleService = options.bundleService || new YesodProjectBundleService(transport);
		this.runtimeClient = options.runtimeClient || new NetzachProjectRuntimeClient(options.fetchImplementation);
		this.materializations = new Map();
	}

	async materialize({ project, routeReference }) {
		const projectId = projectIdOf(project);
		const bundle = await this.bundleService.build({
			routeReference,
			rootPath: project?.rootPath || "."
		});
		const result = await this.runtimeClient.materialize({ projectId, bundle });
		this.remember(projectId, result.materializationRef);
		return Object.freeze({ ...result, projectId });
	}

	start(project) {
		return this.runtimeClient.start(this.runtimeInput(project));
	}

	async status(project) {
		const projectId = projectIdOf(project);
		const result = await this.runtimeClient.status(projectId);
		if (result?.materialized && result?.materializationRef) {
			this.remember(projectId, result.materializationRef);
		} else if (!result?.materialized) {
			this.materializations.delete(projectId);
		}
		return result;
	}

	activity(project) {
		return this.runtimeClient.activity(projectIdOf(project));
	}

	restart(project) {
		return this.runtimeClient.restart(this.runtimeInput(project));
	}

	stop(project) {
		return this.runtimeClient.stop({ projectId: projectIdOf(project) });
	}

	async cleanup(project) {
		const projectId = projectIdOf(project);
		const result = await this.runtimeClient.cleanup({ projectId });
		this.materializations.delete(projectId);
		return result;
	}

	isMaterialized(project) {
		return this.materializations.has(projectIdOf(project));
	}

	runtimeInput(project) {
		const projectId = projectIdOf(project);
		const materializationRef = this.materializations.get(projectId);
		if (!materializationRef) {
			throw deploymentError("PROJECT_NOT_MATERIALIZED", "Check Health or materialize this project before starting its runtime.");
		}
		return { projectId, materializationRef };
	}

	remember(projectId, reference) {
		const value = String(reference || "").trim();
		if (value) this.materializations.set(projectId, value);
	}
}

function projectIdOf(project) {
	const projectId = String(project?.name || project?.rootPath || "").trim();
	if (!projectId) throw deploymentError("PROJECT_ID_REQUIRED", "Choose a project before using its runtime.");
	return projectId;
}

function deploymentError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
