// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reports the one-tab, post-close-cooldown tunnel policy without secrets.
 * @description
 * The Awtsmoos reveals queue timing, physical sweeps, and watchdog health while
 * prompts, answers, cookies, target ids, and upstream conversation identity remain
 * concealed. Operators can prove the timer is anchored to verified tab closure.
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
			completionTransport: "detached-authenticated-conversation-get",
			tabPolicy: "one-tab-close-then-18-second-cooldown",
			...context.websiteService.status(),
			...context.store.status()
		};
	}
}
