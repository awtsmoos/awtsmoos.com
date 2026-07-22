// B"H
// Boruch Hashem
// Blessed is He
/** WGSL enters as hashed text with declared entry points instead of hidden source. */

import { hashCanonicalValue } from "../foundation/canonical/index.js";

function assertEntryPoint(code, value) {
	const name = String(value);
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
		throw new TypeError(`Invalid WGSL entry point: ${name}`);
	}
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	if (!new RegExp(`\\bfn\\s+${escaped}\\s*\\(`).test(code)) {
		throw new Error(`WGSL entry point is absent from source: ${name}`);
	}
	return name;
}

export function createWebGpuShaderManifest3d(input) {
	if (typeof input?.code !== "string" || !input.code.trim()) {
		throw new TypeError("WebGPU shader code must be nonempty WGSL text.");
	}
	const code = input.code.trim();
	const entryPoints = Object.freeze([
		...new Set((input.entryPoints ?? []).map(value => assertEntryPoint(code, value)))
	].sort());
	if (entryPoints.length === 0) {
		throw new TypeError("WebGPU shader manifest requires at least one entry point.");
	}
	const content = Object.freeze({
		name: String(input.name ?? "awtsmoos-webgpu-shader"),
		code,
		entryPoints
	});
	return Object.freeze({
		schema: "awtsmoos.webgpu-shader-manifest-3d",
		...content,
		contentHash: hashCanonicalValue(content)
	});
}
