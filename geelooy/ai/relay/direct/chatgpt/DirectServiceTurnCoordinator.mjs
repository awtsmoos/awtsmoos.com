// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds logical admission through physical capacity, closure, and delivery.
 * @description
 * The Awtsmoos verifies both ledgers: the durable queue and Chrome's living target
 * catalog. A result releases its slot only after the owned target is gone and the
 * physical browser is within its hard cap; uncertainty becomes backpressure.
 */
export class DirectServiceTurnCoordinator {
	constructor({ queue, protector = null, schedule = setImmediate } = {}) {
		if (!queue) throw new TypeError("queue is required.");
		this.queue = queue;
		this.protector = protector;
		this.schedule = schedule;
	}

	async run(metadata, operation) {
		const lease = await this.queue.acquire(metadata, {
			signal: metadata.signal,
			timeoutMs: metadata.queueTimeoutMs
		});
		let operationStarted = false;
		let physicalTabs = null;
		try {
			physicalTabs = await this.protector?.beforeTurn() || null;
			operationStarted = true;
			const result = await operation();
			physicalTabs = await this.afterTurn();
			const verified = result.tabClose?.verified !== false &&
				physicalTabs?.withinLimit !== false;
			if (verified) this.releaseAfterDelivery(lease);
			return present(result, lease, physicalTabs, verified);
		} catch (error) {
			if (!operationStarted) {
				await lease.release();
			} else {
				physicalTabs = await this.afterTurn();
				const verified = error.tabClose?.verified !== false &&
					physicalTabs?.withinLimit !== false;
				if (verified) await lease.release();
				error.tabLifecycle = lifecycle(verified);
			}
			error.turnQueue = lease.view;
			error.physicalTabs = physicalTabs;
			throw error;
		}
	}

	async afterTurn() {
		if (!this.protector) return null;
		try {
			return await this.protector.afterTurn();
		} catch (error) {
			return { withinLimit: false, error: String(error?.code || error?.message || error) };
		}
	}

	releaseAfterDelivery(lease) {
		this.schedule(() => void lease.release().catch(() => undefined));
	}

	status() { return this.queue.status(); }
}

function present(result, lease, physicalTabs, verified) {
	return { ...result, turnQueue: lease.view, physicalTabs, tabLifecycle: lifecycle(verified) };
}

function lifecycle(verified) {
	return {
		ownedTarget: true,
		closedBeforeResult: verified,
		closeVerified: verified,
		physicalCapVerified: verified,
		queueReleaseAfterDelivery: verified,
		queueSlotHeldForRecovery: !verified
	};
}
