//B"H
//Boruch Hashem
//Blessed is He

import {
	initializeBundle,
	putBundleValue
} from "./frameworkBundleStorage.js";
import {
	APPLICATION_INFO,
	installedApplicationInfo,
	installedPackageName
} from "./frameworkPackageObjects.js";
import { createGuestString } from "./guestText.js";

export {
	ANDROID_APPLICATION,
	ANDROID_CONTEXT,
	createApplicationContext
} from "./applicationObjects.js";

export const ANDROID_PROVIDER_INFO = "Landroid/content/pm/ProviderInfo;";
const ANDROID_BUNDLE = "Landroid/os/Bundle;";
const COMPONENT_INFO = "Landroid/content/pm/ComponentInfo;";
const PACKAGE_ITEM_INFO = "Landroid/content/pm/PackageItemInfo;";

/**
 * Creates typed ProviderInfo guest vessels from immutable manifest testimony.
 * The Awtsmoos recreates package, authority, metadata, and application garment
 * anew; Awtsmoos.com stores canonical Dalvik fields rather than host shadows.
 */
export function createProviderInfo(runtime, provider) {
	const applicationInfo = installedApplicationInfo(runtime);
	const metadata = createProviderMetadata(runtime, provider.metaData);
	const packageName = string(runtime, installedPackageName(runtime));
	const className = string(runtime, provider.name);
	const processName = string(
		runtime,
		provider.processName || installedPackageName(runtime)
	);
	return runtime.heap.allocate(ANDROID_PROVIDER_INFO, {
		[field(ANDROID_PROVIDER_INFO, "applicationInfo", APPLICATION_INFO)]: applicationInfo,
		[field(ANDROID_PROVIDER_INFO, "authority", "Ljava/lang/String;")]: string(runtime, provider.authority),
		[field(ANDROID_PROVIDER_INFO, "directBootAware", "Z")]: provider.directBootAware ? 1 : 0,
		[field(ANDROID_PROVIDER_INFO, "enabled", "Z")]: provider.enabled ? 1 : 0,
		[field(ANDROID_PROVIDER_INFO, "exported", "Z")]: provider.exported ? 1 : 0,
		[field(ANDROID_PROVIDER_INFO, "grantUriPermissions", "Z")]: provider.grantUriPermissions ? 1 : 0,
		[field(ANDROID_PROVIDER_INFO, "initOrder", "I")]: provider.initOrder,
		[field(ANDROID_PROVIDER_INFO, "metaData", ANDROID_BUNDLE)]: metadata,
		[field(ANDROID_PROVIDER_INFO, "name", "Ljava/lang/String;")]: className,
		[field(ANDROID_PROVIDER_INFO, "packageName", "Ljava/lang/String;")]: packageName,
		[field(COMPONENT_INFO, "applicationInfo", APPLICATION_INFO)]: applicationInfo,
		[field(COMPONENT_INFO, "directBootAware", "Z")]: provider.directBootAware ? 1 : 0,
		[field(COMPONENT_INFO, "enabled", "Z")]: provider.enabled ? 1 : 0,
		[field(COMPONENT_INFO, "exported", "Z")]: provider.exported ? 1 : 0,
		[field(COMPONENT_INFO, "processName", "Ljava/lang/String;")]: processName,
		[field(PACKAGE_ITEM_INFO, "metaData", ANDROID_BUNDLE)]: metadata,
		[field(PACKAGE_ITEM_INFO, "name", "Ljava/lang/String;")]: className,
		[field(PACKAGE_ITEM_INFO, "packageName", "Ljava/lang/String;")]: packageName
	});
}

export function providerInfoField(type, name, valueType) {
	return field(type, name, valueType);
}

function createProviderMetadata(runtime, entries) {
	const bundle = runtime.heap.allocate(ANDROID_BUNDLE);
	initializeBundle(runtime, bundle);
	for (const entry of entries || []) {
		if (!entry?.name) continue;
		putBundleValue(runtime, bundle, entry.name, metadataValue(runtime, entry));
	}
	return bundle;
}

function metadataValue(runtime, entry) {
	if (entry.resource !== null && entry.resource !== undefined) {
		const number = Number(entry.resource);
		return Number.isFinite(number) ? number : string(runtime, entry.resource);
	}
	if (typeof entry.value === "string") return string(runtime, entry.value);
	return entry.value ?? 0;
}

function field(type, name, valueType) {
	return `${type}->${name}:${valueType}`;
}

function string(runtime, value) {
	return createGuestString(runtime, value ?? "");
}
