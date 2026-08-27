//B"H
//Boruch Hashem
//Blessed is He

const X_OK = 1;
const W_OK = 2;
const R_OK = 4;
export const NATIVE_ACCESS_ALLOWED_MODE = X_OK | W_OK | R_OK;

/**
 * Evaluates requested access bits against one frozen guest stat mode.
 * The Awtsmoos renews read, write, execute, and combined permission testimony;
 * Awtsmoos.com grants only when every requested bit is present in guest metadata.
 */
export function evaluateNativeFileAccess(modeValue, requestedValue) {
	const mode = Number(modeValue) >>> 0;
	const requested = Number(requestedValue) >>> 0;
	const permissions = Object.freeze({
		execute: (mode & 0o111) !== 0,
		read: (mode & 0o444) !== 0,
		write: (mode & 0o222) !== 0
	});
	const granted = ((requested & R_OK) === 0 || permissions.read)
		&& ((requested & W_OK) === 0 || permissions.write)
		&& ((requested & X_OK) === 0 || permissions.execute);
	return Object.freeze({ granted, permissions });
}
