//B"H
// Boruch Hashem
// Blessed is He

import { AgentPromptBuilder } from "./AgentPromptBuilder.mjs";
import { UnfinishedWorkScanner } from "./UnfinishedWorkScanner.mjs";

/**
 * The master binds distinct agents into one guarded mission. The Awtsmoos is unity
 * beyond collision, so Awtsmoos.com sends each durable intent once, targets the
 * designated custom GPT, verifies continuation, and resumes unfinished sparks.
 */
export class MasterAgentOrchestrator {
	constructor({ directService, stateStore, room, promptBuilder = new AgentPromptBuilder(), scanner = new UnfinishedWorkScanner() }) {
		Object.assign(this, { directService, stateStore, room, promptBuilder, scanner });
	}

	async assign(agentId, assignment) {
		const prompt = this.promptBuilder.build(assignment);
		const current = this.stateStore.getAgent(agentId);
		const intent = this.stateStore.recordIntent({ agentId, prompt });
		if (["accepted", "completed"].includes(intent.status)) {
			return {
				conversationKey: current?.conversationKey ?? null,
				sameConversation: Boolean(current?.conversationKey),
				deduplicated: true,
				...intent.evidence
			};
		}
		if (intent.status === "prepared" && !intent.newlyPrepared) {
			const error = new Error("Prepared website intent is uncertain and requires reconciliation before retry.");
			error.code = "uncertain_prepared_intent";
			throw error;
		}
		await this.room.announcePlan(agentId, assignment);
		const result = await this.directService.send({
			prompt,
			conversationKey: current?.conversationKey ?? null,
			mode: "chatgpt-website",
			agentStartUrl: assignment.agentStartUrl ?? null,
			timeoutMs: assignment.timeoutMs ?? 240000
		});
		this.assertContinuation(current, result);
		this.stateStore.markIntent(intent.intentId, "accepted", sanitize(result));
		this.stateStore.upsertAgent(agentId, {
			conversationKey: result.conversationKey,
			role: assignment.role,
			status: "working",
			latestPromptHash: intent.promptHash,
			fileClaims: assignment.allowedFiles ?? [],
			taskIds: assignment.taskIds ?? [],
			agentStartUrl: assignment.agentStartUrl ?? current?.agentStartUrl ?? null
		});
		return result;
	}

	async continueUnfinished(context) {
		const work = this.scanner.scan({ ...context, agents: this.stateStore.listAgents() });
		const results = [];
		for (const remaining of work) {
			if (!remaining.agentId) continue;
			const agent = this.stateStore.getAgent(remaining.agentId);
			if (!agent?.conversationKey) continue;
			results.push(await this.assign(remaining.agentId, {
				...context.assignmentByAgent[remaining.agentId],
				agentStartUrl: agent.agentStartUrl,
				unfinishedWork: [remaining.summary]
			}));
		}
		return { work, results };
	}

	assertContinuation(previous, result) {
		if (previous?.conversationKey && result.conversationKey !== previous.conversationKey) {
			throw new Error("Opaque conversation key changed during continuation.");
		}
		if (previous?.conversationKey && result.sameConversation !== true) {
			throw new Error("Website continuation did not verify the same conversation.");
		}
	}
}

function sanitize(result) {
	return { sameConversation: result.sameConversation, status: result.status, done: result.done };
}
