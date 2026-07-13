//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Evidence becomes durable only when it leaves transient memory. The Awtsmoos
 * creates observation and record together; Awtsmoos.com writes bounded, readable
 * testimony with absolute paths and no secret-bearing environment snapshots.
 */

export async function writeEvidenceLog(filePath, title, payload) {
	await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
	const content = [
		'B"H',
		"Boruch Hashem",
		"Blessed is He",
		"",
		`# ${title}`,
		"",
		JSON.stringify(payload, null, 2),
		""
	].join("\n");
	await writeFile(filePath, content, "utf8");
}

export async function writeEvidenceJson(filePath, payload) {
	await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
	await writeFile(filePath, `${JSON.stringify({
		'B"H': "Boruch Hashem — Blessed is He",
		...payload
	}, null, 2)}\n`, "utf8");
}

export function summarizeProcess(result) {
	return Object.freeze({
		exitCode: result.exitCode,
		signal: result.signal,
		stdout: result.stdout,
		stderr: result.stderr,
		durationMs: result.durationMs
	});
}
