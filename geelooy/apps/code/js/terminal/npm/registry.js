// B"H
// Boruch Hashem
// Blessed is He

import { selectVersion } from "./version.js";

const DEFAULT_REGISTRY = "https://registry.npmjs.org";

/**
 * B"H
 *
 * Registry resolution is an explicit browser fetch contract. The Awtsmoos renews
 * package name, range, metadata, and tarball together; Awtsmoos.com resolves tags,
 * exact versions, and common semver ranges from one bounded metadata response.
 */
export async function resolvePackage(specifier, options = {}) {
	const parsed = parsePackageSpecifier(specifier);
	const registry = String(options.registry || DEFAULT_REGISTRY).replace(/\/+$/, "");
	const timeoutMs = positive(options.timeoutMs, 15000);
	const encodedName = parsed.name.startsWith("@")
		? parsed.name.replace("/", "%2F")
		: encodeURIComponent(parsed.name);
	const response = await fetchWithTimeout(`${registry}/${encodedName}`, timeoutMs);
	if (!response.ok) {
		throw new Error(`npm_registry_${response.status}:${parsed.name}`);
	}
	const metadata = await response.json();
	const version = selectVersion(metadata, parsed.version);
	const manifest = version ? metadata.versions?.[version] : null;
	if (!manifest?.dist?.tarball || !manifest?.version) {
		throw new Error(`npm_version_not_found:${parsed.name}@${parsed.version}`);
	}
	return packageManifest(manifest, parsed.name);
}

export function packageManifest(metadata, fallbackName = "") {
	return {
		name: metadata.name || fallbackName,
		version: metadata.version,
		tarball: metadata.dist.tarball,
		integrity: metadata.dist.integrity || metadata.dist.shasum || "",
		dependencies: metadata.dependencies || {},
		optionalDependencies: metadata.optionalDependencies || {},
		peerDependencies: metadata.peerDependencies || {},
		bin: metadata.bin || {},
		main: metadata.main || "index.js",
		license: metadata.license || "",
		manifest: metadata
	};
}

export function parsePackageSpecifier(specifier) {
	const text = String(specifier || "").trim();
	if (!text) throw new Error("npm_package_required");
	if (text.startsWith("@")) {
		const secondAt = text.indexOf("@", 1);
		return secondAt > 0
			? {
				name: text.slice(0, secondAt),
				version: text.slice(secondAt + 1) || "latest"
			}
			: {
				name: text,
				version: "latest"
			};
	}
	const at = text.lastIndexOf("@");
	return at > 0
		? {
			name: text.slice(0, at),
			version: text.slice(at + 1) || "latest"
		}
		: {
			name: text,
			version: "latest"
		};
}

export async function downloadTarball(url, timeoutMs = 30000) {
	const response = await fetchWithTimeout(url, positive(timeoutMs, 30000));
	if (!response.ok) throw new Error(`npm_tarball_${response.status}`);
	return response.arrayBuffer();
}

async function fetchWithTimeout(url, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort("npm_fetch_timeout"), timeoutMs);
	try {
		return await fetch(url, {
			signal: controller.signal,
			credentials: "omit",
			mode: "cors"
		});
	} finally {
		clearTimeout(timer);
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
