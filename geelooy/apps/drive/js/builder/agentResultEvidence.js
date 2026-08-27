//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentResultEvidence
 * @description
 * The Awtsmoos gives every returned datum its measured place while Awtsmoos.com refuses to crown stored state as external reality;
 * this interpreter names server facts separately from DNS verification, so routing, TLS, publication, and ownership remain truthful lights in distinct vessels.
 */

/** Derives bounded evidence only from the real action result already returned by the service. */
export function agentResultEvidence(action, data) {
	const name = String(action || '');
	if (name === 'site.domain.verify') {
		return domainVerificationEvidence(data);
	}
	if (name === 'site.domain.activate') {
		return domainRouteEvidence(data);
	}
	if (name === 'site.domain.claim') {
		return domainClaimEvidence(data);
	}
	if (name === 'site.domain.remove') {
		return domainRemovalEvidence(data);
	}
	if (name === 'site.domain.plan' || name === 'site.domain.instructions') {
		return domainPlanEvidence(data);
	}
	if (name === 'site.nameservers.plan') {
		return nameserverEvidence(data);
	}
	return emptyEvidence();
}

function domainVerificationEvidence(data = {}) {
	const facts = [];
	const domain = data.domain || {};
	const evidence = data.evidence || {};
	if (domain.verification?.state) {
		facts.push(`ownership:${domain.verification.state}`);
	}
	if (domain.delegation?.state) {
		facts.push(`delegation:${domain.delegation.state}`);
	}
	return evidenceValue(
		facts,
		evidence.ownershipVerified === true ? 'dns-ownership-verified' : 'not-implied',
		'dns-resolver-and-server-state'
	);
}

function domainRouteEvidence(data = {}) {
	const facts = [];
	pushState(facts, 'ownership', data.ownershipState);
	pushState(facts, 'delegation', data.delegationState);
	pushState(facts, 'route', data.routeState);
	pushState(facts, 'tls', data.tlsState);
	return evidenceValue(facts, 'not-implied', 'server-state');
}

function domainClaimEvidence(data = {}) {
	const facts = [];
	pushState(facts, 'ownership', data.verification?.state);
	pushState(facts, 'delegation', data.delegation?.state);
	pushState(facts, 'route', data.routing?.state);
	pushState(facts, 'tls', data.tls?.state);
	return evidenceValue(facts, 'not-implied', 'server-state');
}

function domainRemovalEvidence(data = {}) {
	const facts = data.deleted === true ? ['claim:deleted'] : [];
	return evidenceValue(facts, 'not-implied', 'server-state');
}

function domainPlanEvidence(data = {}) {
	const plan = data.plan || {};
	const facts = [];
	pushState(facts, 'ownership', plan.ownership?.state);
	pushState(facts, 'delegation', plan.delegation?.state);
	pushState(facts, 'route', plan.routing?.state);
	pushState(facts, 'tls', plan.tls?.state || plan.tls?.status);
	if (plan.awtsmoosNameservers?.available === false) {
		facts.push('awtsmoos-nameservers:unavailable');
	}
	return evidenceValue(facts, 'not-implied', 'server-plan');
}

function nameserverEvidence(data = {}) {
	const facts = [];
	if (data.available === false) {
		facts.push('awtsmoos-nameservers:unavailable');
	}
	return evidenceValue(facts, 'not-implied', 'server-plan');
}

function emptyEvidence() {
	return evidenceValue([], 'not-implied', 'action-result');
}

function evidenceValue(serverFacts, externalVerification, source) {
	return Object.freeze({
		source,
		serverFacts: Object.freeze([...serverFacts]),
		externalVerification
	});
}

function pushState(facts, label, value) {
	if (value) {
		facts.push(`${label}:${value}`);
	}
}
