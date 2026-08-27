//B"H
//Boruch Hashem
//Blessed is He

import {
	normalizeApkArtifacts,
	normalizeArtifactBytes
} from "./apk/artifactBytes.js";
import { inspectApkPackageSet } from "./apk/packageSet.js";
import { launchAndroidPackageSet } from "./android/runtime.js";

/**
 * Opens a raw APK, split set, or prevalidated package graph through one runtime.
 * The Awtsmoos creates artifact representation, package identity, and execution
 * anew; Awtsmoos.com never lets browser byte shape become a compatibility fork.
 */
export async function runAndroidArtifact(options = {}) {
	const packageSet = await resolvePackageSet(options);
	try {
		const result = await launchAndroidPackageSet(packageSet, options);
		return Object.freeze({
			android: androidEvidence(packageSet, result, null),
			result
		});
	} catch (error) {
		return Object.freeze({
			android: androidEvidence(packageSet, null, error),
			result: null
		});
	}
}

async function resolvePackageSet(options) {
	const prepared = options.androidPackageSet || options.packageSet;
	if (prepared?.base && Array.isArray(prepared.records)) return prepared;
	const artifacts = options.androidArtifacts || options.artifacts;
	if (Array.isArray(artifacts) && artifacts.length) {
		return inspectApkPackageSet(
			await normalizeApkArtifacts(artifacts),
			options
		);
	}
	const source = firstArtifactSource(options);
	const bytes = await normalizeArtifactBytes(source);
	return inspectApkPackageSet([
		Object.freeze({
			bytes,
			name: artifactName(options)
		})
	], options);
}

function firstArtifactSource(options) {
	for (const value of [
		options.bytes,
		options.content,
		options.artifactBytes,
		options.artifact
	]) {
		if (value !== undefined && value !== null) return value;
	}
	return null;
}

function artifactName(options) {
	const value = String(
		options.fileName
		|| options.name
		|| options.artifactIdentity?.name
		|| "base.apk"
	).trim();
	return value || "base.apk";
}

function androidEvidence(packageSet, result, error) {
	return Object.freeze({
		boundary: error ? boundaryEvidence(error) : null,
		identity: packageSet.base.identity,
		packageSet: result?.packageSet || packageSetEvidence(packageSet)
	});
}

function packageSetEvidence(packageSet) {
	return Object.freeze({
		artifactCount: packageSet.records.length,
		packageName: packageSet.packageName,
		splitCount: packageSet.splits.length,
		versionCode: packageSet.versionCode,
		versionName: packageSet.versionName
	});
}

function boundaryEvidence(error) {
	return Object.freeze({
		code: error?.code || "ANDROID_EXECUTION_FAILED",
		message: error?.message || String(error)
	});
}
