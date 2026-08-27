// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reclaims stale website leases without guessing submission outcomes.
 * @description
 * The Awtsmoos returns untouched claims to their queue yet quarantines every turn
 * whose Send may have begun. Awtsmoos.com preserves accepted testimony, raises one
 * reconciliation gate, and never converts ambiguity into a duplicate browser POST.
 */
export function reclaimStaleLeases(state, options, now) {
	const retained = [];
	for (const lease of Array.isArray(state.active) ? state.active : []) {
		if (!isStale(lease, options, now)) {
			retained.push(lease);
			continue;
		}
		const identity = ticketIdentity(lease);
		if (state.accepted[identity] || deliveryMayHaveStarted(lease)) {
			quarantine(state, lease, identity, now);
		} else if (!state.queue.some(item => item.id === identity)) {
			state.queue.unshift(recoveredTicket(lease, identity, now));
		}
	}
	return retained;
}

export function uniqueTickets(value) {
	const seen = new Set();
	return (Array.isArray(value) ? value : []).filter(ticket => {
		if (!ticket?.id || seen.has(ticket.id)) return false;
		seen.add(ticket.id);
		return true;
	});
}

export function pruneAccepted(value, now, ttl, maximum) {
	return Object.fromEntries(
		Object.entries(objectOrEmpty(value))
			.filter(([, receipt]) => now - Number(receipt?.acceptedAt || 0) < ttl)
			.sort((left, right) =>
				Number(right[1].acceptedAt) - Number(left[1].acceptedAt))
			.slice(0, maximum)
	);
}

export function objectOrEmpty(value) {
	return value && typeof value === "object" ? value : {};
}

export function numberOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}

function quarantine(state, lease, identity, now) {
	if (!state.accepted[identity] && !state.uncertain[identity]) {
		state.uncertain[identity] = {
			deliveryStartedAt: Number(
				lease.deliveryStartedAt || lease.acquiredAt || now
			),
			recordedAt: now,
			reason: "stale_delivery_owner"
		};
	}
	state.reconciliationRequiredAt = state.reconciliationRequiredAt || now;
}

function isStale(lease, options, now) {
	return !options.processAlive(lease.pid) ||
		now - Number(lease.acquiredAt || 0) >= options.leaseStaleMs;
}

function deliveryMayHaveStarted(lease) {
	return [
		"delivery_started",
		"accepted",
		"reconciliation_required"
	].includes(lease.phase);
}

function recoveredTicket(lease, identity, now) {
	const ticket = { ...lease, id: identity, pid: null, recoveredAt: now };
	for (const key of ["acquiredAt", "ticketId", "phase", "deliveryStartedAt"]) {
		delete ticket[key];
	}
	return ticket;
}

function ticketIdentity(lease) {
	return String(lease.ticketId || lease.id || "").replace(/^lease_/, "");
}
