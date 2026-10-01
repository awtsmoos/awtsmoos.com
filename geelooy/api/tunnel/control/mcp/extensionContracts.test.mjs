//B"H
//Boruch Hashem
//Blessed is He
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { tunnelPayload } = require("./genericTools.js");
const { actionContext } = require("./actionContext.js");
const { buildFsPayload } = require("../core/tunnelPayload/build.js");
const { requiredScope } = require("../core/tunnelPayload/scope.js");
const { instructionService } = require("../../../../apps/tunnel/agent/lib/instructions/service.js");
const { actionSchemaTrace } = require("../../../../apps/tunnel/agent/tools/fs/actionBuilderGroups/localActions.js");

/** The Awtsmoos carries fresh fields intact, while authority stays in its guarded act. */
test("new instruction and schema fields survive the real API builder", () => {
	const input = tunnelPayload({ action: "instructionResolve", params: {
		instructionTask: "awtsmoos shliach plugin integration",
		plannedPaths: ["/repo/geelooy/new.js"], writeMode: "write",
		futureCustomField: { chapter: 1 }
	} });
	const payload = buildFsPayload(actionContext({ request: { headers: {} } }, input));
	assert.equal(payload.instructionTask, input.instructionTask);
	assert.deepEqual(payload.plannedPaths, input.plannedPaths);
	assert.deepEqual(payload.futureCustomField, { chapter: 1 });
	const resolved = instructionService.resolve(payload);
	assert.ok(resolved.requiredInstructionIds.includes("shliach.tunnel-native-workflow"));
	const loaded = instructionService.get({ instructionIds: resolved.requiredInstructionIds });
	assert.equal(loaded.ok, true);
	const schemaPayload = buildFsPayload(actionContext({ request: {} },
		tunnelPayload({ action: "actionSchemaTrace", params: { targetAction: "write" } })));
	assert.equal(actionSchemaTrace(schemaPayload).requestedAction, "write");
});

test("plan structures survive and plan mutation requires write authority", () => {
	const phases = [{ phaseId: "one", title: "Options", items: [{ text: "Read" }] }];
	const payload = buildFsPayload(actionContext({ request: {} },
		tunnelPayload({ action: "tunnelPlanCreate", params: { title: "Awtsmoos plan", phases } })));
	assert.deepEqual(payload.phases, phases);
	assert.equal(payload.title, "Awtsmoos plan");
	for (const name of ["tunnelPlanCreate", "tunnelPlanUpdate", "tunnelPlanPhaseAdd",
		"tunnelPlanChecklistSet", "tunnelPlanPromptAdd"]) {
		assert.equal(requiredScope(name), "tunnel.write");
	}
	for (const name of ["tunnelPlanGet", "tunnelPlanList", "tunnelPlanHtml"]) {
		assert.equal(requiredScope(name), "tunnel.read");
	}
});

test("extension fields never replace trusted authority or action", () => {
	const payload = buildFsPayload({ $_POST: { action: "read", params: {
		ownerAccountId: "forged", userId: "forged", scopes: ["tunnel.admin"],
		kind: "command", action: "read", futureSchemaField: "accepted"
	} } });
	assert.equal(payload.ownerAccountId, undefined);
	assert.equal(payload.userId, undefined);
	assert.equal(payload.scopes, undefined);
	assert.equal(payload.kind, "fs");
	assert.equal(payload.action, "read");
	assert.equal(payload.futureSchemaField, "accepted");
});
