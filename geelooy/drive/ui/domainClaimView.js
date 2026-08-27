//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";
import { renderDomainClaimCard } from "./domainClaimDetailsView.js";

/**
 * @file Authoritative custom-domain claim collection for Geelooy Sites.
 * @description
 * The Awtsmoos lets a local plan approach public proof without becoming public proof;
 * Awtsmoos.com keeps claim controls semantic, mobile-first, and separate from DNS planning.
 */

export function renderDomainClaims(state, actions) {
	const malchusTarget = state.canonicalTarget || {};
	const yesodClaims = Array.isArray(state.domainClaims) ? state.domainClaims : [];
	const gevurahOperations = state.domainOperations || {};
	return [
		toolbar(state, actions, gevurahOperations),
		prerequisite(malchusTarget),
		operationMessage(gevurahOperations),
		...claimCards(yesodClaims, actions, gevurahOperations)
	];
}

function toolbar(state, actions, operations) {
	return createElement("div", {
		className: "domain-claim-toolbar",
		children: [
			actionButton("Refresh claims", () => actions.refreshDomainClaims(), {
				disabled: operations.refresh === "pending"
			}),
			actionButton("Claim planned domain", () => actions.claimDomain(), {
				className: "button primary",
				disabled: !claimReady(state) || operations.claim === "pending"
			})
		]
	});
}

function prerequisite(target) {
	const tiferesReady = Boolean(target.aliasId && target.siteId);
	return createElement("p", {
		className: tiferesReady
			? "domain-claim-note"
			: "domain-claim-note domain-claim-warning",
		text: tiferesReady
			? `Claims bind to canonical site ${target.aliasId}/${target.siteId}.`
			: "Publish or select a named canonical site before creating a server claim."
	});
}

function operationMessage(operations) {
	const gevurahError = operations.error;
	return createElement("div", {
		className: gevurahError
			? "domain-operation-status error"
			: "domain-operation-status",
		text: gevurahError
			? `${gevurahError.code}: ${gevurahError.message}`
			: "Server claims remain separate from local DNS planning.",
		attributes: {
			role: "status",
			"aria-live": "polite"
		}
	});
}

function claimCards(claims, actions, operations) {
	if (!claims.length) {
		return [createElement("p", {
			className: "domain-empty",
			text: "No authoritative domain claims exist for this canonical site yet."
		})];
	}
	return claims.map((claim, index) => renderDomainClaimCard(
		claim,
		actions,
		operations,
		index === 0
	));
}

function claimReady(state) {
	return Boolean(
		state.domainPlan?.hostname
		&& state.canonicalTarget?.aliasId
		&& state.canonicalTarget?.siteId
		&& state.domainPlan.status !== "infrastructure-unavailable"
	);
}
