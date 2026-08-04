// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Releases one launch lease only at verified tab disappearance.
 * @description
 * The Awtsmoos begins the eighteen-second measure neither at admission nor answer
 * delivery. Awtsmoos.com receives the close callback from DirectClient, reconciles
 * the physical browser, writes lastClosedAt, and only then frees the next ticket.
 */
export class DirectServiceTurnCoordinator {
	constructor(options = {}) {
		if (!options.queue) throw new TypeError("queue is required.");
		this.queue = options.queue;
		this.protector = options.protector || null;
	}

	async run(metadata, operation) {
		const lease = await this.queue.acquire(metadata, {
			signal: metadata.signal,
			timeoutMs: metadata.queueTimeoutMs
		});
		let released = false;
		let mustHold = false;
		let physicalTabs = null;
		let closeReceipt = null;
		try {
			physicalTabs = await this.protector?.beforeTurn() || null;
			const onTabClosed = async receipt => {
				mustHold = true;
				if (receipt.tabClose?.verified !== true) throw codedError("tab_close_not_verified");
				physicalTabs = await this.afterTurn();
				if (physicalTabs?.withinLimit === false) throw codedError("physical_tab_cap_not_restored");
				await lease.release({ startCooldown: true, closedAt: receipt.closedAt });
				released = true;
				closeReceipt = receipt;
				return { physicalTabs, cooldownStartedAt: receipt.closedAt };
			};
			const result = await operation({ onTabClosed });
			if (!released) {
				await lease.release({ startCooldown: false });
				released = true;
			}
			return present(result, lease, physicalTabs, closeReceipt);
		} catch (error) {
			if (!released && !mustHold) {
				await lease.release({ startCooldown: false });
				released = true;
			}
			error.turnQueue = lease.view;
			error.physicalTabs = physicalTabs;
			error.tabLifecycle = lifecycle(Boolean(closeReceipt), mustHold && !released);
			throw error;
		}
	}

	async afterTurn() {
		if (!this.protector) return null;
		return this.protector.afterTurn();
	}

	status() { return this.queue.status(); }
}

function present(result, lease, physicalTabs, closeReceipt) {
	return {
		...result,
		turnQueue: lease.view,
		physicalTabs,
		tabLifecycle: lifecycle(Boolean(closeReceipt), false)
	};
}

function lifecycle(closed, held) {
	return {
		ownedTarget: true,
		closedImmediatelyAfterAcceptedSend: closed,
		closeVerified: closed,
		physicalCapVerified: closed,
		cooldownStartedAfterClose: closed,
		queueSlotHeldForRecovery: held,
		intervalAnchor: "verified-tab-close"
	};
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
