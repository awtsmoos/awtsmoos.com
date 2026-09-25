//B"H // Boruch Hashem // Blessed is He

/**
 * @file Makes website-agent mission completion idempotent with durable receipts.
 * @description The Awtsmoos never lets a repeated completion double-write the room.
 * Awtsmoos.com derives one stable request key per completion, persists a durable receipt
 * after every milestone, and replays the stored receipt when a duplicate arrives — so room
 * messages, website records, and mission terminal events each happen exactly once while the
 * response names every milestone: accepted, event persisted, completion transition persisted,
 * delivery acknowledged.
 */

const MILESTONES = [
	"accepted",
	"eventPersisted",
	"completionTransitionPersisted",
	"deliveryAcknowledged"
];

/**
 * Derives one stable request key for a completion. Prefers explicit idempotency handles,
 * then control/report identities, then a stable mission+kind fallback so even key-less
 * callers cannot double-complete the same mission event.
 */
function deriveRequestKey(input = {}) {
	const explicit = first(
		input.requestKey,
		input.idempotencyKey,
		input.controlRequestId,
		input.control_request_id
	);
	if (explicit) return `completion:${explicit}`;
	const report = first(input.reportId);
	if (report) {
		const sender = first(input.fromAgent, input.agentId, input.sender, "unknown-sender");
		return `completion:report:${report}:${sender}`;
	}
	const mission = first(input.missionId, input.websiteMissionId, input.collaborationMissionId);
	const kind = first(input.kind, input.eventKind, "completion");
	if (mission) return `completion:mission:${mission}:${kind}`;
	return "";
}

function first(...values) {
	for (const value of values) {
		if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
	}
	return "";
}

/**
 * Creates a completion coordinator. Persistence is injected ({loadReceipt, saveReceipt})
 * so the website runner can use its durable store while tests use memory.
 * steps: {persistEvent, transitionCompletion, acknowledgeDelivery} — each async.
 */
function createCompletionCoordinator({ loadReceipt, saveReceipt }) {
	if (typeof loadReceipt !== "function" || typeof saveReceipt !== "function") {
		throw new Error("completion_coordinator_requires_persistence");
	}
	return { complete };

	async function complete(input = {}, steps = {}) {
		const requestKey = deriveRequestKey(input);
		if (!requestKey) {
			return {
				ok: false,
				error: "completion_request_key_required",
				milestones: emptyMilestones(),
				duplicate: false
			};
		}
		const stored = await loadReceipt(requestKey);
		if (stored && stored.complete === true) {
			return {
				ok: true,
				duplicate: true,
				requestKey,
				milestones: { ...emptyMilestones(), ...stored.milestones },
				delivery: stored.delivery || {},
				receipt: stored
			};
		}
		const receipt = stored && typeof stored === "object"
			? { ...stored }
			: { requestKey, missionId: first(input.missionId, input.websiteMissionId), kind: first(input.kind, input.eventKind, "completion"), createdAt: new Date().toISOString() };
		receipt.milestones = { ...emptyMilestones(), ...(receipt.milestones || {}) };
		receipt.milestones.accepted = true;
		receipt.updatedAt = new Date().toISOString();
		await saveReceipt(requestKey, receipt);

		const milestones = receipt.milestones;
		if (!milestones.eventPersisted && typeof steps.persistEvent === "function") {
			receipt.eventRef = await steps.persistEvent(input, receipt);
			milestones.eventPersisted = true;
			receipt.updatedAt = new Date().toISOString();
			await saveReceipt(requestKey, receipt);
		}
		if (!milestones.completionTransitionPersisted && typeof steps.transitionCompletion === "function") {
			receipt.transitionRef = await steps.transitionCompletion(input, receipt);
			milestones.completionTransitionPersisted = true;
			receipt.updatedAt = new Date().toISOString();
			await saveReceipt(requestKey, receipt);
		}
		let delivery = receipt.delivery || {};
		if (!milestones.deliveryAcknowledged && typeof steps.acknowledgeDelivery === "function") {
			delivery = await steps.acknowledgeDelivery(input, receipt) || {};
			receipt.delivery = delivery;
			milestones.deliveryAcknowledged = true;
			receipt.updatedAt = new Date().toISOString();
		}
		receipt.complete = true;
		await saveReceipt(requestKey, receipt);
		return {
			ok: true,
			duplicate: false,
			requestKey,
			milestones: { ...milestones },
			delivery: {
				dashboard: delivery.dashboard || null,
				websiteAgents: delivery.websiteAgents || null
			},
			receipt
		};
	}
}

function emptyMilestones() {
	return {
		accepted: false,
		eventPersisted: false,
		completionTransitionPersisted: false,
		deliveryAcknowledged: false
	};
}

module.exports = {
	MILESTONES,
	createCompletionCoordinator,
	deriveRequestKey,
	emptyMilestones
};
