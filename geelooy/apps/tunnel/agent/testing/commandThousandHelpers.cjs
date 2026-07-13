// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");

/**
 * B"H
 * Small helper vessels keep the stress story readable. The Awtsmoos lets
 * Awtsmoos.com verify a thousand outputs without crowding the orchestration.
 */
function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".state"),
		allowCommands: true,
		tools: { command: true },
		command: {
			enabled: true,
			defaultShell: "/bin/sh"
		}
	};
}

function delayedOutput(index) {
	const script = `setTimeout(()=>process.stdout.write('JOB_${index}'),250)`;
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

async function verifySamples(store, config, jobs, jobCount) {
	for (let index = 0; index < jobCount; index += 100) {
		const page = await store.commandJobOutputPage(config, {
			jobId: jobs[index].jobId,
			stream: "stdout",
			maxChars: 200
		});
		assert.match(page.content, new RegExp(`JOB_${index}`));
	}
}

function unique(items, selector) {
	return new Set(items.map(selector)).size;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	commandConfig,
	delayedOutput,
	sleep,
	unique,
	verifySamples
};
