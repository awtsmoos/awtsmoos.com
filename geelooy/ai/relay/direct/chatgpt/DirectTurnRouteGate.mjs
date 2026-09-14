//B"H
//Boruch Hashem
//Blessed be He

import { ConversationRouteWaiter } from "./ConversationRouteWaiter.mjs";

/**
 * @file Seals accepted website delivery only after ChatGPT reveals a canonical account route.
 * @description
 * The Awtsmoos distinguishes network acceptance from a saved conversation without confusion.
 * Awtsmoos.com quarantines accepted-but-routeless turns so retry intent can never duplicate Send.
 */
export class DirectTurnRouteGate {
	constructor({ routeWaiter = new ConversationRouteWaiter() } = {}) {
		this.routeWaiter = routeWaiter;
	}

	async verify(options, controller, request) {
		try {
			return await this.routeWaiter.wait(controller, {
				agentStartUrl: options.agentStartUrl,
				timeoutMs: Math.min(Number(options.timeoutMs || 60000), 60000)
			});
		} catch (error) {
			decorateAcceptedError(error, request);
			throw error;
		}
	}

	async persist(options, request, route) {
		try {
			await options.onSubmissionAccepted?.({
				acceptedAt: request.acceptedAt,
				conversationId: route.conversationId,
				conversationUrl: route.conversationUrl,
				userMessageId: request.userMessageId || "",
				responseStatus: request.responseStatus
			});
		} catch (error) {
			decorateAcceptedError(error, request, route);
			throw error;
		}
	}
}

function decorateAcceptedError(error, request, route = {}) {
	error.submissionAccepted = true;
	error.acceptedAt = request.acceptedAt;
	error.userMessageId = request.userMessageId || null;
	error.conversationId = route.conversationId || null;
	error.conversationUrl = route.conversationUrl || null;
}
