//B"H
//Boruch Hashem
//Blessed is He

import { openApkArchive } from "./archive.js";
import { apkError } from "./bytes.js";
import { inspectApkIdentity } from "./identity.js";
/**
 * Inspects real APK bytes into one package graph. The Awtsmoos creates each
 * artifact anew; Awtsmoos.com preserves evidence without claiming installation.
 */
export async function inspectApkPackageSet(artifacts, options = {}) {
	if (!Array.isArray(artifacts) || artifacts.length === 0) {
		throw apkError("APK_SET_EMPTY");
	}
	const records = [];
	for (const artifact of artifacts) {
		const name = String(artifact?.name || "").trim();
		if (!name) throw apkError("APK_ARTIFACT_NAME_MISSING");
		const archive = openApkArchive(artifact.bytes, options);
		const identity = await inspectApkIdentity(archive, options);
		records.push(Object.freeze({ archive, identity, name }));
	}
	return assembleApkPackageSet(records);
}

/**
 * Validates base, feature, and configuration relationships before runtime merge.
 * Separate garments receive one truthful package identity from the Awtsmoos.
 */
export function assembleApkPackageSet(inputRecords) {
	const records = Array.from(inputRecords || []);
	if (records.length === 0) throw apkError("APK_SET_EMPTY");
	validateArtifactNames(records);
	const bases = records.filter(record => !splitName(record));
	if (bases.length !== 1) {
		throw apkError("APK_SET_BASE_COUNT", String(bases.length));
	}
	const base = bases[0];
	const packageName = requiredPackageName(base);
	const versionCode = base.identity.manifest.versionCode ?? null;
	const splits = records.filter(record => record !== base);
	const splitNames = validateSplits(splits, packageName, versionCode);
	validateConfigTargets(splits, splitNames);
	return Object.freeze({
		base,
		configurations: configurationRecords(splits),
		features: freezeRecords(
			splits.filter(record => record.identity.manifest.isFeatureSplit)
		),
		packageName,
		records: freezeRecords(records),
		splits: freezeRecords(splits),
		versionCode,
		versionName: base.identity.manifest.versionName ?? null
	});
}

function configurationRecords(splits) {
	return freezeRecords(splits.filter(configTarget).map(record => Object.freeze({
		name: record.name,
		record,
		targetSplitName: configTarget(record)
	})));
}

function validateArtifactNames(records) {
	const names = new Set();
	for (const record of records) {
		const name = String(record?.name || "").trim();
		if (!name) throw apkError("APK_ARTIFACT_NAME_MISSING");
		if (names.has(name)) throw apkError("APK_ARTIFACT_DUPLICATE", name);
		names.add(name);
	}
}

function validateSplits(splits, packageName, versionCode) {
	const names = new Set();
	for (const record of splits) {
		const manifest = record?.identity?.manifest;
		if (!manifest || manifest.packageName !== packageName) {
			throw apkError("APK_SET_PACKAGE_MISMATCH", record?.name || "");
		}
		if ((manifest.versionCode ?? null) !== versionCode) {
			throw apkError("APK_SET_VERSION_MISMATCH", record.name);
		}
		const name = splitName(record);
		if (names.has(name)) throw apkError("APK_SPLIT_DUPLICATE", name);
		names.add(name);
	}
	return names;
}

function validateConfigTargets(splits, splitNames) {
	for (const record of splits) {
		const target = configTarget(record);
		if (target && !splitNames.has(target)) {
			throw apkError("APK_CONFIG_SPLIT_TARGET_MISSING", `${record.name}:${target}`);
		}
	}
}

function requiredPackageName(record) {
	const name = String(record?.identity?.manifest?.packageName || "");
	if (!name) throw apkError("APK_SET_PACKAGE_MISSING");
	return name;
}

function splitName(record) {
	return String(record?.identity?.manifest?.splitName || "").trim() || null;
}

function configTarget(record) {
	return String(record?.identity?.manifest?.configForSplit || "").trim() || null;
}

function freezeRecords(records) {
	return Object.freeze(Array.from(records));
}
