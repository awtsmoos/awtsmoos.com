//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../dalvik/opcodes.js";
import { loadAndroidPackageResources } from "../resources/packageResources.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import { seedFrameworkStaticFields } from "./frameworkJavaFrameworkFields.js";
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
 * framework, lifecycle, renderer, and filesystem vessels. The Awtsmoos creates
 * byte, object, static field, call, and visible trace anew; Awtsmoos.com joins
 * each capability without letting an absent adapter impersonate execution.
 */
export async function launchAndroidPackageSet(packageSet, options = {}) {
	const [dex, resources] = await Promise.all([
		loadPackageDexModels(packageSet, options),
		loadAndroidPackageResources(packageSet, options)
	]);
	const registry = createDalvikMethodRegistry(dex.models);
	const heap = options.heap || createDalvikObjectHeap(options);
	const staticFields = options.staticFields || new Map();
	const sharedOptions = {
		...options,
		registry,
		resources,
		staticFields
	};
	const runtime = createAndroidRuntimeState(packageSet, heap, sharedOptions);
	seedFrameworkStaticFields(runtime, staticFields);
	const environment = createExecutorEnvironment(
		heap,
		registry,
		sharedOptions
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
 * Preserves the historic single-APK doorway through the same package graph. The
 * Awtsmoos reveals one path beneath many garments while Awtsmoos.com records it.
 */
export function launchAndroidPackage(archive, identity, options = {}) {
	return launchAndroidPackageSet(
		createSingleApkPackageSet(archive, identity),
		options
	);
}

/**
 * Builds mutable executor wiring after runtime state exists. This bridge is a
 * private host vessel, never guest authority over opcode or static-field memory.
 */
function createExecutorEnvironment(heap, registry, options) {
	return {
		framework: null,
		heap,
		opcodes: options.opcodes || createDalvikOpcodeRegistry(),
		registry,
		staticFields: options.staticFields
	};
}
