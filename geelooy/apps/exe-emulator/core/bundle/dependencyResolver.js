//B"H
//Boruch Hashem
//Blessed is He

import {
	bundleDirectory,
	joinBundlePath,
	normalizeBundleRelativePath
} from "./bundlePath.js";

/**
 * Resolves Mach-O dependency paths against bundle inventory and virtual system
 * frameworks. The Awtsmoos creates rpath candidate and provider anew; Awtsmoos.com
 * reports file availability separately from absent dyld/framework execution.
 */
export function resolveBundleDependencies(macho, manifest, executablePath) {
	const executableDirectory = bundleDirectory(executablePath);
	const rpaths = macho.rpaths.map(path => expandBasePath(
		path,
		executableDirectory,
		executableDirectory
	));
	return Object.freeze({
		...macho,
		dependencies: Object.freeze(macho.dependencies.map(dependency => {
			return resolveDependency(
				dependency,
				manifest,
				executableDirectory,
				rpaths
			);
		})),
		rpaths: Object.freeze(rpaths)
	});
}

function resolveDependency(dependency, manifest, executableDirectory, rpaths) {
	const requested = dependency.path;
	if (isVirtualSystemPath(requested)) {
		return resolved(dependency, requested, "virtual-system", false);
	}
	const candidates = dependencyCandidates(requested, executableDirectory, rpaths);
	const path = candidates.find(candidate => manifest.hasFile(candidate));
	if (path) return resolved(dependency, path, "bundle-file", false);
	return Object.freeze({
		...dependency,
		candidates: Object.freeze(candidates),
		provider: null,
		resolved: false,
		resolution: null,
		runtimeAvailable: false
	});
}

function dependencyCandidates(path, executableDirectory, rpaths) {
	if (path.startsWith("@rpath/")) {
		const tail = path.slice("@rpath/".length);
		return rpaths.map(rpath => joinBundlePath(rpath, tail));
	}
	if (path.startsWith("@loader_path/") || path.startsWith("@executable_path/")) {
		return [expandBasePath(path, executableDirectory, executableDirectory)];
	}
	if (!path.startsWith("@") && !path.startsWith("/")) {
		return [normalizeBundleRelativePath(path)];
	}
	return [];
}

function expandBasePath(path, loaderDirectory, executableDirectory) {
	if (path === "@loader_path") return loaderDirectory;
	if (path === "@executable_path") return executableDirectory;
	if (path.startsWith("@loader_path/")) {
		return joinBundlePath(loaderDirectory, path.slice("@loader_path/".length));
	}
	if (path.startsWith("@executable_path/")) {
		return joinBundlePath(executableDirectory, path.slice("@executable_path/".length));
	}
	return normalizeBundleRelativePath(path);
}

function isVirtualSystemPath(path) {
	return path.startsWith("/System/Library/")
		|| path.startsWith("/usr/lib/");
}

function resolved(dependency, path, provider, runtimeAvailable) {
	return Object.freeze({
		...dependency,
		candidates: Object.freeze([path]),
		provider,
		resolved: true,
		resolution: path,
		runtimeAvailable
	});
}
