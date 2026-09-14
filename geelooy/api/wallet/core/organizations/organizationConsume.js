//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationConsume
 * @description Debits actual metered Awtsmoos resource usage from a funded project
 * budget and its parent organization pool under one idempotent Wallet transaction.
 */

const { createTransaction } = require("../ledger.js");
const {
	idempotencyKey,
	organizationId,
	perutahs,
	projectKey
} = require("./organizationPolicy.js");
const {
	budgetView,
	organizationView,
	requireOrganizationAccess
} = require("./organizationState.js");
const {
	findOrganizationEvent,
	recordOrganizationEvent
} = require("./organizationEvents.js");

function consumeOrganizationBudgetInside(database, userId, input = {}, now = Date.now()) {
	const id = organizationId(input.organizationId);
	const key = projectKey(input.projectKey);
	const amount = perutahs(input.amountPerutahs);
	const retry = idempotencyKey(input.idempotencyKey);
	const access = requireOrganizationAccess(database, id, userId);
	if (!access.ok) return access;

	const existing = findOrganizationEvent(database, userId, "consume", retry);
	if (existing) {
		return existing.organizationId === id
			&& existing.projectKey === key
			&& existing.amountPerutahs === amount
			? success(access.organization, userId, key, true)
			: { ok: false, error: "idempotency_conflict" };
	}

	const budget = access.organization.budgets?.[key];
	if (!budget) {
		return { ok: false, error: "organization_budget_not_found" };
	}
	const remaining = Math.max(
		(Number(budget.limitPerutahs) || 0) - (Number(budget.spentPerutahs) || 0),
		0
	);
	if (amount > remaining || amount > access.organization.purchasedBalance) {
		return {
			ok: false,
			error: "organization_budget_exhausted",
			availablePerutahs: Math.min(remaining, access.organization.purchasedBalance)
		};
	}

	budget.spentPerutahs += amount;
	budget.updatedAt = now;
	access.organization.purchasedBalance -= amount;
	access.organization.updatedAt = now;
	database.txs.push(createTransaction("organization_resource_spend", userId, -amount, {
		organizationId: id,
		projectKey: key,
		purpose: boundedPurpose(input.purpose),
		balanceKind: "organization_purchased",
		idempotencyKey: `organization:consume:${retry}`
	}, now));
	recordOrganizationEvent(database, {
		operation: "consume",
		idempotencyKey: retry,
		userId,
		organizationId: id,
		projectKey: key,
		amountPerutahs: amount,
		at: now
	});
	return success(access.organization, userId, key, false);
}

function boundedPurpose(value) {
	return String(value || "awtsmoos_resource")
		.trim()
		.replace(/\s+/g, " ")
		.slice(0, 120) || "awtsmoos_resource";
}

function success(organization, userId, key, deduplicated) {
	return {
		ok: true,
		deduplicated,
		budget: budgetView(organization.budgets[key]),
		organization: organizationView(organization, userId)
	};
}

module.exports = { consumeOrganizationBudgetInside };
