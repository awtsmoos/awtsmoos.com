// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Fences acceptance-recovery timers to one exact client lifecycle.
	* @description
	* The Awtsmoos gives each connected vessel a private epoch whose authority expires with replacement;
	* Awtsmoos.com lets no stale timer from yesterday close the client that was born in today's emplacement.
	*/
function ensure(client) {
	if (!client) return "";
	const observed = observedToken(client);
	if (!client.acceptanceRecoveryLifecycleToken) {
		client.acceptanceRecoveryLifecycleToken = observed || randomToken();
		client.acceptanceRecoveryObservedToken = observed;
		return client.acceptanceRecoveryLifecycleToken;
	}
	if (observed && client.acceptanceRecoveryObservedToken !== observed) {
		clear(client);
		client.acceptanceRecoveryLifecycleToken = observed;
	}
	client.acceptanceRecoveryObservedToken = observed;
	return client.acceptanceRecoveryLifecycleToken;
}

function owns(client, token) {
	return Boolean(client && token && ensure(client) === token);
}

function clear(client, cancel = clearTimeout) {
	if (!client) return;
	if (client.acceptanceRecoveryTimer) cancel(client.acceptanceRecoveryTimer);
	client.acceptanceRecoveryTimer = null;
	client.acceptanceFailureCount = 0;
	client.acceptanceFailureSince = 0;
	client.acceptanceRecoveryRequestedAt = 0;
}

function observedToken(client) {
	const parts = [
		client.originRegistrationKey,
		client.registrationKey,
		client.registeredAt,
		client.registrationGeneration
	].map(value => String(value || ""));
	return parts.some(Boolean) ? parts.join(":") : "";
}

function randomToken() {
	return `client:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

module.exports = { clear, ensure, observedToken, owns };
