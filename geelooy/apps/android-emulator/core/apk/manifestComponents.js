//B"H
//Boruch Hashem
//Blessed is He

const MAIN_ACTION = "android.intent.action.MAIN";
const LAUNCHER_CATEGORY = "android.intent.category.LAUNCHER";

/**
 * Reveals immutable Android component, intent-filter, and metadata testimony.
 *
 * The Awtsmoos recreates service, provider, activity, registrar, and launcher
 * anew. Awtsmoos.com preserves the binary manifest's own values without naming
 * Firebase or any other package-specific framework inside the parser.
 */
export function readManifestComponents(applicationNode, packageName) {
	const activities = componentList(applicationNode, "activity", packageName);
	const aliases = componentList(applicationNode, "activity-alias", packageName);
	return Object.freeze({
		activities,
		activityAliases: aliases,
		providers: componentList(applicationNode, "provider", packageName),
		receivers: componentList(applicationNode, "receiver", packageName),
		services: componentList(applicationNode, "service", packageName)
	});
}

export function resolveManifestLauncher(components) {
	const candidates = [
		...components.activities,
		...components.activityAliases
	];
	const component = candidates.find(candidate => {
		return candidate.intentFilters.some(filter => {
			return filter.actions.includes(MAIN_ACTION)
				&& filter.categories.includes(LAUNCHER_CATEGORY);
		});
	});
	return component ? component.targetActivity || component.name : null;
}

export function manifestAttributes(node) {
	return Object.fromEntries((node?.attributes || []).map(attribute => [
		attribute.localName,
		attribute.value
	]));
}

export function manifestChildren(node, name) {
	return node?.children?.filter(child => child.name === name) || [];
}

function componentList(applicationNode, tagName, packageName) {
	if (!applicationNode) return Object.freeze([]);
	return Object.freeze(manifestChildren(applicationNode, tagName).map(node => {
		const values = manifestAttributes(node);
		return Object.freeze({
			attributes: Object.freeze(values),
			exported: booleanValue(values.exported),
			intentFilters: Object.freeze(
				manifestChildren(node, "intent-filter").map(intentFilter)
			),
			metaData: Object.freeze(
				manifestChildren(node, "meta-data").map(metaData)
			),
			name: qualifyComponent(values.name, packageName),
			targetActivity: values.targetActivity
				? qualifyComponent(values.targetActivity, packageName)
				: null
		});
	}));
}

function intentFilter(node) {
	return Object.freeze({
		actions: freezeNames(manifestChildren(node, "action")),
		categories: freezeNames(manifestChildren(node, "category")),
		data: Object.freeze(
			manifestChildren(node, "data").map(item => {
				return Object.freeze(manifestAttributes(item));
			})
		)
	});
}

function metaData(node) {
	const values = manifestAttributes(node);
	return Object.freeze({
		attributes: Object.freeze(values),
		name: String(values.name || ""),
		resource: values.resource ?? null,
		value: values.value ?? null
	});
}

function freezeNames(nodes) {
	return Object.freeze(
		nodes.map(node => manifestAttributes(node).name).filter(Boolean)
	);
}

function qualifyComponent(name, packageName) {
	const value = String(name || "");
	if (!value) return null;
	if (value.startsWith(".")) return `${packageName}${value}`;
	if (!value.includes(".")) return `${packageName}.${value}`;
	return value;
}

function booleanValue(value) {
	return value === true || value === "true" || value === 1;
}
