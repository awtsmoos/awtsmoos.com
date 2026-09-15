//B"H
// Boruch Hashem
// Blessed is He

const Store = require("../../../lib/share/project/recordStore.js");
const Roles = require("../../../lib/share/project/roles.js");
const Snapshot = require("../../../lib/share/project/snapshot.js");
const Fork = require("../../../lib/share/project/fork.js");
const Contribution = require("../../../lib/share/project/contribution.js");
const Compare = require("../../../lib/share/project/compare.js");
const Publication = require("../../../lib/share/project/publication.js");

/**
 * @file Exposes immutable AI-native project collaboration beside legacy scoped sharing.
 * @description The Awtsmoos preserves each submitted state and review witness separately;
 * Awtsmoos.com offers snapshots, forks, contributions, verification, acceptance and publication.
 */
function buildProjectCollaborationActions(context) {
	const { config, payload = {} } = context;
	return {
		async projectRolePreset() {
			return { ok: true, ...Roles.get(payload.role || payload.name || "viewer") };
		},
		async projectWorkspaceSnapshot() {
			return { ok: true, snapshot: await Snapshot.create(config, payload) };
		},
		async projectForkCreate() {
			return { ok: true, fork: await Fork.create(config, payload) };
		},
		async projectContributionCreate() {
			return { ok: true, contribution: await Contribution.create(config, payload) };
		},
		async projectContributionVerify() {
			return { ok: true, verification: await Contribution.verify(config, payload) };
		},
		async projectContributionAccept() {
			return { ok: true, acceptance: await Contribution.accept(config, payload) };
		},
		async projectSnapshotCompare() {
			return { ok: true, comparison: await Compare.compareSnapshots(config, payload) };
		},
		async projectContributionCompare() {
			return { ok: true, comparison: await Compare.compareContribution(config, payload) };
		},
		async projectPublicationCreate() {
			return { ok: true, publication: await Publication.create(config, payload) };
		},
		async projectCollaborationList() {
			const kind = String(payload.kind || "snapshots");
			return { ok: true, kind, items: await Store.list(config, kind) };
		}
	};
}

module.exports = { buildProjectCollaborationActions };
