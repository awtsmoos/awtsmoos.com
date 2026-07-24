//B"H
// Boruch Hashem
// Blessed is He

import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { RequestOnlyHostController } from "../browser/RequestOnlyHostController.mjs";
import { RequestOnlyPrepareClient } from "./RequestOnlyPrepareClient.mjs";
import { RequestOnlySentinelPrepareClient } from "./RequestOnlySentinelPrepareClient.mjs";
import { RequestOnlySentinelSdkClient } from "./RequestOnlySentinelSdkClient.mjs";

/**
 * The Awtsmoos reveals every request-only vessel before the enforcement gate.
 * Awtsmoos.com reports only safe capability truth: no conduit, Sentinel, account,
 * session, proof, challenge, socket-verification, or upstream identity value.
 */
export class RequestOnlyCapabilityService {
	constructor({ preferredPort, portResolver } = {}) {
		this.preferredPort = preferredPort;
		this.portResolver = portResolver ?? new DebugPortResolver({ preferredPort });
	}

	async inspect() {
		const port = await this.portResolver.resolve();
		const host = await new RequestOnlyHostController({ port }).open();
		try {
			const conversationPrepare = await new RequestOnlyPrepareClient(
				host.cdpClient
			).prepare({ applicationHeaders: host.applicationHeaders });
			const sentinelPrepare = await new RequestOnlySentinelPrepareClient(
				host.cdpClient
			).prepare({ applicationHeaders: host.applicationHeaders });
			const sentinelSdk = await new RequestOnlySentinelSdkClient(
				host.cdpClient
			).createToken();
			const enforcementRequired = sentinelPrepare.turnstileRequired
				|| sentinelPrepare.proofOfWorkRequired
				|| sentinelPrepare.sessionObserverRequired;

			return {
				ok: true,
				mode: "strict-request-only",
				debugPort: port,
				hostRoute: host.pageState.url,
				authenticated: host.pageState.authenticated,
				topicSocketOpen: true,
				composerTouched: false,
				conversationPostSent: false,
				conversationPrepare: {
					ready: conversationPrepare.status === 200,
					hasConduitToken: true
				},
				sentinelPrepare: {
					ready: sentinelPrepare.status === 200,
					turnstileRequired: sentinelPrepare.turnstileRequired,
					proofOfWorkRequired: sentinelPrepare.proofOfWorkRequired,
					sessionObserverRequired: sentinelPrepare.sessionObserverRequired,
					forceLogin: sentinelPrepare.forceLogin
				},
				sentinelSdk: {
					ready: typeof sentinelSdk.token === "string",
					hasInit: sentinelSdk.hasInit,
					hasToken: sentinelSdk.hasToken,
					hasTiming: sentinelSdk.hasTiming
				},
				enforcementRequired,
				strictChatReady: !enforcementRequired,
				fallbackRequired: enforcementRequired,
				fallbackMode: "page-authorized-fallback"
			};
		} finally {
			await host.close();
		}
	}
}
