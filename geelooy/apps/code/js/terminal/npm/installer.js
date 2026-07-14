// B"H
// Boruch Hashem
// Blessed is He

import { extractPackageTarGzip } from "./tar.js";
import { downloadTarball, resolvePackage } from "./registry.js";
import { writePackageEntries } from "./filesystem.js";
import { persistProjectManifests } from "./project-manifest.js";

/**
 * B"H
 *
 * Browser npm resolves manifests, downloads tarballs, extracts safe regular
 * files, writes virtual node_modules, recurses through dependencies, and seals
 * project manifests. The Awtsmoos renews every package edge deterministically.
 */
export async function installPackages(root, specifiers, options = {}) {
	const queue = [...new Set(specifiers.map(String).filter(Boolean))];
	if (!queue.length) throw new Error("npm_package_required");
	const context = {
		root,
		options,
		installed: new Map(),
		visiting: new Set(),
		rootRequested: new Map()
	};
	for (const specifier of queue) {
		const manifest = await installOne(specifier, context, true);
		context.rootRequested.set(manifest.name, `^${manifest.version}`);
	}
	await persistProjectManifests(context);
	return {
		ok: true,
		installed: [...context.installed.values()].map(record => ({
			name: record.name,
			version: record.version,
			files: record.files
		})),
		count: context.installed.size
	};
}

async function installOne(specifier, context, rootRequest = false) {
	const resolved = await resolvePackage(specifier, context.options);
	const key = `${resolved.name}@${resolved.version}`;
	if (context.installed.has(key)) return context.installed.get(key);
	if (context.visiting.has(key)) return resolved;
	context.visiting.add(key);
	context.options.onStatus?.(`Fetching ${key}`);
	try {
		const tarball = await downloadTarball(resolved.tarball, context.options.timeoutMs);
		const entries = await extractPackageTarGzip(tarball, context.options);
		const written = await writePackageEntries(
			context.root,
			resolved.name,
			entries,
			context.options
		);
		const record = {
			...resolved,
			files: written.written,
			rootRequest
		};
		context.installed.set(key, record);
		await installDependencies(record, context);
		context.options.onStatus?.(`Installed ${key}`);
		return record;
	} finally {
		context.visiting.delete(key);
	}
}

async function installDependencies(record, context) {
	for (const [name, range] of Object.entries(record.dependencies || {})) {
		try {
			await installOne(`${name}@${range}`, context, false);
		} catch (error) {
			if (!context.options.ignoreDependencyErrors) throw error;
			context.options.onStatus?.(`Skipped ${name}@${range}: ${error.message}`);
		}
	}
}
