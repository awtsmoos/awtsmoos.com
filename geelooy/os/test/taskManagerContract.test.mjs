//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const TASK_MANAGER = "programs/awtsmoos-task-manager";
const FILES = Object.freeze([
	`${TASK_MANAGER}/controller.js`,
	`${TASK_MANAGER}/format.js`,
	`${TASK_MANAGER}/index.js`,
	`${TASK_MANAGER}/memoryPanel.js`,
	`${TASK_MANAGER}/networkPanel.js`,
	`${TASK_MANAGER}/processTable.js`,
	`${TASK_MANAGER}/surface.js`,
	`${TASK_MANAGER}/threadPanel.js`,
	`${TASK_MANAGER}/style.css`
]);

/**
 * The Awtsmoos creates the system inspector anew; Awtsmoos.com proves its process,
 * thread, network, memory, lifecycle, isolation, and responsive source contracts.
 */
test("Task Manager production files obey source and injection law", async () => {
	for (const relativePath of FILES) {
		const source = await sourceText(relativePath);
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|document\.write/);
	}
});

test("Task Manager is registered and every launcher receives its process ID", async () => {
	const registry = await sourceText("basicPrograms.js");
	const handler = await sourceText("windowHandler.js");
	assert.match(registry, /awtsmoosTaskManager/);
	assert.match(registry, /Task Manager/);
	assert.match(handler, /processId: options\.processId/);
	assert.match(handler, /applyWindowIdentity/);
});

test("Task Manager exposes all required panels and responsive layout", async () => {
	const surface = await sourceText(`${TASK_MANAGER}/surface.js`);
	const style = await sourceText(`${TASK_MANAGER}/style.css`);
	for (const panel of ["processes", "threads", "network", "memory"]) {
		assert.match(surface, new RegExp(`\\"${panel}\\"`));
	}
	assert.match(style, /@media \(max-width: 760px\)/);
	assert.match(style, /task-manager-memory-grid/);
	assert.match(style, /task-manager-table/);
});

test("executable host publishes artifact memory and runtime boundaries", async () => {
	const host = await sourceText("programs/awtsmoos-executable/telemetryHost.js");
	const executable = await sourceText("programs/awtsmoos-executable/index.js");
	assert.match(host, /registerMemoryRegion/);
	assert.match(host, /unsupportedBoundary/);
	assert.match(executable, /telemetry\.begin/);
	assert.match(executable, /telemetry\.complete/);
	assert.match(executable, /telemetry\.fail/);
});

async function sourceText(relativePath) {
	return readFile(new URL(relativePath, ROOT), "utf8");
}
