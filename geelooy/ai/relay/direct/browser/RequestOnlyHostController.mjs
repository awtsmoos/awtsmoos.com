//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "./AuthenticatedSocketController.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { PageStateInspector } from "./PageStateInspector.mjs";

/**
 * A non-composer settings route owns transient application headers for official
 * same-origin requests. The Awtsmoos lets Awtsmoos.com avoid composer controls,
 * socket shims, message reads, and unrelated user tabs during capability truth.
 */
export class RequestOnlyHostController extends AuthenticatedSocketController {
	constructor({
		port = 9226,
		route = "/settings",
		replaceChatGptTabs = false,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		super({ port, replaceChatGptTabs, sleep });
		this.route = route;
	}

	async open(timeoutMs = 30000) {
		if (this.replaceChatGptTabs) {
			await this.closeChatGptTargets();
		}
		const target = await this.createTarget();
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		let applicationHeaders = null;
		let removeListener = () => {};
		try {
			await cdpClient.connect();
			removeListener = cdpClient.on("Network.requestWillBeSent", event => {
				if (applicationHeaders) {
					return;
				}
				const headers = event.request?.headers ?? {};
				if (headers["OAI-Client-Build-Number"] && headers["OAI-Client-Version"]) {
					applicationHeaders = { ...headers };
				}
			});
			await cdpClient.send("Network.enable");
			await cdpClient.send("Page.enable");
			await cdpClient.send("Page.navigate", {
				url: new URL(this.route, "https://chatgpt.com").href
			});
			const inspector = new PageStateInspector(cdpClient);
			const pageState = await this.waitForHost({
				inspector,
				timeoutMs,
				readHeaders: () => applicationHeaders
			});
			return {
				cdpClient,
				inspector,
				pageState,
				applicationHeaders: this.selectHeaders(applicationHeaders),
				targetId: target.id,
				close: () => this.close(target.id, cdpClient)
			};
		} catch (error) {
			await this.close(target.id, cdpClient);
			throw error;
		} finally {
			removeListener();
		}
	}

	async waitForHost({ inspector, timeoutMs, readHeaders }) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const pageState = await inspector.inspect();
			if (pageState.authenticated && readHeaders()) {
				return pageState;
			}
			await this.sleep(250);
		}
		throw new Error("Request-only host did not expose authentication and headers.");
	}

	selectHeaders(headers) {
		const allowed = [
			"Authorization",
			"ChatGPT-Account-ID",
			"OAI-Client-Build-Number",
			"OAI-Client-Version",
			"OAI-Device-Id",
			"OAI-Language",
			"OAI-Session-Id",
			"X-OAI-IS-Client-Observation"
		];
		return Object.fromEntries(allowed
			.filter(name => headers?.[name] !== undefined)
			.map(name => [name, headers[name]]));
	}
}
