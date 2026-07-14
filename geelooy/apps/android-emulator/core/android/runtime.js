//B"H
//Boruch Hashem
//Blessed is He

import { openDexModel } from "../dex/model.js";
import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../dalvik/opcodes.js";
import { lifecycleArguments, resolveLauncherMethods } from "./activityMethods.js";
import { createAndroidFilesystem } from "./filesystem.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import { createAndroidGraphicsTrace } from "./graphicsTrace.js";
import { createAndroidLogcat } from "./logcat.js";
import { runAndroidRenderers } from "./rendererLifecycle.js";
import { createAndroidViewState } from "./viewState.js";

/**
 * Creates and launches one bounded virtual Android process from validated APK
 * identity and DEX bytes. The Awtsmoos creates activity, renderer, UI, storage,
 * and VM evidence anew; Awtsmoos.com never invokes host ART or native app code.
 */
export async function launchAndroidPackage(archive, identity, options = {}) {
	const models = await loadDexModels(archive, identity, options);
	const heap = createDalvikObjectHeap(options);
	const registry = createDalvikMethodRegistry(models);
	const runtime = createRuntimeState(identity, heap, options);
	const framework = createAndroidFrameworkHost(runtime);
	const executor = createDalvikExecutor({
		framework,
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry,
		staticFields: new Map()
	}, options);
	const launcher = resolveLauncherMethods(identity, registry);
	const activity = heap.allocate(launcher.type);
	const bundle = heap.allocate("Landroid/os/Bundle;");
	if (launcher.constructor?.code) {
		await executor.invoke(
			launcher.constructor,
			lifecycleArguments(launcher.constructor, activity)
		);
	}
	await executor.invoke(
		launcher.onCreate,
		lifecycleArguments(launcher.onCreate, activity, [bundle])
	);
	const rendering = await runAndroidRenderers(runtime, registry, executor, options);
	const filesystemSynchronized = await synchronizeFilesystem(runtime, options);
	runtime.logcat.info("ActivityManager", `launched ${identity.manifest.launcherActivity}`);
	return createLaunchReport(
		identity,
		activity,
		executor,
		framework,
		runtime,
		rendering,
		filesystemSynchronized
	);
}

async function loadDexModels(archive, identity, options) {
	const models = [];
	for (const dexFile of identity.dexFiles) {
		models.push(await openDexModel(await archive.read(dexFile.name), options));
	}
	return models;
}

function createRuntimeState(identity, heap, options) {
	const runtime = {
		contentView: null,
		filesystem: createAndroidFilesystem(identity.manifest.packageName, options),
		graphics: createAndroidGraphicsTrace(options),
		heap,
		identity,
		logcat: createAndroidLogcat(options),
		renderers: [],
		views: null
	};
	runtime.views = createAndroidViewState(heap);
	for (const [path, value] of Object.entries(options.initialFiles || {})) {
		runtime.filesystem.write(path, value);
	}
	return runtime;
}

async function synchronizeFilesystem(runtime, options) {
	if (!options.filesystemCapability) return false;
	await runtime.filesystem.syncToCapability(options.filesystemCapability);
	return true;
}

function createLaunchReport(identity, activity, executor, framework, runtime, rendering, synchronized) {
	return Object.freeze({
		activity,
		executionClass: "dalvik-subset-execution",
		filesystem: runtime.filesystem.snapshot(),
		filesystemSynchronized: synchronized,
		framework: framework.snapshot(),
		identity,
		mode: "virtual-android-subset",
		rendering,
		vm: executor.snapshot(),
		unsupportedBoundary: "Complete ART, Android framework, Binder, resources, native libraries, threads, services, networking, audio, sensors, and full graphics remain unsupported."
	});
}
