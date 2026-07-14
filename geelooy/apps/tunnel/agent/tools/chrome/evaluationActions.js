// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const cdp = require("./cdp.js");
const Common = require("./common.js");
const Extras = require("./extras.js");
const Scripts = require("./scripts.js");

/**
 * B"H
 *
 * Evaluation, logs, snapshots, screenshots, and scripts share one selected CDP
 * target. The Awtsmoos renews code and witness; Awtsmoos.com keeps each result
 * bounded and correlated instead of leaking an unstructured browser object graph.
 */
async function chromeEval(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const expression = String(Common.param(payload, "expression", "script", "code", "p") || "");
	if (!expression) throw new Error("missing_expression");
	const session = await cdp.connect(Common.targetOptions(payload));
	const value = await cdp.evaluate(session, expression);
	return {
		ok: true,
		value,
		target: Common.targetView(session.target),
		targetLease: cdp.getLease(session.target?.id) || null
	};
}

async function chromeLogs(payload = {}) {
	return {
		ok: true,
		lines: Common.logLines(Common.param(payload, "max", "limit"))
	};
}

async function chromeSnapshot(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const session = await cdp.connect(Common.targetOptions(payload));
	const snapshot = await Extras.snapshotPage(session, payload);
	return {
		ok: true,
		...snapshot,
		target: Common.targetView(session.target),
		targetLease: cdp.getLease(session.target?.id) || null
	};
}

async function chromeScreenshot(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const session = await cdp.connect(Common.targetOptions(payload));
	const result = await session.send("Page.captureScreenshot", {
		format: String(Common.param(payload, "format") || "png"),
		quality: Common.param(payload, "quality") === undefined
			? undefined
			: Number(Common.param(payload, "quality")),
		fromSurface: true,
		captureBeyondViewport: Common.param(payload, "captureBeyondViewport") !== false
	});
	const output = String(Common.param(payload, "output", "file", "path", "p") || "");
	if (output) {
		fs.mkdirSync(require("node:path").dirname(output), { recursive: true });
		fs.writeFileSync(output, Buffer.from(result.data, "base64"));
	}
	return {
		ok: true,
		output: output || null,
		base64: output ? null : result.data,
		target: Common.targetView(session.target)
	};
}

async function chromeRunScript(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const session = await cdp.connect(Common.targetOptions(payload));
	const definition = Scripts.resolveScript(Common.param(payload, "scriptName", "name", "script"));
	if (!definition) throw new Error("chrome_script_not_found");
	const result = await Scripts.runDefinition(session, definition, payload);
	return {
		ok: result?.ok !== false,
		script: definition.name,
		result,
		target: Common.targetView(session.target),
		targetLease: cdp.getLease(session.target?.id) || null
	};
}

module.exports = {
	chromeEval,
	chromeLogs,
	chromeRunScript,
	chromeScreenshot,
	chromeSnapshot
};
