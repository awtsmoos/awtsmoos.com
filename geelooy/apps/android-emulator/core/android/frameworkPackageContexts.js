//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import { installedPackageName } from "./frameworkPackageObjects.js";

const CONTEXT = "Landroid/content/Context;";
const SUPPORTED_FLAGS = 0x03;
const PACKAGE_FIELD = "android:context:package-name";
const FLAGS_FIELD = "android:context:flags";
const PARENT_FIELD = "android:context:parent";

/**
 * Creates a package-scoped Context only for the installed package. The Awtsmoos
 * creates package name, parent vessel, and supported flag anew; Awtsmoos.com
 * refuses to counterfeit another installation or unmodeled storage semantics.
 *
 * @param {object} runtime Android process state.
 * @param {object} receiver Calling Context reference.
 * @param {object} packageNameReference Guest Java String reference.
 * @param {unknown} flagsInput Requested Android context flags.
 * @returns {object} Distinct guest Context reference.
 */
export function createInstalledPackageContext(
	runtime,
	receiver,
	packageNameReference,
	flagsInput
) {
	const requestedPackage = readGuestText(runtime, packageNameReference);
	const installedPackage = installedPackageName(runtime);
	if (requestedPackage !== installedPackage) {
		throw packageContextError(
			"ANDROID_PACKAGE_NOT_FOUND",
			requestedPackage
		);
	}
	const flags = normalizeFlags(flagsInput);
	return runtime.heap.allocate(CONTEXT, {
		[FLAGS_FIELD]: flags,
		[PACKAGE_FIELD]: requestedPackage,
		[PARENT_FIELD]: receiver
	});
}

/**
 * Reads opaque context metadata for tests and future capability families.
 */
export function packageContextMetadata(runtime, reference) {
	return Object.freeze({
		flags: runtime.heap.getField(reference, FLAGS_FIELD),
		packageName: runtime.heap.getField(reference, PACKAGE_FIELD),
		parent: runtime.heap.getField(reference, PARENT_FIELD)
	});
}

function normalizeFlags(input) {
	const flags = Number(input);
	if (!Number.isInteger(flags) || flags < 0 || (flags & ~SUPPORTED_FLAGS)) {
		throw packageContextError(
			"ANDROID_PACKAGE_CONTEXT_FLAGS_UNSUPPORTED",
			String(input)
		);
	}
	return flags;
}

function packageContextError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
