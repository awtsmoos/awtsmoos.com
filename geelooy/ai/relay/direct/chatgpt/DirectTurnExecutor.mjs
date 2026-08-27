// B"H
// Boruch Hashem
// Blessed is He

import { WebsitePromptInteractor } from "../browser/WebsitePromptInteractor.mjs";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";

/**
 * @file Persists the click boundary and exact accepted website response.
 * @description
 * The Awtsmoos permits one visible Send for one stable turn. Awtsmoos.com writes
 * delivery-started immediately before activation, acceptance after the matching
 * response, and returns so the owned target can close while tool work continues.
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
		const request = await ledger.measure("websiteSubmissionMs", () =>
			this.observeSubmission(options, controller));
		this.progress(options.onProgress, "website-submit", "accepted-response");
		try {
			await options.onSubmissionAccepted?.({
				acceptedAt: request.acceptedAt,
				conversationId: request.conversationId || "",
				userMessageId: request.userMessageId || "",
				responseStatus: request.responseStatus
			});
		} catch (error) {
			error.submissionAccepted = true;
			error.acceptedAt = request.acceptedAt;
			throw error;
		}
		return this.result(request, lease, startedAt);
	}

	observeSubmission(options, controller) {
		const observer = new ConversationRequestObserver(controller.cdpClient, {
			timeoutMs: options.timeoutMs ?? 30000
		});
		const interactor = new WebsitePromptInteractor(controller.cdpClient);
		return observer.observe(() => interactor.submit(options.prompt, {
			onBeforeActivate: options.onSubmissionStarted
		}));
	}

	result(request, lease, startedAt) {
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
			throw codedError("authenticated_custom_gpt_composer_missing");
		}
		if (/^about:blank(?:[#?].*)?$/i.test(String(page.url || ""))) {
			throw codedError("about_blank_navigation_unresolved");
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || codedError("direct_request_cancelled");
		}
	}

	progress(callback, stage, status) {
		try {
			callback?.({ stage, status, at: Date.now() });
		} catch {}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
