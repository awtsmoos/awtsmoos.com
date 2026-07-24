//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { CarrierPromptInteractor } from "../browser/CarrierPromptInteractor.mjs";
import { JsonShapeSummarizer } from "./JsonShapeSummarizer.mjs";
import { PrepareSafeDefaults } from "./PrepareSafeDefaults.mjs";

/**
 * One suppressed carrier reveals the normal prepare body's vessel. The Awtsmoos
 * lets Awtsmoos.com inspect safe defaults and structure only; prepare and
 * conversation POSTs are both aborted before reaching the network.
 */
export class PrepareBodyCaptureProbe {
	constructor({ port = 9226, timeoutMs = 30000 } = {}) {
		this.port = port;
		this.timeoutMs = timeoutMs;
		this.summarizer = new JsonShapeSummarizer();
		this.safeDefaults = new PrepareSafeDefaults();
	}

	async run() {
		const controller = await new AuthenticatedSocketController({
			port: this.port,
			replaceChatGptTabs: true
		}).open();
		let conversationRequestSeen = false;
		let resolvePrepare;
		const preparePromise = new Promise(resolve => {
			resolvePrepare = resolve;
		});
		const removeListener = controller.cdpClient.on("Fetch.requestPaused", async event => {
			const pathname = new URL(event.request.url).pathname;
			if (pathname === "/backend-api/f/conversation/prepare") {
				resolvePrepare(await this.capturePrepare(controller.cdpClient, event));
			}
			if (pathname === "/backend-api/f/conversation") {
				conversationRequestSeen = true;
			}
			await this.failRequest(controller.cdpClient, event.requestId);
		});

		try {
			await controller.cdpClient.send("Fetch.enable", {
				patterns: [{
					urlPattern: "https://chatgpt.com/backend-api/f/conversation*",
					requestStage: "Request"
				}]
			});
			await new CarrierPromptInteractor(controller.cdpClient).submit(
				"Reveal only the suppressed prepare request vessel.",
				1
			);
			const capture = await Promise.race([
				preparePromise,
				this.delay(this.timeoutMs).then(() => null)
			]);
			if (!capture) {
				throw new Error("No suppressed conversation prepare request was observed.");
			}
			await this.delay(1200);
			return {
				requestOnlyGoal: true,
				discoveryUsedComposer: true,
				prepareRequestAborted: true,
				conversationRequestSeen,
				conversationRequestAborted: conversationRequestSeen,
				prepare: capture
			};
		} finally {
			removeListener();
			await controller.cdpClient.send("Fetch.disable").catch(() => {});
			await controller.close();
		}
	}

	async capturePrepare(cdpClient, event) {
		const postData = await this.readPostData(cdpClient, event);
		let parsed = null;
		try {
			parsed = JSON.parse(postData);
		} catch {}
		return {
			method: event.request.method,
			pathname: new URL(event.request.url).pathname,
			headerNames: Object.keys(event.request.headers ?? {}).sort(),
			postDataLength: postData.length,
			bodyEncoding: parsed === null ? "unknown" : "json",
			bodyShape: parsed === null ? null : this.summarizer.summarize(parsed),
			safeDefaults: parsed === null ? null : this.safeDefaults.extract(parsed)
		};
	}

	async readPostData(cdpClient, event) {
		if (event.request.postData) return event.request.postData;
		if (!event.networkId) return "";
		const response = await cdpClient.send("Network.getRequestPostData", {
			requestId: event.networkId
		}).catch(() => null);
		return response?.postData ?? "";
	}

	async failRequest(cdpClient, requestId) {
		await cdpClient.send("Fetch.failRequest", {
			requestId,
			errorReason: "Aborted"
		}).catch(() => {});
	}

	delay(durationMs) {
		return new Promise(resolve => setTimeout(resolve, durationMs));
	}
}
