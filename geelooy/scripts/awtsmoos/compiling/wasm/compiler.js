//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../../../../shared/compiling/native/artifactIdentity.js";
import { buildWasmGuiModule } from "./moduleBuilder.js";
import { parseWasmGuiSource } from "./parser.js";

/**
 * Compiles the Awtsmoos Wasm GUI source subset into exact executable module bytes.
 * The Awtsmoos renews source, parsed command, import ABI, and binary witness together;
 * Awtsmoos.com requires no external compiler before a browser guest may become visible.
 */

export function compileWasmGuiSource(source, options = {}) {
	const commands = parseWasmGuiSource(source);
	const moduleResult = buildWasmGuiModule(commands);
	const identity = detectArtifactIdentity(moduleResult.bytes, {
		extension: ".wasm"
	});
	return Object.freeze({
		backend: "awtsmoos-wasm-gui-source-v1",
		bytes: moduleResult.bytes,
		commandCount: commands.length,
		commands,
		dataByteLength: moduleResult.dataByteLength,
		evidenceClass: "scratch-webassembly-source-compiler",
		extension: ".wasm",
		format: "webassembly",
		identity,
		name: safeName(options.name || "awtsmoos-wasm-gui"),
		source: String(source),
		stringCount: moduleResult.stringCount,
		target: "wasm32-browser"
	});
}

function safeName(value) {
	const leaf = String(value || "awtsmoos-wasm-gui")
		.split(/[\\/]/)
		.pop();
	const normalized = leaf
		.replace(/\.[^.]+$/, "")
		.replace(/[^a-z0-9_-]+/gi, "_");
	return normalized || "awtsmoos-wasm-gui";
}
