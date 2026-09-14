//B"H
//Boruch Hashem
//Blessed be He

import { WebsitePromptInteractor } from "../browser/WebsitePromptInteractor.mjs";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";
import { DirectTurnRouteGate } from "./DirectTurnRouteGate.mjs";

/**
 * @file Owns one physical Send until ChatGPT proves the saved account conversation route.
 * @description
 * The Awtsmoos distinguishes an accepted HTTP response from a created conversation.
 * Awtsmoos.com keeps the exact tab alive until /c/<uuid> appears, then seals success.
 */
export class DirectTurnExecutor {
	constructor({ routeGate = new DirectTurnRouteGate() } = {}) {
		this.routeGate = routeGate;
	}

	async execute(options, controller, lease, ledger) {
		ledger.record("hostOpenMs", lease.acquireMs);
		this.assertNotAborted(options.signal);
		this.progress(options.onProgress, "host", lease.source);
		this.progress(options.onProgress, "composer", "verifying");
		const page = await ledger.measure("composerVerificationMs", () => controller.inspector.inspect());
		this.assertReady(page);
		this.progress(options.onProgress, "composer", "ready");
		const startedAt = Date.now();
		const request = await ledger.measure("websiteSubmissionMs", () => this.observe(options, controller));
		this.progress(options.onProgress, "website-submit", "accepted-response", {
			acceptedAt: request.acceptedAt
		});
		const route = await this.routeGate.verify(options, controller, request);
		this.progress(options.onProgress, "conversation-route", "verified", {
			acceptedAt: request.acceptedAt,
			...route
		});
		await this.routeGate.persist(options, request, route);
		this.progress(options.onProgress, "website-submit", "accepted", {
			acceptedAt: request.acceptedAt,
			...route
		});
		return this.result(request, route, lease, startedAt);
	}

	observe(options, controller) {
		const observer = new ConversationRequestObserver(controller.cdpClient, {
			timeoutMs: options.timeoutMs ?? 30000
		});
		const interactor = new WebsitePromptInteractor(controller.cdpClient);
		return observer.observe(() => interactor.submit(options.prompt, {
			onBeforeActivate: async receipt => {
				this.progress(options.onProgress, "website-submit", "send-activation-started");
				return options.onSubmissionStarted?.(receipt);
			}
		}));
	}

	result(request, route, lease, startedAt) {
		return {
			submission: {
				conversationId: route.conversationId,
				conversationUrl: route.conversationUrl,
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
		if (!page?.authenticated || !page?.composerVisible) throw codedError("authenticated_custom_gpt_composer_missing");
		if (/^about:blank(?:[#?].*)?$/i.test(String(page.url || ""))) throw codedError("about_blank_navigation_unresolved");
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || codedError("direct_request_cancelled");
	}

	progress(callback, stage, status, detail = {}) {
		try { callback?.({ stage, status, at: Date.now(), ...detail }); } catch {}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
