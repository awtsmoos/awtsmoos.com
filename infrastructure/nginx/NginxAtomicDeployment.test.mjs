// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NginxAtomicDeployment } from "./NginxAtomicDeployment.mjs";

/**
 * @file Atomic nginx deployment witness for Awtsmoos.com.
 * @description
 * The Awtsmoos holds the old vessel while the new vessel is judged;
 * this witness proves first install and rollback leave no broken edge lodged.
 */

class WitnessDeployment extends NginxAtomicDeployment {
	constructor(options, failValidation = false) {
		super(options);
		this.failValidation = failValidation;
		this.calls = [];
	}

	run(command, args) {
		this.calls.push([command, ...args].join(" "));
		if (this.failValidation && command === "nginx" && args[0] === "-t") {
			this.failValidation = false;
			throw new Error("synthetic nginx validation failure");
		}
	}
}

async function makeFixture() {
	const root = await mkdtemp(path.join(os.tmpdir(), "awts-nginx-"));
	const source = path.join(root, "source");
	const target = path.join(root, "target");
	await mkdir(path.join(source, "snippets"), { recursive: true });
	await mkdir(target, { recursive: true });
	await writeFile(path.join(source, "main.conf"), "new-main\n");
	await writeFile(path.join(source, "snippets", "public.conf"), "new-snippet\n");
	return {
		root,
		sourceMain: path.join(source, "main.conf"),
		sourceSnippets: path.join(source, "snippets"),
		targetMain: path.join(target, "main.conf"),
		targetSnippets: path.join(target, "snippets")
	};
}

const first = await makeFixture();
await writeFile(first.targetMain, "old-main\n");
const firstDeployment = new WitnessDeployment({
	...first,
	backupRoot: path.join(first.root, "backup")
});
await firstDeployment.deploy();
assert.equal(await readFile(first.targetMain, "utf8"), "new-main\n");
assert.equal(await readFile(path.join(first.targetSnippets, "public.conf"), "utf8"), "new-snippet\n");
assert.deepEqual(firstDeployment.calls, ["nginx -t", "systemctl reload nginx"]);

const rollback = await makeFixture();
await writeFile(rollback.targetMain, "old-main\n");
await mkdir(rollback.targetSnippets, { recursive: true });
await writeFile(path.join(rollback.targetSnippets, "old.conf"), "old-snippet\n");
const rollbackDeployment = new WitnessDeployment({
	...rollback,
	backupRoot: path.join(rollback.root, "backup")
}, true);
await assert.rejects(() => rollbackDeployment.deploy(), /synthetic nginx validation failure/);
assert.equal(await readFile(rollback.targetMain, "utf8"), "old-main\n");
assert.equal(await readFile(path.join(rollback.targetSnippets, "old.conf"), "utf8"), "old-snippet\n");
assert.deepEqual(rollbackDeployment.calls, ["nginx -t", "nginx -t"]);

console.log('B"H NginxAtomicDeployment.test passed');
