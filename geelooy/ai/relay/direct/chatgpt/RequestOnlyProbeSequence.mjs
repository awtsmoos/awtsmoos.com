//B"H
// Boruch Hashem
// Blessed is He

/**
 * Official request-only probes rise one at a time. The Awtsmoos lets
 * Awtsmoos.com learn transport truth without bursting prepare and Sentinel
 * endpoints together, while every pause remains injectable for deterministic tests.
 */
export class RequestOnlyProbeSequence {
	constructor({
		gapMs = 2000,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.gapMs = Math.max(0, Number(gapMs) || 0);
		this.sleep = sleep;
	}

	async run({
		host,
		ledger,
		prepareFactory,
		sentinelPrepareFactory,
		sentinelSdkFactory
	}) {
		const conversationPrepare = await ledger.measure(
			"conversationPrepareMs",
			() => prepareFactory(host.cdpClient).prepare({
				applicationHeaders: host.applicationHeaders
			})
		);
		await this.pause(ledger, "conversationToSentinelGapMs");
		const sentinelPrepare = await ledger.measure(
			"sentinelPrepareMs",
			() => sentinelPrepareFactory(host.cdpClient).prepare({
				applicationHeaders: host.applicationHeaders
			})
		);
		await this.pause(ledger, "sentinelToSdkGapMs");
		const sentinelSdk = await ledger.measure(
			"sentinelSdkMs",
			() => sentinelSdkFactory(host.cdpClient).createToken()
		);
		return { conversationPrepare, sentinelPrepare, sentinelSdk };
	}

	async pause(ledger, name) {
		if (this.gapMs === 0) {
			return;
		}
		await ledger.measure(name, () => this.sleep(this.gapMs));
	}
}
