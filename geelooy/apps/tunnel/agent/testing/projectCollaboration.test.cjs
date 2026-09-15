//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require("../lib/share/project/recordStore.js");
const Roles = require("../lib/share/project/roles.js");
const Fork = require("../lib/share/project/fork.js");
const Contribution = require("../lib/share/project/contribution.js");
const Compare = require("../lib/share/project/compare.js");
const Publication = require("../lib/share/project/publication.js");

/**
 * @file Proves snapshot lineage, fork, untrusted contribution, local verify, accept and publication.
 * @description The Awtsmoos preserves what arrived and what local evidence later proved;
 * Awtsmoos.com publishes immutable lineage while private Room/session/statement text stays hidden.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-project-collab-"));
	const config = { root };
	try {
		assert.equal(Roles.allows("viewer", "snapshot.read"), true);
		assert.equal(Roles.allows("viewer", "contribution.accept"), false);
		assert.equal(Roles.allows("maintainer", "contribution.accept"), true);
		const baseMaterial = snapshotMaterial("work_a", "source_a", "PRIVATE_SENTINEL");
		const source = await Store.put(config, "snapshots", baseMaterial);
		const sourceAgain = await Store.put(config, "snapshots", baseMaterial);
		assert.equal(source.id, sourceAgain.id);
		assert.equal(source.hash, sourceAgain.hash);
		const target = await Store.put(config, "snapshots", snapshotMaterial("work_b", "source_b", "OTHER_PRIVATE"));
		const fork = await Fork.create(config, {
			parentSnapshotId: source.id,
			name: "ai-fork",
			createdBy: "agent:forker"
		});
		assert.equal(fork.parentSnapshotId, source.id);
		assert.equal(fork.parentSnapshotHash, source.hash);
		const contribution = await Contribution.create(config, {
			sourceSnapshotId: source.id,
			targetSnapshotId: target.id,
			contributor: "external:agent",
			fileChanges: [{ path: "alpha.js", afterHash: "abc" }],
			failures: [{ id: "failure_external" }],
			tests: [{ name: "external-test", passed: true }]
		});
		assert.equal(contribution.trust, "external_unverified");
		await assert.rejects(
			() => Contribution.accept(config, { contributionId: contribution.id }),
			/contribution_local_verification_required/
		);
		const verification = await Contribution.verify(config, {
			contributionId: contribution.id,
			verifiedBy: "agent:local",
			passed: true,
			tests: [{ name: "local-test", passed: true }]
		});
		const acceptance = await Contribution.accept(config, {
			contributionId: contribution.id,
			verificationId: verification.id,
			acceptedBy: "agent:maintainer",
			resultSnapshotId: target.id
		});
		assert.equal(acceptance.verificationId, verification.id);
		const comparison = await Compare.compareContribution(config, { contributionId: contribution.id });
		assert.equal(comparison.fileChanges[0].path, "alpha.js");
		assert.equal(comparison.baseComparison.compilerChanged, true);
		const publication = await Publication.create(config, {
			snapshotId: source.id,
			publicMetadata: { title: "Public Release" }
		});
		const publicText = JSON.stringify(publication);
		for (const forbidden of ["PRIVATE_SENTINEL", "secret-room", "secret-session", "secret statement"]) {
			assert.equal(publicText.includes(forbidden), false, forbidden);
		}
		assert.equal(publication.snapshotId, source.id);
		assert.equal(publication.compiler.sources[0].contentHash, "hash_a");
		console.log(JSON.stringify({ ok: true, suite: "project-collaboration" }));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function snapshotMaterial(workId, sourceId, privateValue) {
	return {
		version: 1,
		projectId: "project_test",
		mission: { id: "mission_test", status: "active" },
		work: [{ id: workId, title: "Work", state: "open" }],
		knowledge: [{ id: `knowledge_${workId}`, kind: "decision", statement: "secret statement" }],
		obligations: [],
		room: { id: "secret-room", messages: [privateValue] },
		sessions: [{ id: "secret-session", note: privateValue }],
		compiler: {
			version: "context-compiler-v1",
			hash: sourceId,
			watermark: `watermark_${sourceId}`,
			sources: [{ id: sourceId, type: "file", contentHash: workId === "work_a" ? "hash_a" : "hash_b", version: "1", sequence: 1 }]
		}
	};
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
