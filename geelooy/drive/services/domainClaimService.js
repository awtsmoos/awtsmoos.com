//B"H
// Boruch Hashem
// Blessed is He

import {
	domainClaimRemoved,
	domainClaimsLoaded,
	domainClaimStored,
	domainOperationFailed,
	domainOperationStarted
} from "./domainClaimState.js";

/**
 * @file Server-proven custom-domain ownership for the website builder.
 * @description
 * The Awtsmoos lets a local DNS plan approach authority without becoming authority itself;
 * Awtsmoos.com sends every claim and verification through one same-origin service vessel.
 */

export class DomainClaimService {
	constructor({ state, client }) {
		this.state = state;
		this.client = client;
	}

	async refresh() {
		return this.perform("refresh", async (snapshot) => {
			const target = requireTarget(snapshot);
			const claims = await this.client.listClaims(target);
			this.state.patch(domainClaimsLoaded(this.state.snapshot(), claims));
			return claims;
		});
	}

	async claim() {
		return this.perform("claim", async (snapshot) => {
			const target = requireTarget(snapshot);
			const plan = requirePlan(snapshot);
			const claim = await this.client.createClaim({
				...target,
				hostname: plan.hostname,
				dnsMode: plan.mode,
				nameservers: plan.nameservers
			});
			this.state.patch(domainClaimStored(this.state.snapshot(), claim, "claim"));
			return claim;
		});
	}

	async verifyOwnership(hostname) {
		return this.verify("verify", hostname, (target) => (
			this.client.verifyOwnership(target)
		));
	}

	async verifyDelegation(hostname) {
		return this.verify("delegation", hostname, (target) => (
			this.client.verifyDelegation(target)
		));
	}

	async remove(hostname) {
		return this.perform("remove", async (snapshot) => {
			const target = claimTarget(snapshot, hostname);
			const result = await this.client.deleteClaim(target);
			this.state.patch(domainClaimRemoved(this.state.snapshot(), target.hostname));
			return result;
		});
	}

	async verify(operation, hostname, requester) {
		return this.perform(operation, async (snapshot) => {
			const target = claimTarget(snapshot, hostname);
			const claim = await requester(target);
			this.state.patch(domainClaimStored(this.state.snapshot(), claim, operation));
			return claim;
		});
	}

	async perform(operation, task) {
		const snapshot = this.state.snapshot();
		this.state.patch(domainOperationStarted(snapshot, operation));
		try {
			return await task(snapshot);
		} catch (error) {
			this.state.patch(domainOperationFailed(this.state.snapshot(), operation, error));
			return false;
		}
	}
}

function requireTarget(snapshot) {
	const aliasId = String(snapshot.canonicalTarget?.aliasId || "").trim();
	const siteId = String(snapshot.canonicalTarget?.siteId || "").trim();
	if (!aliasId || !siteId) {
		throw new Error("Publish or select a canonical site before managing a custom domain.");
	}
	return { aliasId, siteId };
}

function requirePlan(snapshot) {
	const plan = snapshot.domainPlan;
	if (!plan?.hostname || !plan?.mode) {
		throw new Error("Create a domain plan before claiming a hostname.");
	}
	if (plan.status === "infrastructure-unavailable") {
		throw new Error(plan.infrastructure || "This domain mode is unavailable.");
	}
	return plan;
}

function claimTarget(snapshot, hostname) {
	const target = requireTarget(snapshot);
	const selected = String(
		hostname || snapshot.activeDomainClaim?.hostname || ""
	).trim();
	if (!selected) throw new Error("Choose a domain claim first.");
	return {
		...target,
		hostname: selected
	};
}
