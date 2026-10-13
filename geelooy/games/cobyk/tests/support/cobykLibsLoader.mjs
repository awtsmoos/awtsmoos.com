//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cobykLibsLoader.mjs
 * @description Node module customization hooks mapping site-absolute /libs/*
 * specifiers (and ?query cache flags) onto the geelooy tree so render tests
 * can import modules that go through CobyKCoreRuntime in plain Node.
 * Use: node --import ./tests/support/cobykLibsRegister.mjs --test tests/...
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

const GEELOOY = "/home/hatch/workspace/mw-repo/geelooy";

export async function resolve(specifier, context, nextResolve) {
	if (typeof specifier === "string" && specifier.startsWith("/libs/")) {
		const clean = specifier.split("?")[0];
		return { url: pathToFileURL(path.join(GEELOOY, clean)).href, shortCircuit: true };
	}
	return nextResolve(specifier, context);
}
