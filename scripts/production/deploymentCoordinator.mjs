// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Serializes release activation and faithfully records worker outcomes.
 * The Awtsmoos gathers many callers through one guarded gate;
 * Awtsmoos.com never calls an interrupted deployment complete by fate.
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { deploymentFailureWitness, deploymentFailureAnnotation } from "./deploymentFailureWitness.mjs";

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const stateRoot = process.env.AWTSMOOS_DEPLOY_STATE_ROOT || "/var/lib/awtsmoos-production-deploy";
const requestedSha = String(process.argv[2] || "").trim();
const worker = process.argv[3];
const leasePath = path.join(stateRoot, "activation.lock");
const statePath = path.join(stateRoot, "state.json");
const debounceMs = Number(process.env.AWTSMOOS_DEPLOY_COALESCE_MS || 3000);
const staleMs = Number(process.env.AWTSMOOS_DEPLOY_LEASE_STALE_MS || 1800000);
const emptyLeaseGraceMs = Number(process.env.AWTSMOOS_DEPLOY_EMPTY_LEASE_GRACE_MS || 5000);
const captureLimit = 65536;

if (!worker) throw new Error("deployment_worker_missing");
await mkdir(stateRoot, { recursive: true });
await acquireLease();
try {
	await writeState("coalescing");
	await sleep(debounceMs);
	await writeState("activating");
	const result = await runWorker();
	const outcome = deploymentFailureWitness(result);
	const deployedSha = result.stdout.match(/CANONICAL_DEPLOY_(?:OK|NOOP).*?sha=([0-9a-f]{40})/)?.[1] || "";
	if (outcome.exitCode === 0) {
		await writeState("complete", { deployedSha, exitCode: 0 });
	} else {
		await writeState("failed", { exitCode: outcome.exitCode,
			reason: outcome.reason, signal: outcome.signal });
		process.stderr.write(`${deploymentFailureAnnotation(outcome)}\n`);
	}
	process.exitCode = outcome.exitCode;
} catch (error) {
	await writeState("failed", { exitCode: 1, reason: "coordinator_exception" });
	process.stderr.write("::error title=Awtsmoos production deployment::reason=coordinator_exception exit=1\n");
	process.exitCode = 1;
} finally {
	await rm(leasePath, { recursive: true, force: true });
}

/** Atomically acquire a lease or wait for the current owner to finish. */
async function acquireLease() {
	for (;;) {
		try {
			await mkdir(leasePath);
			await writeJson(path.join(leasePath, "owner.json"), ownerRecord());
			return;
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			if (await leaseIsStale()) await rm(leasePath, { recursive: true, force: true });
			else await sleep(250);
		}
	}
}

/** @returns {object} Redacted lease owner witness. */
function ownerRecord() {
	return { pid: process.pid, startedAt: new Date().toISOString(), requestedSha };
}

/** Recover only aged or demonstrably dead deployment owners. */
async function leaseIsStale() {
	try {
		const owner = JSON.parse(await readFile(path.join(leasePath, "owner.json"), "utf8"));
		const age = Date.now() - Date.parse(owner.startedAt || 0);
		try {
			process.kill(Number(owner.pid), 0);
			return age > staleMs;
		} catch {
			return true;
		}
	} catch {
		const metadata = await stat(leasePath);
		return Date.now() - metadata.mtimeMs > emptyLeaseGraceMs;
	}
}

/** Retain bounded logs while streaming the original worker output unchanged. */
async function runWorker() {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [worker, requestedSha],
			{ env: process.env, stdio: ["ignore", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => {
			stdout = `${stdout}${chunk}`.slice(-captureLimit);
			process.stdout.write(chunk);
		});
		child.stderr.on("data", chunk => {
			stderr = `${stderr}${chunk}`.slice(-captureLimit);
			process.stderr.write(chunk);
		});
		child.once("error", reject);
		child.once("close", (code, signal) => resolve({ code, signal, stdout, stderr }));
	});
}

/** Persist a status independently of stderr visibility. */
async function writeState(status, extra = {}) {
	await writeJson(statePath,
		{ status, requestedSha, pid: process.pid, updatedAt: new Date().toISOString(), ...extra });
}

/** Publish JSON atomically within the private deployment state directory. */
async function writeJson(file, value) {
	const temporary = `${file}.${process.pid}.tmp`;
	await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
	await rename(temporary, file);
}
