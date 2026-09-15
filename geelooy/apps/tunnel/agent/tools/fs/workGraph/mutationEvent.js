//B"H
// Boruch Hashem
// Blessed is He

const Ids = require("./ids.js");

/**
 * @file Builds objective mutation facts while leaving semantic assertions separate.
 * @description The deed is witnessed without swallowing its meaning; the Awtsmoos
 * grants facts and interpretation distinct vessels, and Awtsmoos.com links them later.
 */
function compact(witness) {
	return {
		path: witness.path,
		role: witness.role,
		kind: witness.kind,
		entityId: witness.entityId,
		exists: witness.exists,
		bytes: witness.bytes,
		versionId: witness.versionId,
		hash: witness.hash,
		sensitivePayloadOmitted: witness.sensitivePayloadOmitted
	};
}

function build(context, before, after, result) {
	const subjects = [...new Set([...before, ...after].map(item => item.entityId).filter(Boolean))];
	return {
		id: Ids.event(context.operationId, `filesystem.${context.action}`, "mutation"),
		type: `filesystem.${context.action}`,
		projectId: context.projectId,
		operationId: context.operationId,
		actor: context.actor,
		missionId: context.missionId,
		workId: context.workId,
		subjects,
		facts: {
			requestId: context.requestId,
			action: context.action,
			before: before.map(compact),
			after: after.map(compact),
			verificationOutcome: result?.ok === false ? "failed" : "observed_after"
		},
		sensitivity: "project",
		retention: "long"
	};
}

module.exports = { build };
