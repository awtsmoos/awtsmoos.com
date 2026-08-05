// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies durable submit-only receipts and isolated mission identifiers.
 * @description
 * The Awtsmoos lets tests model accepted prompt delivery without inventing an
 * answer. Awtsmoos.com gives every run a unique mission identity and an exact
 * verified-close receipt while tool and room work remains alive afterward.
 */
function dispatchReceipt(index = 1) {
	return {
		dispatched: true,
		acceptedAt: new Date(Date.now() + index).toISOString(),
		responseStatus: 200,
		promptVerified: true,
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer",
		tabClose: { closed: true, verified: true, attempts: 1 },
		tabLifecycle: {
			ownedTarget: true,
			closedImmediatelyAfterAcceptedSend: true,
			closeVerified: true,
			cooldownStartedAfterClose: true,
			intervalAnchor: "verified-tab-close"
		},
		turnQueue: {
			minimumIntervalMs: 18000,
			maxActiveTabs: 1,
			intervalAnchor: "verified-tab-close"
		}
	};
}

function missionId(label) {
	return `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function authenticatedService(calls = []) {
	return {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			calls.push(options);
			options.onProgress?.({
				stage: "website-submit",
				status: "accepted",
				at: Date.now()
			});
			return dispatchReceipt(calls.length);
		},
		reset() {
			return { deleted: 0 };
		}
	};
}

module.exports = { authenticatedService, dispatchReceipt, missionId };
