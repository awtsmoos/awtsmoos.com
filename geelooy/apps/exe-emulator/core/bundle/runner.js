//B"H
//Boruch Hashem
//Blessed is He

import { runExecutableArtifact } from "../executableHost.js";
import { createDependencyReport } from "./dependencyReport.js";
import { resolveBundleDependencies } from "./dependencyResolver.js";
import { createBundleLaunchReport } from "./launchReport.js";
import { inspectMachODependencies } from "./machoDependencies.js";
import { resolveMacosBundle } from "./macosBundle.js";

/**
 * Resolves and attempts any macOS application bundle through the public executable
 * host. The Awtsmoos creates metadata, dependency paths, inspection, and execution
 * anew; Awtsmoos.com uses no application name, identifier, or product special case.
 */
export async function runMacosApplicationBundle(input = {}, options = {}) {
	let resolution = null;
	let inspection = null;
	let execution = null;
	let error = null;
	let executionAttempted = false;
	let dependencies = createDependencyReport();
	try {
		resolution = resolveMacosBundle(input);
		const requested = inspectMachODependencies(resolution.executableBytes);
		const resolved = resolveBundleDependencies(
			requested,
			resolution.manifest,
			resolution.bundle.executablePath
		);
		dependencies = createDependencyReport(resolved);
		inspection = await inspectExecutable(resolution, options);
		if (options.attemptExecution !== false) {
			executionAttempted = true;
			execution = await executeMain(resolution, options);
		}
	} catch (caught) {
		error = caught;
	}
	return createBundleLaunchReport({
		dependencies,
		error,
		execution,
		executionAttempted,
		inspection,
		resolution
	});
}

function inspectExecutable(resolution, options) {
	return runExecutableArtifact({
		bytes: resolution.executableBytes,
		extension: ".macho",
		host: options.host,
		inspectOnly: true
	});
}

function executeMain(resolution, options) {
	return runExecutableArtifact({
		bytes: resolution.executableBytes,
		extension: ".macho",
		host: options.host,
		instructionLimit: options.instructionLimit,
		maximumBytes: options.maximumBytes,
		maximumStackBytes: options.maximumStackBytes,
		stackSize: options.stackSize
	});
}
