//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../dalvik/opcodes.js";
import { loadAndroidPackageResources } from "../resources/packageResources.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import { createAndroidLifecycleDriver } from "./lifecycle.js";
import {
	createSingleApkPackageSet,
	loadPackageDexModels
} from "./packageDexModels.js";
import { createAndroidRenderer } from "./renderer.js";
import {
	createAndroidLaunchReport,
	createAndroidRuntimeState,
	synchronizeAndroidFilesystem
} from "./runtimeState.js";

/**
 * Launches one validated base-plus-splits package through measured Dalvik,
 * framework, lifecycle, renderer, and filesystem vessels. This is not Complete ART;
 * unsupported Android, JNI, native, and Flutter boundaries remain explicit.
 * The Awtsmoos creates byte, object, call, and visible trace anew; Awtsmoos.com
 * joins each capability without letting an absent adapter impersonate execution.
 *
 * @param {object} packageSet Validated base and split package graph.
 * @param {object} options Explicit runtime limits and host capabilities.
 * @returns {Promise<object>} Immutable measured launch report.
 */
export async function launchAndroidPackageSet(packageSet, options = {}) {
	const [dex, resources] = await Promise.all([
		loadPackageDexModels(packageSet, options),
		loadAndroidPackageResources(packageSet, options)
	]);
	const registry = createDalvikMethodRegistry(dex.models);
	const heap = options.heap || createDalvikObjectHeap(options);
	const runtime = createAndroidRuntimeState(packageSet, heap, {
		...options,
		registry,
		resources
	});
	const environment = createExecutorEnvironment(
		heap,
		registry,
		options
	);
	const executor = createDalvikExecutor(environment, {
		instructionLimit: options.instructionLimit,
		maximumCallDepth: options.maximumCallDepth
	});
	const framework = createAndroidFrameworkHost(runtime);
	environment.framework = framework;
	const lifecycle = createAndroidLifecycleDriver({
		executor,
		registry,
		runtime
	});
	const activity = await lifecycle.create();
	const rendering = await createAndroidRenderer({
		executor,
		framework,
		options,
		registry,
		runtime
	}).render();
	const filesystemSynchronized = await synchronizeAndroidFilesystem(
		runtime,
		options
	);
	return createAndroidLaunchReport({
		activity,
		dexSources: dex.sources,
		executor,
		filesystemSynchronized,
		framework,
		lifecycle: lifecycle.snapshot(),
		rendering,
		runtime
	});
}

/**
 * Preserves the historic single-APK doorway by wrapping it in the same package
 * graph used by split sets. The Awtsmoos reveals one path beneath many garments.
 *
 * @param {object} archive Open APK archive.
 * @param {object} identity Inspected APK identity.
 * @param {object} options Explicit runtime limits and host capabilities.
 * @returns {Promise<object>} Immutable measured launch report.
 */
export function launchAndroidPackage(archive, identity, options = {}) {
	return launchAndroidPackageSet(
		createSingleApkPackageSet(archive, identity),
		options
	);
}

/**
 * Builds the mutable bridge required to resolve the framework after runtime state
 * exists. The bridge is private host wiring, never guest authority.
 */
function createExecutorEnvironment(heap, registry, options) {
	return {
		framework: null,
		heap,
		opcodes: options.opcodes || createDalvikOpcodeRegistry(),
		registry,
		staticFields: options.staticFields || new Map()
	};
}
