//B"H
//Boruch Hashem
//Blessed be He

import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { loadAndroidPackageResources } from "../resources/packageResources.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import { seedFrameworkStaticFields } from "./frameworkJavaFrameworkFields.js";
import { createAndroidLifecycleDriver } from "./lifecycle.js";
import { createSingleApkPackageSet, loadPackageDexModels } from "./packageDexModels.js";
import { createAndroidProviderDriver } from "./providerDriver.js";
import { createAndroidRenderer } from "./renderer.js";
import { createAndroidExecutorEnvironment } from "./runtimeExecutorEnvironment.js";
import { createAndroidLaunchReport } from "./runtimeLaunchReport.js";
import { notifyAndroidLaunchProgress } from "./runtimeLaunchProgress.js";
import { notifyAndroidRuntimeObserver } from "./runtimeObserver.js";
import { createAndroidRuntimeState, synchronizeAndroidFilesystem } from "./runtimeState.js";
import { dispatchSurfaceHolderLifecycle } from "./surfaceHolderLifecycle.js";

/**
 * Launches one package through providers, Activity, surfaces, renderer, and files.
 * Every major awaited boundary emits synchronous truthful progress when requested.
 * Missing Android layers remain explicit rather than borrowed from a host runtime.
 *
 * @param {object} packageSet Inspected Android package set.
 * @param {object} options Runtime, diagnostics, and resource options.
 * @returns {Promise<object>} Authentic Android launch report.
 */
export async function launchAndroidPackageSet(packageSet, options = {}) {
	notifyAndroidLaunchProgress(options, "load-package-models", {
		packageName: packageSet.packageName
	});
	const [dex, resources] = await Promise.all([
		loadPackageDexModels(packageSet, options),
		loadAndroidPackageResources(packageSet, options)
	]);
	notifyAndroidLaunchProgress(options, "package-models-ready", {
		dexSources: dex.sources.length
	});
	const registry = createDalvikMethodRegistry(dex.models);
	const heap = options.heap || createDalvikObjectHeap(options);
	const staticFields = options.staticFields || new Map();
	const sharedOptions = { ...options, registry, resources, staticFields };
	const runtime = createAndroidRuntimeState(packageSet, heap, sharedOptions);
	notifyAndroidRuntimeObserver(runtime, options);
	seedFrameworkStaticFields(runtime, staticFields);
	const environment = createAndroidExecutorEnvironment(heap, registry, sharedOptions);
	const executor = createDalvikExecutor(environment, {
		instructionLimit: options.instructionLimit,
		maximumCallDepth: options.maximumCallDepth
	});
	const framework = createAndroidFrameworkHost(runtime);
	environment.framework = framework;
	notifyAndroidLaunchProgress(options, "start-providers");
	const providers = createAndroidProviderDriver({
		executor,
		framework,
		registry,
		runtime
	});
	await providers.start();
	notifyAndroidLaunchProgress(options, "providers-ready");
	const lifecycle = createAndroidLifecycleDriver({
		executor,
		progress(stage, details) {
			notifyAndroidLaunchProgress(options, `activity:${stage}`, details);
		},
		registry,
		runtime
	});
	notifyAndroidLaunchProgress(options, "create-activity");
	const activity = await lifecycle.create();
	notifyAndroidLaunchProgress(options, "activity-ready");
	notifyAndroidLaunchProgress(options, "dispatch-surface");
	const surfaceLifecycle = await dispatchSurfaceHolderLifecycle({
		executor,
		options,
		registry,
		runtime
	});
	notifyAndroidLaunchProgress(options, "surface-ready");
	notifyAndroidLaunchProgress(options, "render");
	const rendering = await createAndroidRenderer({
		executor,
		framework,
		options,
		registry,
		runtime
	}).render();
	notifyAndroidLaunchProgress(options, "render-ready");
	notifyAndroidLaunchProgress(options, "sync-filesystem");
	const filesystemSynchronized = await synchronizeAndroidFilesystem(runtime, options);
	notifyAndroidLaunchProgress(options, "complete");
	return createAndroidLaunchReport({
		activity,
		dexSources: dex.sources,
		executor,
		filesystemSynchronized,
		framework,
		lifecycle: lifecycle.snapshot(),
		providers: providers.snapshot(),
		rendering,
		runtime,
		surfaceLifecycle
	});
}

/**
 * Preserves the historic single-APK doorway through the ordered package graph.
 * @param {object} archive Single APK archive.
 * @param {object} identity Parsed package identity.
 * @param {object} options Runtime launch options.
 * @returns {Promise<object>} Authentic Android launch report.
 */
export function launchAndroidPackage(archive, identity, options = {}) {
	return launchAndroidPackageSet(createSingleApkPackageSet(archive, identity), options);
}
