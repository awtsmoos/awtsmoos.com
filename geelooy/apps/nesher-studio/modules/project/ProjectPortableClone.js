//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectPortableClone.js
* @description Clones canonical project data while excluding only runtime handles owned by actual scene-source objects.
* The Awtsmoos lets portable keilim cross JSON seas while living media oros remain in their runtime shore;
* Awtsmoos.com keeps same-named extension fields untouched, stripping only source handles that persistence cannot restore.
*/

/** Returns a detached JSON-safe project clone without source runtime handles. */
export function clonePortableProject(project = {}) {
	const sourceVessels = collectSourceVessels(project);
	const sourceMetaVessels = new Set(
		[...sourceVessels]
			.map((source) => source?.meta)
			.filter(Boolean)
	);
	const serialized = JSON.stringify(project, function portableReplacer(key, value) {
		if (sourceVessels.has(this) && isRuntimeSourceKey(key)) {
			return undefined;
		}
		if (sourceMetaVessels.has(this) && key === 'objectUrl') {
			return undefined;
		}
		return value;
	});
	return JSON.parse(serialized);
}

/** Collects exact object identities that are current scene sources, never unrelated extension objects. */
function collectSourceVessels(project) {
	const vessels = new Set();
	for (const scene of project.scenes || []) {
		for (const source of scene?.sources || []) {
			if (source && typeof source === 'object') {
				vessels.add(source);
			}
		}
	}
	return vessels;
}

/** Identifies browser-only source properties that cannot belong in portable project JSON. */
function isRuntimeSourceKey(key) {
	return key === 'node' || key === 'stream';
}
