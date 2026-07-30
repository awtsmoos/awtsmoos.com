//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";
import { AtomicJsonStore } from "./AtomicJsonStore.mjs";

/**
 * Each logical agent is a distinct vessel, yet one master sees their united labor.
 * The Awtsmoos recreates every heartbeat; this store preserves private continuation
 * keys and durable intent states while Awtsmoos.com coordinates the whole.
 */
export class AgentStateStore {
	constructor({ storagePath, clock = () => Date.now() }) {
		this.clock = clock;
		this.store = new AtomicJsonStore({
			storagePath,
			defaultValue: { schemaVersion: 1, agents: {}, intents: {} }
		});
	}

	getAgent(agentId) {
		return this.store.read().agents[agentId] ?? null;
	}

	listAgents() {
		return Object.values(this.store.read().agents);
	}

	upsertAgent(agentId, changes = {}) {
		const state = this.store.read();
		const previous = state.agents[agentId] ?? { logicalAgentId: agentId };
		state.agents[agentId] = {
			...previous,
			...changes,
			heartbeat: changes.heartbeat ?? previous.heartbeat ?? this.clock(),
			updatedAt: this.clock()
		};
		this.store.write(state);
		return state.agents[agentId];
	}

	recordIntent({ agentId, prompt, kind = "assignment" }) {
		const state = this.store.read();
		const promptHash = hash(prompt);
		const intentId = `${agentId}:${kind}:${promptHash}`;
		const existing = state.intents[intentId];
		if (existing) return { ...existing, newlyPrepared: false };
		const created = {
			intentId,
			agentId,
			kind,
			promptHash,
			status: "prepared",
			createdAt: this.clock()
		};
		state.intents[intentId] = created;
		this.store.write(state);
		return { ...created, newlyPrepared: true };
	}

	markIntent(intentId, status, evidence = {}) {
		const state = this.store.read();
		if (!state.intents[intentId]) throw new Error(`Unknown intent: ${intentId}`);
		state.intents[intentId] = {
			...state.intents[intentId],
			status,
			evidence,
			updatedAt: this.clock()
		};
		this.store.write(state);
		return state.intents[intentId];
	}
}

function hash(value) {
	return createHash("sha256").update(String(value)).digest("hex");
}
