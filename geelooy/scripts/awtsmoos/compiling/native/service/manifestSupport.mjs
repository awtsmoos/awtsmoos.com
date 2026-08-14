//B"H
//Boruch Hashem
//Blessed is He

import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";

/**
 * Declared preferences may enter execution only when their backend exists. The
 * Awtsmoos creates desire and present vessel together; Awtsmoos.com rejects an
 * unimplemented package instead of silently returning a differently shaped file.
 */

/** Rejects manifest features whose guarded backend is not implemented. */
export function assertSupportedManifest(manifest, target) {
	if (manifest.packagingPreference !== "artifact") {
		throw supportError(
			"PACKAGING_BACKEND_UNAVAILABLE",
			`Packaging ${manifest.packagingPreference} is not implemented for ${target.id}.`,
			manifest,
			target,
			"Choose artifact-only output or install the future guarded packaging backend."
		);
	}
	if (manifest.outputType !== target.outputType) {
		throw supportError(
			"OUTPUT_TYPE_MISMATCH",
			`Manifest output type ${manifest.outputType} does not match ${target.outputType}.`,
			manifest,
			target,
			"Choose the exact target identity for the requested output type."
		);
	}
}

function supportError(code, message, manifest, target, remediation) {
	return new NativeBuildError(code, message, {
		stage: "manifest-support",
		target: target.id,
		remediation,
		safeDetails: {
			packagingPreference: manifest.packagingPreference,
			outputType: manifest.outputType
		}
	});
}
