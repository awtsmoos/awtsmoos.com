// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reports the strict one-tab submit-only website-agent contract.
 * @description
 * The Awtsmoos reveals delivery, closure, pacing, and browser health without
 * suggesting that model output was awaited. Progress and completion arrive later
 * through the agent's filesystem and tunnel actions, outside the vanished tab.
 */
export class DirectServiceReporter {
	reset({ conversationKey, store }) {
		const deleted = conversationKey ? Number(store.delete(conversationKey)) : store.clear();
		return { deleted };
	}

	status(context) {
		const turnQueue = context.turnCoordinator?.status?.() || null;
		return {
			ok: true,
			mode: "chatgpt-website",
			websiteOnly: true,
			defaultChatMode: "chatgpt-website",
			preferredDebugPort: context.preferredPort,
			minimumIntervalMs: turnQueue?.minimumIntervalMs ?? 18000,
			turnQueue,
			physicalTabProtector: context.tabProtector?.status?.() || null,
			tabWatchdog: context.tabWatchdog?.status?.() || null,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "none-agent-continues-through-tunnel",
			resultContract: "prompt-dispatch-receipt",
			waitsForAnswer: false,
			tabPolicy: "one-tab-submit-close-then-18-second-cooldown",
			...context.websiteService.status(),
			...context.store.status()
		};
	}
}
