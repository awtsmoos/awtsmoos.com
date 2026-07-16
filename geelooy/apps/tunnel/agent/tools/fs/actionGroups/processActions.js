// B"H
// Boruch Hashem
// Blessed is He

const Adapter = require("./processAdapter.js");
const Executable = require("./processExecutable.js");
const Limits = require("./processLimits.js");
const Payload = require("./processPayload.js");
const Selection = require("./processSelection.js");

/**
 * Process control is a guarded doorway, not a shell shortcut. The Awtsmoos
 * creates each PID for an instant; Awtsmoos.com lists through platform adapters,
 * filters without interpolation, and requires explicit confirmation to terminate.
 */
function buildProcessActions(context) {
	const payload = Payload.fusePayload(context.payload || {});
	const adapter = Adapter.createProcessAdapter();
	return {
		processList: () => processList(adapter, payload),
		processFind: () => processFind(adapter, payload),
		processKillSafe: () => processKillSafe(adapter, payload),
		windowsExeSmokeTest: () => Executable.windowsExeSmokeTest(
			context,
			payload
		)
	};
}

async function processList(adapter, payload) {
	const result = await adapter.list(Limits.timeout(payload));
	if (!result.ok) {
		return { action: "processList", ...result };
	}
	const processes = result.processes.slice(
		0,
		Limits.limit(payload, 100, 1000)
	);
	return {
		ok: true,
		action: "processList",
		count: processes.length,
		processes
	};
}

async function processFind(adapter, payload) {
	const query = Payload.queryOf(payload);
	const result = await adapter.list(Limits.timeout(payload));
	if (!result.ok) {
		return { action: "processFind", query, ...result };
	}
	const processes = result.processes
		.filter(processInfo => Selection.matches(processInfo, query))
		.slice(0, Limits.limit(payload, 50, 500));
	return {
		ok: true,
		action: "processFind",
		query,
		count: processes.length,
		processes
	};
}

async function processKillSafe(adapter, payload) {
	const result = await adapter.list(Limits.timeout(payload));
	if (!result.ok) {
		return { action: "processKillSafe", ...result };
	}
	const ids = Payload.normalizePids(payload);
	const matched = Selection.select(
		result.processes,
		ids,
		Payload.queryOf(payload)
	);
	const killable = matched.filter(Selection.isKillable);
	if (payload.dryRun !== false || !Payload.truthy(payload.confirm)) {
		return dryRunResponse(matched, killable, ids);
	}
	const killed = [];
	for (const processInfo of killable) {
		const outcome = await adapter.terminate(Number(processInfo.Id), {
			force: Payload.truthy(payload.force),
			timeoutMs: Limits.timeout(payload)
		});
		killed.push({ id: Number(processInfo.Id), ...outcome });
	}
	return {
		ok: killed.every(item => item.ok),
		action: "processKillSafe",
		dryRun: false,
		matched: matched.length,
		killed
	};
}

function dryRunResponse(matched, killable, ids) {
	return {
		ok: true,
		action: "processKillSafe",
		dryRun: true,
		confirmRequired: true,
		matched: matched.length,
		killable,
		ids
	};
}

module.exports = {
	buildProcessActions,
	fusePayload: Payload.fusePayload,
	normalizeArgs: Payload.normalizeArgs,
	normalizePids: Payload.normalizePids
};
