//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { LocalInferencePaths } from "./LocalInferencePaths.mjs";

const paths = new LocalInferencePaths();
let stopped = false;
try {
	const pid = Number(fs.readFileSync(paths.pid, "utf8").trim());
	if (Number.isInteger(pid) && pid > 0) {
		process.kill(pid, "SIGTERM");
		stopped = true;
	}
} catch {}
fs.rmSync(paths.pid, { force: true });
console.log(JSON.stringify({ status: stopped ? "stopping" : "not-running" }));
