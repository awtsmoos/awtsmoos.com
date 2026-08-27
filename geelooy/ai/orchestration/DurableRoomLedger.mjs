//B"H
// Boruch Hashem
// Blessed is He

import { AtomicJsonStore } from "./AtomicJsonStore.mjs";

/**
 * One room gathers many Shluchim beneath the light the Awtsmoos renews each beat.
 * Awtsmoos.com preserves plans, messages, claims, and recovery in a private seat;
 * when one vessel grows stale, its work returns to the master complete and sweet.
 */
export class DurableRoomLedger {
	constructor({ storagePath, clock = () => Date.now(), staleAfterMs = 120000 }) {
		this.clock = clock;
		this.staleAfterMs = staleAfterMs;
		this.store = new AtomicJsonStore({
			storagePath,
			defaultValue: { schemaVersion: 1, agents: {}, messages: [], claims: {} }
		});
	}

	join(agentId, role) {
		const state = this.store.read();
		state.agents[agentId] = {
			...(state.agents[agentId] ?? {}),
			agentId,
			role,
			status: "active",
			heartbeatAt: this.clock()
		};
		this.store.write(state);
		return state.agents[agentId];
	}

	announcePlan(agentId, assignment) {
		return this.message(agentId, "plan", {
			role: assignment.role,
			taskIds: assignment.taskIds ?? [],
			allowedFiles: assignment.allowedFiles ?? []
		});
	}

	message(agentId, kind, payload) {
		const state = this.store.read();
		const entry = {
			messageId: `${agentId}:${kind}:${this.clock()}:${state.messages.length}`,
			agentId,
			kind,
			payload,
			createdAt: this.clock()
		};
		state.messages.push(entry);
		this.store.write(state);
		return entry;
	}

	claim(agentId, taskId, files = []) {
		const state = this.store.read();
		const existing = state.claims[taskId];
		if (existing && existing.agentId !== agentId && existing.status === "active") {
			throw new Error(`Task already claimed: ${taskId}`);
		}
		state.claims[taskId] = {
			taskId,
			agentId,
			files,
			status: "active",
			claimedAt: this.clock(),
			heartbeatAt: this.clock()
		};
		this.store.write(state);
		return state.claims[taskId];
	}

	heartbeat(agentId) {
		const state = this.store.read();
		if (!state.agents[agentId]) throw new Error(`Unknown room agent: ${agentId}`);
		state.agents[agentId].heartbeatAt = this.clock();
		for (const claim of Object.values(state.claims)) {
			if (claim.agentId === agentId && claim.status === "active") claim.heartbeatAt = this.clock();
		}
		this.store.write(state);
		return state.agents[agentId];
	}

	release(agentId, taskId, evidence = {}) {
		const state = this.store.read();
		const claim = state.claims[taskId];
		if (!claim || claim.agentId !== agentId) throw new Error(`Claim owner mismatch: ${taskId}`);
		state.claims[taskId] = {
			...claim,
			status: "released",
			evidence,
			releasedAt: this.clock()
		};
		this.store.write(state);
		return state.claims[taskId];
	}

	recoverStale() {
		const state = this.store.read();
		const now = this.clock();
		const recovered = [];
		for (const claim of Object.values(state.claims)) {
			if (claim.status !== "active") continue;
			if (now - claim.heartbeatAt <= this.staleAfterMs) continue;
			claim.status = "recovery_required";
			claim.recoveredAt = now;
			recovered.push({ ...claim });
		}
		this.store.write(state);
		return recovered;
	}

	snapshot() {
		return this.store.read();
	}
}
