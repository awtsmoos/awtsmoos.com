// B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/** Preserves canonical and legacy text carriers without changing their authority. */
function fields(raw = {}) {
	const pathValue = raw.p || raw.path || ".";
	const jobId = raw.jobId || raw.id || raw.job || raw.taskId || "";
	return {
		path: pathValue,
		p: pathValue,
		absolutePath: raw.absolutePath || "",
		cwd: raw.cwd || "",
		root: raw.root || "",
		jobId,
		id: jobId,
		stream: validStream(raw.stream),
		command: raw.command || raw.commands || raw.script ||
			Parse.from64(raw.command64) || Parse.from64(raw.commands64) || Parse.from64(raw.script64),
		scriptText: raw.scriptText || Parse.from64(raw.script64),
		content: raw.content || Parse.from64(raw.content64),
		find: raw.find || Parse.from64(raw.find64),
		query: raw.query || Parse.from64(raw.query64),
		replace: raw.replace || Parse.from64(raw.replace64),
		text: raw.text || Parse.from64(raw.text64),
		expression: raw.expression || Parse.from64(raw.expression64),
		shell: raw.shell || "",
		maxInlineChars: raw.maxInlineChars || "",
		budgetPerutas: raw.budgetPerutas ?? raw.budget ?? null,
		title: raw.title || raw.previewTitle || "",
		previewTitle: raw.previewTitle || raw.title || "",
		visibility: raw.visibility || "",
		previewVisibility: raw.previewVisibility || raw.visibility || "",
		ttlSeconds: raw.ttlSeconds || "",
		previewTtlSeconds: raw.previewTtlSeconds || raw.ttlSeconds || "",
		tunnelName: raw.tunnelName || raw.targetTunnel || "",
		targetVessel: raw.targetVessel || raw.vessel || ""
	};
}

function validStream(value) {
	const stream = String(value || "").toLowerCase();
	return ["stdout", "stderr"].includes(stream) ? stream : undefined;
}

module.exports = { fields, validStream };
