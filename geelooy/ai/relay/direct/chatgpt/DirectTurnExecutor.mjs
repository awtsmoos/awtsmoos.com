// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { WebsitePromptInteractor } from "../browser/WebsitePromptInteractor.mjs";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";
import { ConversationRouteWaiter } from "./ConversationRouteWaiter.mjs";
import { DetachedConversationSession } from "./DetachedConversationSession.mjs";
import { WebsiteConversationNavigator } from "./WebsiteConversationNavigator.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Submits exactly one visible prompt and captures a tabless continuation.
 * @description
 * The Awtsmoos permits one ordinary Send. Awtsmoos.com waits for the accepted POST,
 * records the conversation route and private GET session, then returns immediately
 * so the exact owned target can be closed before any answer polling begins.
 */
export class DirectTurnExecutor {
	constructor(options = {}) {
		this.navigator = options.navigator || new WebsiteConversationNavigator();
		this.routeWaiter = options.routeWaiter || new ConversationRouteWaiter();
		this.sessionCapture = options.sessionCapture || new DetachedConversationSession();
	}

	async execute(options, controller, lease, ledger) {
		const agentStartUrl = options.agentStartUrl ?? configuredAgentStartUrl();
		ledger.record("hostOpenMs", lease.acquireMs);
		this.assertNotAborted(options.signal);
		this.progress(options.onProgress, "host", lease.source);
		await ledger.measure("conversationNavigationMs", () =>
			this.navigator.prepare(controller, options.state, agentStartUrl));
		const startedAt = Date.now();
		const request = await ledger.measure("websiteSubmissionMs", () => {
			const observer = new ConversationRequestObserver(controller.cdpClient);
			const interactor = new WebsitePromptInteractor(controller.cdpClient);
			return observer.observe(() => interactor.submit(options.prompt));
		});
		this.progress(options.onProgress, "website-submit", "accepted-response");
		try {
			const conversationId = await ledger.measure("conversationRouteMs", () =>
				this.routeWaiter.wait(controller, {
					expectedId: request.conversationId || options.state?.conversationId || null,
					agentStartUrl,
					timeoutMs: options.timeoutMs ?? 30000
				}));
			const session = await ledger.measure("detachedSessionCaptureMs", () =>
				this.sessionCapture.capture(controller.cdpClient, request));
			return {
				submission: {
					conversationId,
					userMessageId: request.userMessageId,
					previousParentMessageId: options.state?.parentMessageId ?? null,
					session,
					acceptedAt: request.acceptedAt
				},
				responseStatus: request.responseStatus,
				requestLatencyMs: Date.now() - startedAt,
				hostReuseSource: lease.source,
				composerTouched: true,
				submissionTransport: "chatgpt-website-composer"
			};
		} catch (error) {
			error.submissionAccepted = true;
			error.acceptedAt = request.acceptedAt;
			throw error;
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || new Error("Direct request was cancelled.");
	}

	progress(callback, stage, status) {
		try { callback?.({ stage, status, at: Date.now() }); }
		catch {}
	}
}
