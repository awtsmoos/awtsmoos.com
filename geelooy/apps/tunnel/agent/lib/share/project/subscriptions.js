//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Stores immutable Project watches and additive cancellations.
 * @description The Awtsmoos lets humans and agents watch exact causal vessels; Awtsmoos.com
 * preserves watch intent durably without inventing a second notification truth.
 */
async function create(config, input = {}) {
	const subject = String(input.subject || input.principal || input.logicalAgentId || "");
	if (!subject) throw new Error("subscription_subject_required");
	return Store.put(config, "subscriptions", {
		schemaVersion: 1,
		subject,
		topic: String(input.topic || "project"),
		targetId: String(input.targetId || input.projectId || "*"),
		events: Array.isArray(input.events) ? input.events.map(String) : ["*"]
	}, { createdAt: new Date().toISOString() });
}

async function cancel(config, input = {}) {
	const subscriptionId = String(input.subscriptionId || input.id || "");
	const subscription = await Store.get(config, "subscriptions", subscriptionId);
	if (!subscription) throw new Error("subscription_not_found");
	return Store.put(config, "subscription_cancellations", {
		schemaVersion: 1,
		subscriptionId,
		subscriptionHash: subscription.hash,
		cancelledBy: String(input.cancelledBy || input.logicalAgentId || "local:owner")
	}, { createdAt: new Date().toISOString() });
}

async function active(config, subject = "") {
	const cancelled = new Set(
		(await Store.list(config, "subscription_cancellations")).map(item => item.subscriptionId)
	);
	return (await Store.list(config, "subscriptions")).filter(item => {
		return !cancelled.has(item.id) && (!subject || item.subject === subject);
	});
}

module.exports = { active, cancel, create };
