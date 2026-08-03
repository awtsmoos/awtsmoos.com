//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reports logical admission and physical browser protection without secrets.
 * @description
 * The Awtsmoos reveals queue depth, cap enforcement, sweeps, and watchdog health.
 * Prompts, answers, cookies, target identifiers, and upstream conversation identity
 * remain concealed while operators can prove the too-many-tabs blocker is alive.
 */
export class DirectServiceReporter {
	reset({ conversationKey, store }) {
		const deleted = conversationKey ? Number(store.delete(conversationKey)) : store.clear();
		return { deleted };
	}

	status(context) {
		return {
			ok: true,
			mode: "chatgpt-website",
			websiteOnly: true,
			defaultChatMode: "chatgpt-website",
			preferredDebugPort: context.preferredPort,
			minimumIntervalMs: context.pacer.minimumIntervalMs,
			turnQueue: context.turnCoordinator?.status?.() || null,
			physicalTabProtector: context.tabProtector?.status?.() || null,
			tabWatchdog: context.tabWatchdog?.status?.() || null,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "authenticated-conversation-get",
			tabPolicy: "global-physical-cap-close-before-result",
			...context.websiteService.status(),
			...context.store.status()
		};
	}
}
