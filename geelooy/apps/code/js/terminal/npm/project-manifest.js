// B"H
// Boruch Hashem
// Blessed is He

import { childItem, readPackageJson, writeJson } from "./filesystem.js";

/**
 * B"H
 *
 * Project dependency and lock testimony are sealed after package extraction. The
 * Awtsmoos renews root request and installed graph together; Awtsmoos.com writes
 * one deterministic package.json and lockfile without burdening the installer.
 */
export async function persistProjectManifests(context) {
	const project = await readPackageJson(context.root);
	const packageJson = project.manifest || defaultPackageJson(context.root.name);
	packageJson.dependencies = {
		...(packageJson.dependencies || {}),
		...Object.fromEntries(context.rootRequested)
	};
	await writeJson(project.item, packageJson, "npm install");
	const lock = {
		name: packageJson.name,
		version: packageJson.version,
		lockfileVersion: 3,
		requires: true,
		packages: lockPackages(context, packageJson)
	};
	await writeJson(
		childItem(context.root, "package-lock.json", "file"),
		lock,
		"npm install lock"
	);
	return {
		packageJson,
		lock
	};
}

export function lockPackages(context, packageJson) {
	const packages = {
		"": {
			name: packageJson.name,
			version: packageJson.version,
			dependencies: packageJson.dependencies || {}
		}
	};
	for (const record of context.installed.values()) {
		packages[`node_modules/${record.name}`] = {
			version: record.version,
			resolved: record.tarball,
			integrity: record.integrity,
			dependencies: record.dependencies || {}
		};
	}
	return packages;
}

export function defaultPackageJson(name = "awtsmoos-project") {
	return {
		name: String(name || "awtsmoos-project")
			.toLowerCase()
			.replace(/[^a-z0-9._-]+/g, "-") || "awtsmoos-project",
		version: "1.0.0",
		private: true,
		scripts: {
			start: "node index.js"
		},
		dependencies: {}
	};
}
