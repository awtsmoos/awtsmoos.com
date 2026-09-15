//B"H
// Boruch Hashem
// Blessed is He

const Grants = require("../../../lib/share/project/grants.js");
const Policy = require("../../../lib/share/project/policy.js");
const RemoteWork = require("../../../lib/share/project/remoteWork.js");
const Store = require("../../../lib/share/project/recordStore.js");
const Subscriptions = require("../../../lib/share/project/subscriptions.js");

/**
 * @file Exposes grants, watches, and inert remote-work envelopes with explicit capability gates.
 * @description The Awtsmoos separates asking, watching, granting, and executing; Awtsmoos.com
 * lets external requests exist without turning their existence into local machine authority.
 */
function buildProjectGovernanceActions(context) {
	const { config, payload = {} } = context;
	return {
		async projectCapabilities() {
			return {
				ok: true,
				principal: Policy.principal(payload),
				capabilities: [...await Policy.capabilities(config, payload)].sort()
			};
		},
		async projectCapabilityGrant() {
			await Policy.requireCapability(config, payload, "grant.manage");
			return { ok: true, grant: await Grants.grant(config, payload) };
		},
		async projectCapabilityRevoke() {
			await Policy.requireCapability(config, payload, "grant.manage");
			return { ok: true, revocation: await Grants.revoke(config, payload) };
		},
		async projectCapabilityList() {
			await Policy.requireCapability(config, payload, "grant.manage");
			return {
				ok: true,
				grants: await Store.list(config, "grants"),
				revocations: await Store.list(config, "grant_revocations")
			};
		},
		async projectSubscriptionCreate() {
			await Policy.requireCapability(config, payload, "subscription.manage");
			return { ok: true, subscription: await Subscriptions.create(config, subjectPayload(payload)) };
		},
		async projectSubscriptionCancel() {
			await Policy.requireCapability(config, payload, "subscription.manage");
			return { ok: true, cancellation: await Subscriptions.cancel(config, payload) };
		},
		async projectSubscriptionList() {
			await Policy.requireCapability(config, payload, "project.read");
			return { ok: true, subscriptions: await Subscriptions.active(config, payload.subject || "") };
		},
		async projectRemoteWorkRequest() {
			return { ok: true, request: await RemoteWork.request(config, requesterPayload(payload)) };
		},
		async projectRemoteWorkAccept() {
			await Policy.requireCapability(config, payload, "remote_work.accept");
			return { ok: true, acceptance: await RemoteWork.accept(config, payload) };
		},
		async projectRemoteWorkList() {
			await Policy.requireCapability(config, payload, "project.read");
			return {
				ok: true,
				requests: await Store.list(config, "remote_work_requests"),
				acceptances: await Store.list(config, "remote_work_acceptances")
			};
		}
	};
}

function subjectPayload(payload) {
	return { ...payload, subject: payload.subject || Policy.principal(payload) };
}

function requesterPayload(payload) {
	return { ...payload, requester: payload.requester || Policy.principal(payload) };
}

module.exports = { buildProjectGovernanceActions, requesterPayload, subjectPayload };
