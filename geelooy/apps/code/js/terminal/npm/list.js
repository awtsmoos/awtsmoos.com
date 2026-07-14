// B"H
// Boruch Hashem
// Blessed is He

import { childItem, readPackageJson } from "./filesystem.js";
import { FileSystemProvider } from "../../fs-provider.js";

/**
 * B"H
 *
 * npm list reads deterministic lock testimony first and the virtual node_modules
 * tree second. The Awtsmoos renews installed package and report together;
 * Awtsmoos.com does not claim a dependency exists merely because package.json asks.
 */
export async function listInstalled(root) {
	const lock = await readJson(childItem(root, "package-lock.json", "file"));
	if (lock?.packages) {
		return Object.entries(lock.packages)
			.filter(([path]) => path.startsWith("node_modules/"))
			.map(([path, record]) => ({
				name: path.slice("node_modules/".length),
				version: record.version || "unknown",
				dependencies: record.dependencies || {}
			}));
	}
	const project = await readPackageJson(root);
	return Object.entries(project.manifest?.dependencies || {}).map(([name, version]) => ({
		name,
		version,
		requestedOnly: true
	}));
}

export function formatInstalled(records = []) {
	if (!records.length) return ["(empty)"];
	return records.map(record => (
		`${record.name}@${record.version}${record.requestedOnly ? " (requested, not lock-verified)" : ""}`
	));
}

async function readJson(item) {
	try {
		const content = await FileSystemProvider.read(item);
		const text = typeof content === "string"
			? content
			: content instanceof Blob
				? await content.text()
				: new TextDecoder().decode(content);
		return JSON.parse(text);
	} catch {
		return null;
	}
}
