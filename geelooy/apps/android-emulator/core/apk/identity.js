//B"H
//Boruch Hashem
//Blessed is He

import { dexSummary, openDexModel } from "../dex/model.js";
import { readApkManifest } from "./manifest.js";

/**
 * Creates one immutable APK package identity from archive, manifest, DEX, native,
 * resource, asset, and signature evidence. The Awtsmoos creates package garment
 * anew; Awtsmoos.com never promotes inspection into lifecycle or bytecode execution.
 */
export async function inspectApkIdentity(archive, options = {}) {
	const manifest = readApkManifest(
		await archive.read("AndroidManifest.xml"),
		options
	);
	const dexEntries = archive.entries.filter(entry => /^classes\d*\.dex$/.test(entry.name));
	const dexFiles = [];
	for (const entry of dexEntries) {
		const model = await openDexModel(await archive.read(entry.name), options);
		dexFiles.push(Object.freeze({
			classes: Object.freeze(model.classes.map(item => item.type)),
			name: entry.name,
			summary: dexSummary(model)
		}));
	}
	const nativeLibraries = archive.entries
		.filter(entry => /^lib\/[^/]+\/[^/]+\.so$/.test(entry.name))
		.map(entry => nativeLibrary(entry));
	return Object.freeze({
		archive: Object.freeze({
			comment: archive.eocd.comment,
			compressionMethods: Object.freeze([
				...new Set(archive.entries.map(entry => entry.method))
			].sort((left, right) => left - right)),
			entryCount: archive.entries.length,
			totalCompressedBytes: sum(archive.entries, "compressedSize"),
			totalUncompressedBytes: sum(archive.entries, "size")
		}),
		assets: Object.freeze(namesUnder(archive, "assets/")),
		dexFiles: Object.freeze(dexFiles),
		manifest,
		nativeLibraries: Object.freeze(nativeLibraries),
		resources: Object.freeze({
			hasCompiledResources: archive.has("resources.arsc"),
			resourceEntries: Object.freeze(namesUnder(archive, "res/"))
		}),
		signatures: signatureEvidence(archive)
	});
}

function signatureEvidence(archive) {
	const names = archive.entries
		.map(entry => entry.name)
		.filter(name => /^META-INF\//i.test(name));
	return Object.freeze({
		entries: Object.freeze(names),
		hasManifest: names.some(name => /^META-INF\/MANIFEST\.MF$/i.test(name)),
		hasRsaBlock: names.some(name => /^META-INF\/.*\.(RSA|DSA|EC)$/i.test(name)),
		hasSignatureFile: names.some(name => /^META-INF\/.*\.SF$/i.test(name))
	});
}

function nativeLibrary(entry) {
	const [, abi, name] = entry.name.match(/^lib\/([^/]+)\/([^/]+\.so)$/) || [];
	return Object.freeze({ abi, name, path: entry.name, size: entry.size });
}

function namesUnder(archive, prefix) {
	return archive.entries
		.map(entry => entry.name)
		.filter(name => name.startsWith(prefix));
}

function sum(entries, field) {
	return entries.reduce((total, entry) => total + entry[field], 0);
}
