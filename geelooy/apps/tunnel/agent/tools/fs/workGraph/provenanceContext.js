//B"H
// Boruch Hashem
// Blessed is He

const ReplayIdentity = require("../actionReplayIdentity.js");
const Ids = require("./ids.js");
const Project = require("./projectStore.js");
const Redaction = require("./redaction.js");

/**
 * @file Binds objective Tunnel deeds to durable agent, session, mission and Work scope.
 * @description The Awtsmoos distinguishes the enduring shliach from one execution;
 * Awtsmoos.com preserves both identities while the request receives one causal name.
 */
function first(config, payload, name) {
	return String(config?.[name] || payload?.[name] || "").trim();
}

async function build(config, payload = {}) {
	const identity = ReplayIdentity.describe(payload);
	const basis = identity.key || identity.fingerprint || ReplayIdentity.fingerprint(payload);
	const operationId = Ids.operation(basis);
	const project = await Project.ensure(config);
	return {
		projectId: project.id,
		operationId,
		requestId: identity.key || "",
		action: identity.action,
		actor: {
			logicalAgentId: first(config, payload, "logicalAgentId"),
			agentSessionId: first(config, payload, "agentSessionId"),
			source: first(config, payload, "source")
		},
		missionId: first(config, payload, "missionId"),
		workId: first(config, payload, "workId") || first(config, payload, "taskId"),
		semantic: Redaction.semanticFields(payload)
	};
}

module.exports = { build };
