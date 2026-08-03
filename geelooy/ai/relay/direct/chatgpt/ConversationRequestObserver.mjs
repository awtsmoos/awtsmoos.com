// B"H
// Boruch Hashem
// Blessed is He

import { ConversationPostDescription } from "./ConversationPostDescription.mjs";

/**
 * @file Verifies the exact website conversation POST reached an accepted response.
 * @description
 * The Awtsmoos witnesses both the ordinary Send request and its HTTP acceptance.
 * A late UI error cannot repeat an already observed POST; Awtsmoos.com continues
 * waiting for that request's response and closes only after accepted testimony.
 */
export class ConversationRequestObserver {
	constructor(cdpClient, options = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = Math.max(5000, Number(options.timeoutMs || 30000));
		this.description = options.description || new ConversationPostDescription(cdpClient);
	}

	async observe(trigger) {
		await this.cdpClient.send("Network.enable");
		let claimedId = null;
		let description = null;
		let response = null;
		let settled = false;
		let timer = null;
		let resolveObserved = null;
		let rejectObserved = null;
		const observed = new Promise((resolve, reject) => {
			resolveObserved = resolve;
			rejectObserved = reject;
		});
		const settle = (callback, value) => {
			if (settled) return;
			settled = true;
			callback(value);
		};
		const maybeFinish = () => {
			if (!description || !response) return;
			if (response.status < 200 || response.status >= 400) {
				settle(rejectObserved, codedError(`conversation_post_${response.status}`));
				return;
			}
			settle(resolveObserved, {
				...description,
				responseStatus: response.status,
				responseUrl: response.url,
				acceptedAt: Date.now()
			});
		};
		const removeRequest = this.cdpClient.on("Network.requestWillBeSent", event => {
			if (claimedId || !this.description.matches(event.request)) return;
			claimedId = event.requestId;
			this.description.read(event).then(value => {
				description = value;
				maybeFinish();
			}, error => settle(rejectObserved, error));
		});
		const removeResponse = this.cdpClient.on("Network.responseReceived", event => {
			if (!claimedId || event.requestId !== claimedId) return;
			response = {
				status: Number(event.response?.status || 0),
				url: event.response?.url || ""
			};
			maybeFinish();
		});
		try {
			let triggerError = null;
			try {
				await trigger();
			} catch (error) {
				triggerError = error;
			}
			if (triggerError && !claimedId) throw triggerError;
			timer = setTimeout(() => settle(
				rejectObserved,
				codedError("conversation_post_acceptance_timeout")
			), this.timeoutMs);
			return await observed;
		} finally {
			clearTimeout(timer);
			removeRequest();
			removeResponse();
		}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
