// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reports the submit-only browser lane and its verified-close policy without secrets.
 * @description
 * The Awtsmoos reveals queue timing, physical sweeps, and watchdog health while prompts,
 * cookies, target IDs, and upstream conversation identity remain concealed. Diagnostics
 * describe the current runtime contract instead of preserving obsolete detached-session names.
 */
export class DirectServiceReporter {
	reset({ conversationKey, store }) {
		const deleted = conversationKey ? Number(store.delete(conversationKey)) : store.clear();
		return { deleted };
	}

	status(context) {
		const turnQueue = context.turnCoordinator?.status?.() || null;
		const minimumIntervalMs = turnQueue?.minimumIntervalMs ?? 0;
		return {
			ok: true,
			mode: "chatgpt-website",
			websiteOnly: true,
			defaultChatMode: "chatgpt-website",
			preferredDebugPort: context.preferredPort,
			minimumIntervalMs,
			turnQueue,
			physicalTabProtector: context.tabProtector?.status?.() || null,
			tabWatchdog: context.tabWatchdog?.status?.() || null,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "durable-tools-after-submit",
			tabPolicy: tabPolicy(minimumIntervalMs),
			...context.websiteService.status(),
			...context.store.status()
		};
	}
}

function tabPolicy(minimumIntervalMs) {
	if (minimumIntervalMs > 0) {
		return `one-tab-verified-close-then-${minimumIntervalMs}ms-cooldown`;
	}
	return "one-tab-verified-close-no-extra-cooldown";
}
