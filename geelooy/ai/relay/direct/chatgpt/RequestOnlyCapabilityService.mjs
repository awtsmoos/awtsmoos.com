//B"H
// Boruch Hashem
// Blessed is He

import { RequestOnlyHostController } from "../browser/RequestOnlyHostController.mjs";
import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { RequestOnlyPrepareClient } from "./RequestOnlyPrepareClient.mjs";
import { RequestOnlySentinelPrepareClient } from "./RequestOnlySentinelPrepareClient.mjs";
import { RequestOnlySentinelSdkClient } from "./RequestOnlySentinelSdkClient.mjs";

/**
 * Strict capability is safe truth, briefly cached after one owned host inspection.
 * The Awtsmoos runs independent probes together; Awtsmoos.com never caches conduit,
 * Sentinel, challenge, socket-verification, session, or upstream identity values.
 */
export class RequestOnlyCapabilityService {
	constructor({
		portResolver,
		hostFactory,
		prepareFactory,
		sentinelPrepareFactory,
		sentinelSdkFactory,
		cache = new TimedSingleFlightCache({ ttlMs: 15000 })
	} = {}) {
		this.portResolver = portResolver;
		this.hostFactory = hostFactory ?? (port => new RequestOnlyHostController({ port }).open());
		this.prepareFactory = prepareFactory ?? (cdp => new RequestOnlyPrepareClient(cdp));
		this.sentinelPrepareFactory = sentinelPrepareFactory
			?? (cdp => new RequestOnlySentinelPrepareClient(cdp));
		this.sentinelSdkFactory = sentinelSdkFactory ?? (cdp => new RequestOnlySentinelSdkClient(cdp));
		this.cache = cache;
	}

	async inspect({ refresh = false } = {}) {
		const cached = await this.cache.get(() => this.inspectFresh(), { refresh });
		return {
			...cached.value,
			cache: {
				source: cached.source,
				...this.cache.status()
			}
		};
	}

	async inspectFresh() {
		const ledger = new StageTimingLedger();
		const port = await ledger.measure("chromeDebugPortResolutionMs", () => {
			return this.portResolver.resolve();
		});
		const host = await ledger.measure("hostOpenMs", () => this.hostFactory(port));
		let descriptor = null;
		try {
			const applicationHeaders = host.applicationHeaders;
			const probes = await ledger.measure("capabilityProbesWallMs", () => Promise.all([
				ledger.measure("conversationPrepareMs", () => {
					return this.prepareFactory(host.cdpClient).prepare({ applicationHeaders });
				}),
				ledger.measure("sentinelPrepareMs", () => {
					return this.sentinelPrepareFactory(host.cdpClient).prepare({ applicationHeaders });
				}),
				ledger.measure("sentinelSdkMs", () => {
					return this.sentinelSdkFactory(host.cdpClient).createToken();
				})
			]));
			descriptor = this.describe({
				port,
				host,
				conversationPrepare: probes[0],
				sentinelPrepare: probes[1],
				sentinelSdk: probes[2]
			});
			return descriptor;
		} finally {
			await ledger.measure("cleanupMs", () => host.close());
			if (descriptor) {
				descriptor.timings = ledger.snapshot();
			}
		}
	}

	describe({ port, host, conversationPrepare, sentinelPrepare, sentinelSdk }) {
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
	}

	invalidate() {
		this.cache.invalidate();
	}
}
