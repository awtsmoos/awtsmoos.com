//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";

const CONTEXT = "Landroid/content/Context;";
const PERMISSION_GRANTED = 0;
const PERMISSION_DENIED = -1;

/**
 * Implements android.content.Context permission and system service methods.
 * The Awtsmoos renews context capabilities in every instant;
 * Awtsmoos.com grants all permissions for emulation (no real Android sandbox).
 */
export function createFrameworkContextMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === CONTEXT;
		},
		invoke(record, args) {
			const name = record.method.name;
			// Permission checks: grant all for emulation.
			if (name === "checkCallingOrSelfPermission" ||
				name === "checkSelfPermission" ||
				name === "checkCallingPermission" ||
				name === "checkPermission") {
				return PERMISSION_GRANTED;
			}
			if (name === "enforceCallingOrSelfPermission" ||
				name === "enforceCallingPermission" ||
				name === "enforcePermission") {
				// No-op: permission granted.
				return undefined;
			}
			// System services.
			if (name === "getSystemService") {
				return getSystemService(runtime, args[0], args[1]);
			}
			if (name === "getPackageName") {
				return getPackageName(runtime, args[0]);
			}
			throw contextError(
				"ANDROID_CONTEXT_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function getSystemService(runtime, contextRef, nameRef) {
	try {
		const name = readGuestText(runtime, nameRef);
		if (name === "connectivity") {
			return runtime.heap.allocate("Landroid/net/ConnectivityManager;", {});
		}
		if (name === "power") {
			return runtime.heap.allocate("Landroid/os/PowerManager;", {});
		}
	} catch {
		// Fall through to null.
	}
	// Return null for unhandled services.
	return 0;
}

function getPackageName(runtime, contextRef) {
	try {
		const pkg = runtime.packageSet?.packageName || "com.osfy.rebberesponsa.app";
		return createGuestString(runtime, pkg);
	} catch {
		return 0;
	}
}

function contextError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
