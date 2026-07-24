//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "./AuthenticatedSocketController.mjs";

/**
 * Older callers may still import WebSocketTargetBroker. The Awtsmoos renews the
 * vessel without breaking its name: awtsmoos.com delegates to the verified
 * app-owned socket controller and never clones a short-lived verification URL.
 */
export class WebSocketTargetBroker extends AuthenticatedSocketController {
	constructor(port = 9226) {
		super({
			port,
			replaceChatGptTabs: true
		});
	}
}
