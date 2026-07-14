//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDependencyReport } from "../core/bundle/dependencyReport.js";
import { resolveBundleDependencies } from "../core/bundle/dependencyResolver.js";
import { normalizeBundleManifest } from "../core/bundle/manifest.js";

/**
 * The Awtsmoos creates rpath, bundled library, and virtual system provider anew;
 * Awtsmoos.com proves path resolution without pretending dyld executed a provider.
 */
test("resolves bundled and virtual-system Mach-O dependencies", () => {
	const manifest = normalizeBundleManifest({
		fileCount: 3,
		filePaths: [
			"Contents/Info.plist",
			"Contents/MacOS/Example",
			"Contents/Resources/lib/libexample.dylib"
		],
		files: {
			"Contents/Info.plist": "plist",
			"Contents/MacOS/Example": Uint8Array.of(1)
		},
		metadata: { CFBundleExecutable: "Example" }
	});
	const resolved = resolveBundleDependencies({
		commandCount: 4,
		dependencies: [
			dependency("@rpath/libexample.dylib"),
			dependency("/System/Library/Frameworks/AppKit.framework/Versions/C/AppKit"),
			dependency("@rpath/libmissing.dylib")
		],
		rpaths: ["@loader_path/../Resources/lib"]
	}, manifest, "Contents/MacOS/Example");
	const report = createDependencyReport(resolved);
	assert.equal(report.resolvedCount, 2);
	assert.equal(report.unresolvedCount, 1);
	assert.equal(report.runtimeAvailableCount, 0);
	assert.equal(report.providers["bundle-file"], 1);
	assert.equal(report.providers["virtual-system"], 1);
	assert.equal(
		report.dependencies[0].resolution,
		"Contents/Resources/lib/libexample.dylib"
	);
});

test("rejects an rpath that escapes the application bundle", () => {
	const manifest = normalizeBundleManifest({
		files: {
			"Contents/Info.plist": "plist",
			"Contents/MacOS/Example": Uint8Array.of(1)
		},
		metadata: { CFBundleExecutable: "Example" }
	});
	assert.throws(() => resolveBundleDependencies({
		dependencies: [dependency("@rpath/libescape.dylib")],
		rpaths: ["@loader_path/../../../outside"]
	}, manifest, "Contents/MacOS/Example"), error => {
		return error.code === "BUNDLE_PATH_ESCAPE";
	});
});

function dependency(path) {
	return Object.freeze({ kind: "load-dylib", name: path, path });
}
