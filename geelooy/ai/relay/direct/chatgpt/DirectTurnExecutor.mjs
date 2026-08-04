// B"H
// Boruch Hashem
// Blessed is He

import { WebsitePromptInteractor } from "../browser/WebsitePromptInteractor.mjs";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";

/**
 * @file Submits one prompt and stops at verified website acceptance.
 * @description
 * The Awtsmoos entrusts the custom GPT with work beyond the browser's brief life.
 * Awtsmoos.com witnesses the ordinary POST and its accepted response, records only
 * bounded identity evidence, and returns so the exact owned tab can close at once.
 */
export class DirectTurnExecutor {
	async execute(options, controller, lease, ledger) {
		ledger.record("hostOpenMs", lease.acquireMs);
		this.assertNotAborted(options.signal);
		this.progress(options.onProgress, "host", lease.source);
		const page = await ledger.measure("composerVerificationMs", () =>
			controller.inspector.inspect());
		this.assertReady(page);
		const startedAt = Date.now();
		const request = await ledger.measure("websiteSubmissionMs", () => {
			const observer = new ConversationRequestObserver(controller.cdpClient, {
				timeoutMs: options.timeoutMs ?? 30000
			});
			const interactor = new WebsitePromptInteractor(controller.cdpClient);
			return observer.observe(() => interactor.submit(options.prompt));
		});
		this.progress(options.onProgress, "website-submit", "accepted-response");
		return {
			submission: {
				conversationId: request.conversationId || null,
				userMessageId: request.userMessageId,
				acceptedAt: request.acceptedAt
			},
			responseStatus: request.responseStatus,
			requestLatencyMs: Date.now() - startedAt,
			hostReuseSource: lease.source,
			composerTouched: true,
			promptVerified: true,
			dispatched: true,
			submissionTransport: "chatgpt-website-composer"
		};
	}

	assertReady(page) {
		if (!page?.authenticated || !page?.composerVisible) {
			const error = new Error("authenticated_custom_gpt_composer_missing");
			error.code = "authenticated_custom_gpt_composer_missing";
			throw error;
		}
		if (/^about:blank(?:[#?].*)?$/i.test(String(page.url || ""))) {
			const error = new Error("about_blank_navigation_unresolved");
			error.code = "about_blank_navigation_unresolved";
			throw error;
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Direct request was cancelled.");
		}
	}

	progress(callback, stage, status) {
		try { callback?.({ stage, status, at: Date.now() }); }
		catch {}
	}
}
