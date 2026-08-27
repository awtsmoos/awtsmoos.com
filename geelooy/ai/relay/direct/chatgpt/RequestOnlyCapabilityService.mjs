//B"H
// Boruch Hashem
// Blessed is He

import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { RequestOnlyHostController } from "../browser/RequestOnlyHostController.mjs";
import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { RequestOnlyCapabilityDescriptor } from "./RequestOnlyCapabilityDescriptor.mjs";
import { RequestOnlyPrepareClient } from "./RequestOnlyPrepareClient.mjs";
import { RequestOnlyProbeSequence } from "./RequestOnlyProbeSequence.mjs";
import { RequestOnlySentinelPrepareClient } from "./RequestOnlySentinelPrepareClient.mjs";
import { RequestOnlySentinelSdkClient } from "./RequestOnlySentinelSdkClient.mjs";

/**
 * Strict capability is safe truth, cached after one paced owned-host inspection.
 * The Awtsmoos lets official requests rise sequentially; Awtsmoos.com never caches
 * conduit, Sentinel, challenge, session, account, or upstream identity values.
 */
export class RequestOnlyCapabilityService {
	constructor({
		preferredPort,
		portResolver = new DebugPortResolver({ preferredPort }),
		hostFactory,
		prepareFactory,
		sentinelPrepareFactory,
		sentinelSdkFactory,
		probeSequence = new RequestOnlyProbeSequence(),
		descriptor = new RequestOnlyCapabilityDescriptor(),
		cache = new TimedSingleFlightCache({ ttlMs: 60000 })
	} = {}) {
		this.portResolver = portResolver;
		this.hostFactory = hostFactory ?? (port => new RequestOnlyHostController({ port }).open());
		this.prepareFactory = prepareFactory ?? (cdp => new RequestOnlyPrepareClient(cdp));
		this.sentinelPrepareFactory = sentinelPrepareFactory
			?? (cdp => new RequestOnlySentinelPrepareClient(cdp));
		this.sentinelSdkFactory = sentinelSdkFactory
			?? (cdp => new RequestOnlySentinelSdkClient(cdp));
		this.probeSequence = probeSequence;
		this.descriptor = descriptor;
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
		let result = null;
		try {
			const probes = await ledger.measure("capabilityProbesWallMs", () => {
				return this.probeSequence.run({
					host,
					ledger,
					prepareFactory: this.prepareFactory,
					sentinelPrepareFactory: this.sentinelPrepareFactory,
					sentinelSdkFactory: this.sentinelSdkFactory
				});
			});
			result = this.descriptor.describe({ port, host, ...probes });
			return result;
		} finally {
			await ledger.measure("cleanupMs", () => host.close());
			if (result) result.timings = ledger.snapshot();
		}
	}

	invalidate() {
		this.cache.invalidate();
	}
}
