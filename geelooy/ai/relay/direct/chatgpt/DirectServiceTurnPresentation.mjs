// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents verified browser and queue lifecycle evidence to direct callers.
 * @description
 * The Awtsmoos distinguishes a completed close from an uncertain held vessel.
 * Awtsmoos.com returns explicit facts for ownership, cleanup, cooldown anchoring,
 * quarantine, and queue recovery without exposing private upstream identities.
 */
export function presentTurn(result, lease, physicalTabs, closeReceipt, uncertain) {
	return {
		...result,
		turnQueue: lease.view,
		physicalTabs,
		tabLifecycle: lifecycle(Boolean(closeReceipt), false, uncertain)
	};
}

export function attachTurnError(error, context) {
	error.turnQueue = context.lease.view;
	error.physicalTabs = context.physicalTabs;
	error.tabLifecycle = lifecycle(
		Boolean(context.closeReceipt),
		context.held,
		context.uncertain
	);
	return error;
}

export function lifecycle(closed, held, uncertain = false) {
	return {
		ownedTarget: true,
		closedImmediatelyAfterAcceptedSend: closed,
		closeVerified: closed,
		physicalCapVerified: closed,
		cooldownStartedAfterClose: closed,
		queueSlotHeldForRecovery: held,
		submissionUncertain: uncertain,
		intervalAnchor: "verified-tab-close"
	};
}

export function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
