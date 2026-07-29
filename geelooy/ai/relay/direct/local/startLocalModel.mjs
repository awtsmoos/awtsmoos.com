//B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { LocalInferencePaths } from "./LocalInferencePaths.mjs";
import { LocalInferenceProcess } from "./LocalInferenceProcess.mjs";

const paths = new LocalInferencePaths();
const inference = new LocalInferenceProcess({ paths });

if (!inference.ready()) {
	console.error(JSON.stringify({ status: "runtime-missing", browserUsed: false, domUsed: false }));
	process.exit(1);
}
if (await healthy()) {
	console.log(JSON.stringify({ status: "already-ready", browserUsed: false, domUsed: false }));
	process.exit(0);
}
const output = fs.openSync(paths.log, "a");
const child = spawn(process.execPath, [
	fileURLToPath(new URL("./serveLocalModel.mjs", import.meta.url))
], {
	detached: true,
	stdio: ["ignore", output, output]
});
child.unref();
for (let attempt = 0; attempt < 100; attempt += 1) {
	if (await healthy()) {
		console.log(JSON.stringify({ status: "ready", browserUsed: false, domUsed: false }));
		process.exit(0);
	}
	await new Promise(resolve => setTimeout(resolve, 100));
}
console.error(JSON.stringify({ status: "start-failed", browserUsed: false, domUsed: false }));
process.exit(1);

async function healthy() {
	try {
		const response = await fetch("http://127.0.0.1:18080/health", {
			signal: AbortSignal.timeout(1000)
		});
		return response.ok;
	} catch {
		return false;
	}
}
