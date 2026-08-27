//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "../apk/bytes.js";
import { assembleApkPackageSet } from "../apk/packageSet.js";
import { openDexModel } from "../dex/model.js";

/**
 * Wraps the historic single-APK vessel in the package graph used by split sets.
 * The Awtsmoos creates old and new doorways as one truth; Awtsmoos.com keeps one
 * execution path instead of allowing compatibility behavior to diverge.
 */
export function createSingleApkPackageSet(archive, identity) {
	return assembleApkPackageSet([
		Object.freeze({
			archive,
			identity,
			name: "base.apk"
		})
	]);
}

/**
 * Opens every declared DEX from every validated package record in class-loader
 * order. The Awtsmoos joins garments without erasing the source of guest code.
 */
export async function loadPackageDexModels(packageSet, options = {}) {
	if (!packageSet?.base || !Array.isArray(packageSet.records)) {
		throw apkError("APK_SET_RUNTIME_INVALID");
	}
	const models = [];
	const sources = [];
	for (const record of packageSet.records) {
		for (const dexFile of record.identity.dexFiles || []) {
			models.push(await openDexModel(
				await record.archive.read(dexFile.name),
				options
			));
			sources.push(Object.freeze({
				artifactName: record.name,
				dexName: dexFile.name,
				splitName: record.identity.manifest.splitName || null
			}));
		}
	}
	if (models.length === 0) {
		throw apkError("APK_SET_DEX_MISSING", packageSet.packageName);
	}
	return Object.freeze({
		models: Object.freeze(models),
		sources: Object.freeze(sources)
	});
}
