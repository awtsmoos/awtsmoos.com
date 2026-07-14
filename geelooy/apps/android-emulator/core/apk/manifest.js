//B"H
//Boruch Hashem
//Blessed is He

import { parseAndroidBinaryXml } from "../axml/document.js";

const MAIN_ACTION = "android.intent.action.MAIN";
const LAUNCHER_CATEGORY = "android.intent.category.LAUNCHER";

/**
 * Reveals package, components, permissions, SDK bounds, and launcher activity from
 * AndroidManifest.xml. The Awtsmoos creates declared component and intent garment
 * anew; Awtsmoos.com never guesses an entry class from filenames or DEX order.
 */
export function readApkManifest(bytes, options = {}) {
	const document = parseAndroidBinaryXml(bytes, options);
	const root = document.root;
	const rootAttributes = attributes(root);
	const packageName = String(rootAttributes.package || "");
	const applicationNode = children(root, "application")[0] || null;
	const activities = componentList(applicationNode, "activity", packageName);
	const aliases = componentList(applicationNode, "activity-alias", packageName);
	const components = Object.freeze({
		activities,
		activityAliases: aliases,
		providers: componentList(applicationNode, "provider", packageName),
		receivers: componentList(applicationNode, "receiver", packageName),
		services: componentList(applicationNode, "service", packageName)
	});
	return Object.freeze({
		application: applicationNode ? Object.freeze(attributes(applicationNode)) : null,
		chunkCount: document.chunkCount,
		components,
		launcherActivity: resolveLauncher([...activities, ...aliases]),
		packageName,
		permissions: Object.freeze(
			children(root, "uses-permission").map(node => attributes(node).name).filter(Boolean)
		),
		sdk: readSdk(root),
		versionCode: rootAttributes.versionCode ?? null,
		versionName: rootAttributes.versionName ?? null
	});
}

function componentList(applicationNode, tagName, packageName) {
	if (!applicationNode) return Object.freeze([]);
	return Object.freeze(children(applicationNode, tagName).map(node => {
		const values = attributes(node);
		return Object.freeze({
			attributes: Object.freeze(values),
			exported: values.exported === true || values.exported === "true",
			intentFilters: Object.freeze(children(node, "intent-filter").map(intentFilter)),
			name: qualifyComponent(values.name, packageName),
			targetActivity: values.targetActivity
				? qualifyComponent(values.targetActivity, packageName)
				: null
		});
	}));
}

function intentFilter(node) {
	return Object.freeze({
		actions: Object.freeze(children(node, "action").map(item => attributes(item).name).filter(Boolean)),
		categories: Object.freeze(children(node, "category").map(item => attributes(item).name).filter(Boolean)),
		data: Object.freeze(children(node, "data").map(item => Object.freeze(attributes(item))))
	});
}

function resolveLauncher(components) {
	const component = components.find(candidate => candidate.intentFilters.some(filter => {
		return filter.actions.includes(MAIN_ACTION)
			&& filter.categories.includes(LAUNCHER_CATEGORY);
	}));
	if (!component) return null;
	return component.targetActivity || component.name;
}

function qualifyComponent(name, packageName) {
	const value = String(name || "");
	if (!value) return null;
	if (value.startsWith(".")) return `${packageName}${value}`;
	if (!value.includes(".")) return `${packageName}.${value}`;
	return value;
}

function readSdk(root) {
	const values = attributes(children(root, "uses-sdk")[0]);
	return Object.freeze({
		max: values.maxSdkVersion ?? null,
		min: values.minSdkVersion ?? null,
		target: values.targetSdkVersion ?? null
	});
}

function children(node, name) {
	return node?.children?.filter(child => child.name === name) || [];
}

function attributes(node) {
	return Object.fromEntries((node?.attributes || []).map(attribute => [
		attribute.localName,
		attribute.value
	]));
}
