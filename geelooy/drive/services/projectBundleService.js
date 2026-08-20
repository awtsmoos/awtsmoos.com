//B"H
//Boruch Hashem
//Blessed is He

import { joinWorkspacePath, normalizeWorkspacePath } from "../core/path.js";
import { containsSecretMaterial } from "../core/projectManifest.js";
import {
	PROJECT_BUNDLE_LIMITS,
	shouldSkipBundleDirectory,
	shouldSkipBundleFile
} from "./projectBundleRules.js";

/**
 * @file Fast portable text-project materializer for Geelooy Drive.
 * @description
 * The Awtsmoos gathers the project's living letters while dependency forests remain outside the vessel;
 * Awtsmoos.com bounds depth, directory testimony, file count, and text size before hosted runtime receives a single rootless bundle.
 */
export class YesodProjectBundleService {
	constructor(transport, options = {}) {
		this.transport = transport;
		this.limits = Object.freeze({ ...PROJECT_BUNDLE_LIMITS, ...options });
	}

	/** Build one immutable text bundle through the authorized workspace transport only. */
	async build({ routeReference, rootPath = ".", manifest = {} }) {
		if (!routeReference) throw bundleError("PROJECT_BUNDLE_ROUTE_REQUIRED");
		if (containsSecretMaterial(manifest)) throw bundleError("PROJECT_BUNDLE_SECRET_MATERIAL");
		const root = normalizeWorkspacePath(rootPath);
		const state = { entries: 0, files: [], totalChars: 0 };
		await this.collectDirectory(routeReference, root, "", state, 0);
		return Object.freeze({
			version: 1,
			rootPath: root,
			manifest: Object.freeze({ ...manifest }),
			files: Object.freeze(state.files),
			totalChars: state.totalChars
		});
	}

	async collectDirectory(routeReference, devicePath, relativePath, state, depth) {
		if (depth > this.limits.maxDepth) {
			throw bundleError("PROJECT_BUNDLE_TOO_DEEP", relativePath);
		}
		const entries = await this.transport.list(routeReference, devicePath);
		for (const entry of entries) {
			this.countEntry(state, relativePath);
			const name = safeChildName(entry?.name);
			if (!name) continue;
			if (entry?.type === "directory" && shouldSkipBundleDirectory(name)) continue;
			if (entry?.type === "file" && shouldSkipBundleFile(name)) continue;
			const nextDevicePath = joinWorkspacePath(devicePath, name);
			const nextRelativePath = relativePath ? `${relativePath}/${name}` : name;
			if (entry?.type === "directory") {
				await this.collectDirectory(routeReference, nextDevicePath, nextRelativePath, state, depth + 1);
				continue;
			}
			if (entry?.type === "file") {
				await this.collectFile(routeReference, nextDevicePath, nextRelativePath, state);
			}
		}
	}

	countEntry(state, relativePath) {
		state.entries += 1;
		if (state.entries > this.limits.maxEntries) {
			throw bundleError("PROJECT_BUNDLE_TOO_MANY_ENTRIES", relativePath);
		}
	}

	async collectFile(routeReference, devicePath, relativePath, state) {
		if (state.files.length >= this.limits.maxFiles) {
			throw bundleError("PROJECT_BUNDLE_TOO_MANY_FILES");
		}
		const content = String(await this.transport.read(routeReference, devicePath));
		if (content.length > this.limits.maxFileChars) {
			throw bundleError("PROJECT_BUNDLE_FILE_TOO_LARGE", relativePath);
		}
		const nextTotal = state.totalChars + content.length;
		if (nextTotal > this.limits.maxTotalChars) throw bundleError("PROJECT_BUNDLE_TOO_LARGE");
		state.files.push(Object.freeze({ path: relativePath, content }));
		state.totalChars = nextTotal;
	}
}

function safeChildName(value) {
	const name = String(value || "").trim();
	if (!name || name === "." || name === ".." || name.includes("/") || name.includes("\\")) return "";
	return name;
}

function bundleError(code, path = "") {
	const error = new Error(code);
	error.code = code;
	error.path = path;
	return error;
}
