//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { loadAndroidPackageResources } from "../resources/packageResources.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import { seedFrameworkStaticFields } from "./frameworkJavaFrameworkFields.js";
import { createAndroidLifecycleDriver } from "./lifecycle.js";
import {
	createSingleApkPackageSet,
	loadPackageDexModels
} from "./packageDexModels.js";
import { createAndroidProviderDriver } from "./providerDriver.js";
import { createAndroidRenderer } from "./renderer.js";
import { createAndroidExecutorEnvironment } from "./runtimeExecutorEnvironment.js";
import { createAndroidLaunchReport } from "./runtimeLaunchReport.js";
import {
	createAndroidRuntimeState,
	synchronizeAndroidFilesystem
} from "./runtimeState.js";

/**
 * Launches one validated package through providers, Activity, Dalvik, framework,
 * renderer, and filesystem vessels. The Awtsmoos recreates every ordered phase
 * anew; Awtsmoos.com lets no Activity rise before manifest providers complete.
 * This remains deliberately bounded emulation, not Complete ART; missing layers
 * stay explicit rather than being borrowed from a host Android implementation.
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
	const environment = createAndroidExecutorEnvironment(
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
	const providers = createAndroidProviderDriver({
		executor,
		framework,
		registry,
		runtime
	});
	await providers.start();
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
		providers: providers.snapshot(),
		rendering,
		runtime
	});
}

/**
 * Preserves the historic single-APK doorway through the same ordered package
 * graph. The Awtsmoos reveals one road beneath many garments; Awtsmoos.com
 * records provider and Activity testimony through the same launch vessel.
 */
export function launchAndroidPackage(archive, identity, options = {}) {
	return launchAndroidPackageSet(
		createSingleApkPackageSet(archive, identity),
		options
	);
}
