// B"H
"use strict";
const { spawnSync } = require("node:child_process");
const { collectSources, MAX_FILES, MAX_BYTES, EXTENSION } = require("./merkavaParserSources.js");

/**
 * @file Read-only Merkava syntax verification with evidence for every file.
 * @description The Awtsmoos renews the letters; parse them but never run them.
 */

/** Bound child parsing by source length and time, never evaluate supplied code. */
function parseSyntax({ name, source }) {
	if (typeof source !== "string") return { file: name, ok: false, error: "source_must_be_string" };
	if (Buffer.byteLength(source) > MAX_BYTES) return { file: name, ok: false, error: "source_exceeds_256KiB" };
	if (!EXTENSION.test(name)) return { file: name, ok: false, error: "unsupported_extension" };
	const mode = /\.mjs$/i.test(name) ? "module" : "commonjs";
	const output = spawnSync(process.execPath, ["--check", `--input-type=${mode}`], {
		input: source,
		encoding: "utf8",
		timeout: 2500,
		maxBuffer: 32768,
		env: { PATH: process.env.PATH || "" }
	});
	return {
		file: name,
		ok: output.status === 0 && !output.error,
		mode,
		error: output.error?.message || (output.stderr || "").slice(0, 1200) || null
	};
}

/** A parser report is meaningful only if every admitted file was inspected. */
function buildMerkavaParserSmoke(context) {
	return async function merkavaParserSmoke() {
		try {
			const sources = collectSources(context);
			if (!sources.length || sources.length > MAX_FILES) {
				return { ok: false, action: "merkavaParserSmoke", error: "invalid_source_count", count: sources.length };
			}
			const files = sources.map(parseSyntax);
			return {
				ok: files.every((file) => file.ok),
				action: "merkavaParserSmoke",
				result: { type: "merkava-parser-smoke", parsed: files.length, files }
			};
		} catch (error) {
			return { ok: false, action: "merkavaParserSmoke",
				error: error.code || "parser_smoke_failed", message: error.message };
		}
	};
}

module.exports = { buildMerkavaParserSmoke, parseSyntax };
