//B"H
// Boruch Hashem
// Blessed is He

import { buildDomainPlan } from "./domainPlan.js";

/**
 * @file Domain machine actions over the exact service used by human Domain controls.
 * @description
 * The Awtsmoos lets an agent shape local DNS intention while durable claims remain bound to the human service and canonical site;
 * Awtsmoos.com reveals a freshly minted TXT secret only from claim, redacts later status, and never activates routing or TLS here.
 */

const ACTIONS = new Set([
	"site.domain.plan",
	"site.domain.instructions",
	"site.domain.status",
	"site.domain.refresh",
	"site.domain.claim",
	"site.domain.verifyOwnership",
	"site.domain.verifyDelegation",
	"site.domain.detach"
]);

export function handlesDomainAction(actionName) {
	return ACTIONS.has(actionName);
}

export async function executeDomainAction(context, actionName, input = {}) {
	if (actionName === "site.domain.plan") return planDomain(context, input, true);
	if (actionName === "site.domain.instructions") return planDomain(context, input, false);
	if (actionName === "site.domain.status") return outcome(secretSafeStatus(context));
	if (actionName === "site.domain.claim") return claimDomain(context, input);
	if (actionName === "site.domain.refresh") {
		await invokeService(context, "refresh", [], "DOMAIN_REFRESH_FAILED");
		return outcome(secretSafeStatus(context));
	}
	return witnessOrDetach(context, actionName, input);
}

async function claimDomain(context, input) {
	if (hasPlanInput(input)) planDomain(context, input, true);
	const claim = await invokeService(context, "claim", [], "DOMAIN_CLAIM_FAILED");
	return outcome({ claim, status: secretSafeStatus(context) });
}

async function witnessOrDetach(context, actionName, input) {
	const hostname = String(input.hostname || "");
	const operation = operationFor(actionName);
	const result = await invokeService(
		context,
		operation.method,
		[hostname],
		operation.errorCode
	);
	return outcome({ result: redactClaim(result), status: secretSafeStatus(context) });
}

function operationFor(actionName) {
	if (actionName === "site.domain.verifyOwnership") {
		return { method: "verifyOwnership", errorCode: "DOMAIN_OWNERSHIP_VERIFICATION_FAILED" };
	}
	if (actionName === "site.domain.verifyDelegation") {
		return { method: "verifyDelegation", errorCode: "DOMAIN_DELEGATION_VERIFICATION_FAILED" };
	}
	return { method: "remove", errorCode: "DOMAIN_DETACH_FAILED" };
}

function planDomain(context, input, persist) {
	const current = context.state.snapshot().domainPlan || {};
	const plan = buildDomainPlan({
		hostname: input.hostname ?? current.hostname,
		mode: input.mode ?? current.mode,
		nameservers: input.nameservers ?? current.nameservers
	});
	if (persist) context.state.patch({ domainPlan: plan, message: "Domain plan updated." });
	return outcome(plan);
}

async function invokeService(context, method, args, errorCode) {
	const service = context.domainClaims;
	if (!service || typeof service[method] !== "function") {
		throw actionError("DOMAIN_CLAIM_SERVICE_UNAVAILABLE");
	}
	const result = await service[method](...args);
	if (result === false) {
		throw actionError(errorCode, context.state.snapshot().error || errorCode);
	}
	return result;
}

function secretSafeStatus(context) {
	const snapshot = context.state.snapshot();
	return {
		domainPlan: snapshot.domainPlan,
		domainClaims: (snapshot.domainClaims || []).map(redactClaim),
		activeDomainClaim: redactClaim(snapshot.activeDomainClaim),
		domainOperations: snapshot.domainOperations,
		canonicalTarget: snapshot.canonicalTarget,
		canonicalSite: snapshot.canonicalSite
	};
}

function redactClaim(claim) {
	if (!claim) return null;
	const output = { ...claim };
	if (output.ownershipInstruction) {
		output.ownershipInstruction = { ...output.ownershipInstruction };
		delete output.ownershipInstruction.value;
	}
	return output;
}

function hasPlanInput(input) {
	return ["hostname", "mode", "nameservers"].some((key) => Object.hasOwn(input, key));
}

function outcome(data, message = "") {
	return { data, message };
}

function actionError(code, message = code) {
	const error = new Error(message);
	error.code = code;
	return error;
}
