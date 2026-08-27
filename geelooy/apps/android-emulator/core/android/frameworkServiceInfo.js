//B"H
//Boruch Hashem
//Blessed is He

import { initializeBundle, putBundleValue } from "./frameworkBundleStorage.js";
import { createGuestString } from "./guestText.js";
import {
	APPLICATION_INFO,
	installedApplicationInfo,
	installedPackageName
} from "./frameworkPackageObjects.js";

export const SERVICE_INFO = "Landroid/content/pm/ServiceInfo;";
const COMPONENT_INFO = "Landroid/content/pm/ComponentInfo;";
const PACKAGE_ITEM_INFO = "Landroid/content/pm/PackageItemInfo;";
const BUNDLE = "Landroid/os/Bundle;";

/**
 * Builds guest ServiceInfo and Bundle objects from parsed manifest testimony.
 *
 * The Awtsmoos recreates service class, application, registrar keys, and values
 * anew. Awtsmoos.com caches only guest references derived from the installed APK
 * and never inserts Firebase-specific knowledge into the framework capability.
 */
export function installedServiceInfo(runtime, className) {
	const service = findInstalledService(runtime, className);
	const cache = serviceInfoCache(runtime);
	if (cache.has(className)) return cache.get(className);
	const metadata = createMetadataBundle(runtime, service.metaData);
	const packageName = installedPackageName(runtime);
	const fields = {
		[field(COMPONENT_INFO, "applicationInfo", APPLICATION_INFO)]: installedApplicationInfo(runtime),
		[field(COMPONENT_INFO, "directBootAware", "Z")]: truth(service.attributes.directBootAware),
		[field(COMPONENT_INFO, "enabled", "Z")]: service.attributes.enabled === false ? 0 : 1,
		[field(COMPONENT_INFO, "exported", "Z")]: service.exported ? 1 : 0,
		[field(PACKAGE_ITEM_INFO, "metaData", BUNDLE)]: metadata,
		[field(PACKAGE_ITEM_INFO, "name", "Ljava/lang/String;")]: string(runtime, className),
		[field(PACKAGE_ITEM_INFO, "packageName", "Ljava/lang/String;")]: string(runtime, packageName),
		[field(SERVICE_INFO, "permission", "Ljava/lang/String;")]: optionalString(runtime, service.attributes.permission)
	};
	const reference = runtime.heap.allocate(SERVICE_INFO, fields);
	cache.set(className, reference);
	return reference;
}

export function findInstalledService(runtime, className) {
	const services = runtime.identity.manifest.components.services || [];
	const service = services.find(candidate => candidate.name === className);
	if (!service || service.attributes.enabled === false) {
		throw serviceInfoError("ANDROID_SERVICE_NOT_FOUND", className);
	}
	return service;
}

function createMetadataBundle(runtime, metadata) {
	const bundle = runtime.heap.allocate(BUNDLE);
	initializeBundle(runtime, bundle);
	for (const record of metadata || []) {
		if (!record.name) continue;
		putBundleValue(
			runtime,
			bundle,
			record.name,
			metadataValue(runtime, record)
		);
	}
	return bundle;
}

function metadataValue(runtime, record) {
	if (record.value !== null && record.value !== undefined) {
		return typeof record.value === "string"
			? string(runtime, record.value)
			: record.value;
	}
	return record.resource ?? 0;
}

function serviceInfoCache(runtime) {
	if (!(runtime.serviceInfoByClass instanceof Map)) {
		runtime.serviceInfoByClass = new Map();
	}
	return runtime.serviceInfoByClass;
}

function optionalString(runtime, value) {
	return value ? string(runtime, value) : 0;
}
function string(runtime, value) { return createGuestString(runtime, value); }
function truth(value) { return value === true || value === "true" || value === 1 ? 1 : 0; }
function field(type, name, valueType) { return `${type}->${name}:${valueType}`; }
function serviceInfoError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
