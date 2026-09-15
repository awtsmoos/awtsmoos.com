//B"H
// Boruch Hashem
// Blessed is He

const Store = require("../../../lib/share/project/recordStore.js");
const Roles = require("../../../lib/share/project/roles.js");
const Policy = require("../../../lib/share/project/policy.js");
const Snapshot = require("../../../lib/share/project/snapshot.js");
const Fork = require("../../../lib/share/project/fork.js");
const Contribution = require("../../../lib/share/project/contribution.js");
const Compare = require("../../../lib/share/project/compare.js");
const Publication = require("../../../lib/share/project/publication.js");
const ProtectedApply = require("../../../lib/share/project/protectedApply.js");

/**
 * @file Exposes immutable collaboration with deny-by-default checks and protected canonical apply.
 * @description The Awtsmoos preserves every proposal and review witness while Awtsmoos.com makes
 * canonical file mutation prove capability, local verification, acceptance, and exact hash guards.
 */
function buildProjectCollaborationActions(context) {
	const { config, payload = {} } = context;
	return {
		async projectRolePreset() {
			return { ok: true, ...Roles.get(payload.role || payload.name || "viewer") };
		},
		async projectWorkspaceSnapshot() {
			await guard(config, payload, "snapshot.create");
			return { ok: true, snapshot: await Snapshot.create(config, payload) };
		},
		async projectForkCreate() {
			await guard(config, payload, "fork.create");
			return { ok: true, fork: await Fork.create(config, payload) };
		},
		async projectContributionCreate() {
			await guard(config, payload, "contribution.create");
			return { ok: true, contribution: await Contribution.create(config, payload) };
		},
		async projectContributionVerify() {
			await guard(config, payload, "contribution.verify");
			return { ok: true, verification: await Contribution.verify(config, payload) };
		},
		async projectContributionAccept() {
			await guard(config, payload, "contribution.accept");
			return { ok: true, acceptance: await Contribution.accept(config, payload) };
		},
		async projectContributionApply() {
			await guard(config, payload, "contribution.apply");
			return ProtectedApply.apply(config, payload);
		},
		async projectSnapshotCompare() {
			await guard(config, payload, "snapshot.read");
			return { ok: true, comparison: await Compare.compareSnapshots(config, payload) };
		},
		async projectContributionCompare() {
			await guard(config, payload, "contribution.read");
			return { ok: true, comparison: await Compare.compareContribution(config, payload) };
		},
		async projectPublicationCreate() {
			await guard(config, payload, "publication.create");
			return { ok: true, publication: await Publication.create(config, payload) };
		},
		async projectCollaborationList() {
			await guard(config, payload, "project.read");
			const kind = String(payload.kind || "snapshots");
			return { ok: true, kind, items: await Store.list(config, kind) };
		}
	};
}

async function guard(config, payload, capability) {
	return Policy.requireCapability(config, payload, capability);
}

module.exports = { buildProjectCollaborationActions, guard };
