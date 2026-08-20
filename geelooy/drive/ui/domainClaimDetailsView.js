//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";

/**
 * @file One authoritative domain claim revealed through semantic status and one-time ownership proof.
 * @description
 * The Awtsmoos lets each proof keep its own vessel and lets a secret vanish after its appointed revelation;
 * Awtsmoos.com never lets ownership impersonate routing or TLS readiness, nor pretends a refreshed challenge value can be reconstructed.
 */

export function renderDomainClaimCard(claim, actions, operations, open = false) {
	return createElement("details", {
		className: "domain-claim-card",
		attributes: open ? { open: true } : {},
		children: [
			createElement("summary", { text: claim.hostname }),
			statusGrid(claim),
			proofRows(claim),
			claimButtons(claim, actions, operations)
		]
	});
}

function statusGrid(claim) {
	const stages = [
		["Ownership", claim.ownershipStatus],
		["Delegation", claim.delegationStatus],
		["DNS", claim.dnsStatus],
		["Routing", claim.routingStatus],
		["TLS", claim.tlsStatus]
	];
	return createElement("div", {
		className: "domain-claim-status-grid",
		children: stages.map(([label, value]) => createElement("div", {
			className: "domain-stage",
			children: [
				createElement("strong", { text: label }),
				createElement("span", { text: value || "unknown" })
			]
		}))
	});
}

function proofRows(claim) {
	const instruction = claim.ownershipInstruction || {};
	const rows = [
		row("TXT name", instruction.name || "Unavailable"),
		row(txtValueLabel(claim), txtValue(claim)),
		row("Challenge note", challengeNote(claim, instruction.value)),
		row("DNS mode", claim.dnsMode || "unknown")
	];
	if (claim.requestedNameservers?.length) {
		rows.push(row("Nameservers", claim.requestedNameservers.join(", ")));
	}
	return createElement("div", {
		className: "domain-claim-proof",
		children: rows
	});
}

function txtValueLabel(claim) {
	return claim.ownershipStatus === "ownership-verified"
		? "TXT challenge"
		: "One-time TXT value";
}

function txtValue(claim) {
	if (claim.ownershipStatus === "ownership-verified") return "Verified — no longer required";
	return claim.ownershipInstruction?.value || "Unavailable after refresh";
}

function challengeNote(claim, value) {
	if (claim.ownershipStatus === "ownership-verified") {
		return "Ownership is verified; the one-time challenge no longer needs to be retained.";
	}
	if (value) return "Copy this value now. The server does not reissue it on later reads or refresh.";
	return "To receive a new challenge with the current backend, remove this claim and create it again.";
}

function claimButtons(claim, actions, operations) {
	const children = [actionButton(
		"Verify ownership",
		() => actions.verifyDomainOwnership(claim.hostname),
		{ disabled: operations.verify === "pending" }
	)];
	if (claim.dnsMode === "custom-nameservers") {
		children.push(actionButton(
			"Verify nameservers",
			() => actions.verifyDomainDelegation(claim.hostname),
			{ disabled: operations.delegation === "pending" }
		));
	}
	children.push(actionButton(
		"Remove claim",
		() => actions.removeDomainClaim(claim.hostname),
		{ disabled: operations.remove === "pending" }
	));
	return createElement("div", { className: "domain-claim-actions", children });
}

function row(label, value) {
	return createElement("div", {
		className: "domain-plan-row",
		children: [
			createElement("strong", { text: label }),
			createElement("span", { text: value })
		]
	});
}
