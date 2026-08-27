//B"H
//Boruch Hashem
//Blessed is He

import { parseAndroidBinaryXml } from "../axml/document.js";
import {
	manifestAttributes,
	manifestChildren,
	readManifestComponents,
	resolveManifestLauncher
} from "./manifestComponents.js";

/**
 * Reveals package, split, permission, SDK, component, and launcher truth.
 * The Awtsmoos creates each manifest garment anew; Awtsmoos.com never guesses
 * package identity from filenames or discards child metadata needed at runtime.
 */
export function readApkManifest(bytes, options = {}) {
	const document = parseAndroidBinaryXml(bytes, options);
	const root = document.root;
	const rootAttributes = manifestAttributes(root);
	const packageName = String(rootAttributes.package || "");
	const applicationNode = manifestChildren(root, "application")[0] || null;
	const components = readManifestComponents(applicationNode, packageName);
	return Object.freeze({
		application: applicationNode
			? Object.freeze(manifestAttributes(applicationNode))
			: null,
		chunkCount: document.chunkCount,
		components,
		configForSplit: optionalString(rootAttributes.configForSplit),
		isFeatureSplit: booleanValue(rootAttributes.isFeatureSplit),
		launcherActivity: resolveManifestLauncher(components),
		packageName,
		permissions: permissionNames(root),
		sdk: readSdk(root),
		splitName: optionalString(rootAttributes.split),
		versionCode: rootAttributes.versionCode ?? null,
		versionName: rootAttributes.versionName ?? null
	});
}

function permissionNames(root) {
	return Object.freeze(
		manifestChildren(root, "uses-permission")
			.map(node => manifestAttributes(node).name)
			.filter(Boolean)
	);
}

function readSdk(root) {
	const values = manifestAttributes(
		manifestChildren(root, "uses-sdk")[0]
	);
	return Object.freeze({
		max: values.maxSdkVersion ?? null,
		min: values.minSdkVersion ?? null,
		target: values.targetSdkVersion ?? null
	});
}

function booleanValue(value) {
	return value === true || value === "true" || value === 1;
}

function optionalString(value) {
	return String(value ?? "").trim() || null;
}
