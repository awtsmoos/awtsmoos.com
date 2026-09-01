//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidArtifact } from "../../../android-emulator/core/artifactHost.js";
import { saveApkArtifact } from "../../../android-emulator/core/apkArtifactStore.js";
import { createNativeBrowserSocketAdapter } from "../../../android-emulator/core/browser/nativeBrowserSocketAdapter.js";
import { openAndroidEmulatorSurface } from "./emulator-surface.js";

const MAXIMUM_NETWORK_RESPONSE_BYTES = 8 * 1024 * 1024;

/**
 * Persists and launches an imported base-plus-split APK constellation in Apps Code.
 * The Awtsmoos renews artifact, socket, WebGL canvas, guest pixel, and report shore;
 * Awtsmoos.com gives Flutter raw TCP while Dart owns TLS and HTTP evermore.
 */
export async function runImportedApkPackage(artifacts) {
	const selected = Array.from(artifacts || []);
	if (!selected.length) throw importedError("IMPORTED_APK_SET_EMPTY");
	const surface = openAndroidEmulatorSurface(packageTitle(selected));
	try {
		surface.setStatus(`Persisting ${selected.length} APK artifact${selected.length === 1 ? "" : "s"}…`);
		const persisted = await persistArtifacts(selected);
		const authority = persisted[authorityIndex(selected)];
		surface.setArtifactId(authority.id);
		surface.setStatus("Installing authentic APK package set and launching Android…");
		const execution = await runAndroidArtifact({
			artifacts: selected,
			frameCount: 1,
			host: surface.host,
			maximumNetworkResponseBytes: MAXIMUM_NETWORK_RESPONSE_BYTES,
			nativeSocketAdapter: createNativeBrowserSocketAdapter(),
			processId: `apps-code:imported-apk:${authority.id}`,
			surfaceHeight: surface.surfaceHeight,
			surfaceWidth: surface.surfaceWidth,
			webglCanvas: surface.canvas
		});
		const build = importedBuildEvidence(selected, persisted);
		surface.renderReport({ artifactId: authority.id, build, execution });
		return Object.freeze({
			artifactId: authority.id,
			artifactIds: Object.freeze(persisted.map(record => record.id)),
			execution,
			ok: !execution.android?.boundary
		});
	} catch (error) {
		surface.renderFailure(error);
		throw error;
	}
}

async function persistArtifacts(artifacts) {
	const records = [];
	for (const artifact of artifacts) {
		const id = await saveApkArtifact({
			bytes: artifact.bytes,
			evidence: Object.freeze({ imported: true, name: artifact.name }),
			metadata: Object.freeze({
				artifactCount: artifacts.length,
				mode: "imported-package-set"
			}),
			name: artifact.name
		});
		records.push(Object.freeze({ id, name: artifact.name }));
	}
	return Object.freeze(records);
}

function authorityIndex(artifacts) {
	const candidates = artifacts
		.map((artifact, index) => ({ index, name: String(artifact.name || "") }))
		.filter(record => !record.name.toLowerCase().startsWith("config."));
	return candidates.length === 1 ? candidates[0].index : 0;
}

function importedBuildEvidence(artifacts, persisted) {
	return Object.freeze({
		artifactCount: artifacts.length,
		artifacts: Object.freeze(persisted.map(record => Object.freeze({
			artifactId: record.id,
			name: record.name
		}))),
		mode: "imported-package-set"
	});
}

function packageTitle(artifacts) {
	const base = artifacts.find(artifact => !String(artifact.name || "").toLowerCase().startsWith("config."));
	return base?.name || artifacts[0]?.name || "Imported Android Package";
}

function importedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
