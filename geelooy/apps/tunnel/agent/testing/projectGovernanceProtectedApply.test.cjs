//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actions.js");
const Store = require("../lib/share/project/recordStore.js");

/**
 * @file Proves capability denial, grant/revoke, inert remote work, watches, and hash-guarded apply.
 * @description The Awtsmoos lets proposals travel widely while canonical mutation remains local,
 * verified, accepted, capability-gated, and protected by exact before hashes.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-project-governance-"));
	const config = {
		root,
		tunnelName: "governance-test",
		allowWrite: true,
		tools: { fsWrite: true }
	};
	const invoke = async (action, payload = {}) => {
		const request = { action, normalized: true, ...payload };
		return Actions.buildActions(config, request, null)[action]();
	};
	try {
		const file = path.join(root, "alpha.txt");
		fs.writeFileSync(file, "before", "utf8");
		const before = sha("before");
		const after = sha("after");
		const snapshot = await Store.put(config, "snapshots", {
			version: 1, projectId: "project_governance", work: [], knowledge: [], obligations: [],
			compiler: { version: "v", hash: "h", watermark: "w", sources: [] }
		});
		await assert.rejects(
			() => invoke("projectWorkspaceSnapshot", { principal: "external:no-grant" }),
			/project_capability_required:snapshot.create/
		);
		const grant = await invoke("projectCapabilityGrant", {
			subject: "external:contributor", role: "contributor"
		});
		assert.equal(grant.grant.subject, "external:contributor");
		const remote = await invoke("projectRemoteWorkRequest", {
			principal: "external:contributor", goal: "Please investigate", scope: "docs"
		});
		assert.ok(remote.request.id);
		await assert.rejects(
			() => invoke("projectRemoteWorkAccept", {
				principal: "external:contributor", requestId: remote.request.id
			}),
			/project_capability_required:remote_work.accept/
		);
		const watch = await invoke("projectSubscriptionCreate", {
			principal: "external:contributor", topic: "work", targetId: "work:*"
		});
		assert.ok(watch.subscription.id);
		const contribution = await invoke("projectContributionCreate", {
			principal: "external:contributor",
			sourceSnapshotId: snapshot.id,
			fileChanges: [{ path: "alpha.txt", expectedSha256: before, afterSha256: after, content: "after" }]
		});
		const cid = contribution.contribution.id;
		await assert.rejects(
			() => invoke("projectContributionVerify", {
				principal: "external:contributor", contributionId: cid, passed: true
			}),
			/project_capability_required:contribution.verify/
		);
		const verification = await invoke("projectContributionVerify", {
			contributionId: cid, passed: true, tests: [{ name: "local", passed: true }]
		});
		const acceptance = await invoke("projectContributionAccept", {
			contributionId: cid, verificationId: verification.verification.id
		});
		await assert.rejects(
			() => invoke("projectContributionApply", {
				contributionId: cid,
				acceptanceId: acceptance.acceptance.id,
				writes: [{ path: "alpha.txt", expectedSha256: "0".repeat(64), content: "after" }]
			}),
			/contribution_base_hash_mismatch/
		);
		const applied = await invoke("projectContributionApply", {
			contributionId: cid,
			acceptanceId: acceptance.acceptance.id,
			writes: [{ path: "alpha.txt", expectedSha256: before, content: "after" }]
		});
		assert.equal(applied.ok, true);
		assert.equal(fs.readFileSync(file, "utf8"), "after");
		assert.ok(applied.application.id);
		await invoke("projectCapabilityRevoke", { grantId: grant.grant.id });
		await assert.rejects(
			() => invoke("projectSubscriptionCreate", {
				principal: "external:contributor", topic: "project"
			}),
			/project_capability_required:subscription.manage/
		);
		console.log(JSON.stringify({ ok: true, suite: "project-governance-protected-apply" }));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function sha(value) {
	return crypto.createHash("sha256").update(String(value)).digest("hex");
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
