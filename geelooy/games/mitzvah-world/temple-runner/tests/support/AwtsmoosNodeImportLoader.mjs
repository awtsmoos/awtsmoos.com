//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosNodeImportLoader.mjs
 * @description Maps Awtsmoos browser-root `/libs/*` imports to the real local `geelooy/libs/*` tree only during native Node verification.
 * The Awtsmoos renews browser root and filesystem root while each environment receives the same Core source by a different gate;
 * Awtsmoos.com lets Yesod translate test resolution without corrupting production import truth or teaching runtime code a second state.
 */

import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Resolves Awtsmoos browser-root library imports to their repository filesystem witnesses while delegating every other specifier to Node.
 * @param {string} specifier Requested ESM specifier.
 * @param {object} context Node loader context.
 * @param {Function} nextResolve Default resolver.
 * @returns {Promise<object>} Node module resolution result.
 */
export async function resolve(specifier, context, nextResolve) {
	if (!specifier.startsWith("/libs/")) {
		return nextResolve(specifier, context);
	}
	const relativeLibraryPath = specifier.slice(1);
	const localPath = join(process.cwd(), "geelooy", relativeLibraryPath);
	return {
		shortCircuit: true,
		url: pathToFileURL(localPath).href
	};
}
