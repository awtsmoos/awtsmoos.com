//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationBudget
 * @description Allocates organization-owned purchased Perutas to project/client
 * ceilings without duplicating or moving value until actual resource consumption.
 */

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

function allocateOrganizationBudgetInside(database, userId, input = {}, now = Date.now()) {
	const id = organizationId(input.organizationId);
	const key = projectKey(input.projectKey);
	const limit = perutahs(input.limitPerutahs);
	const retry = idempotencyKey(input.idempotencyKey);
	const access = requireOrganizationAccess(database, id, userId, ["owner", "admin"]);
	if (!access.ok) return access;

	const existing = findOrganizationEvent(database, userId, "allocate", retry);
	if (existing) {
		return existing.organizationId === id
			&& existing.projectKey === key
			&& existing.amountPerutahs === limit
			? success(access.organization, userId, key, true)
			: { ok: false, error: "idempotency_conflict" };
	}

	const current = access.organization.budgets?.[key] || null;
	const spent = Number(current?.spentPerutahs) || 0;
	if (limit < spent) {
		return { ok: false, error: "budget_below_spent", spentPerutahs: spent };
	}
	const otherRemaining = remainingBudgetTotal(access.organization, key);
	const requestedRemaining = limit - spent;
	if (otherRemaining + requestedRemaining > access.organization.purchasedBalance) {
		return {
			ok: false,
			error: "organization_budget_overcommitted",
			availablePerutahs: Math.max(access.organization.purchasedBalance - otherRemaining, 0)
		};
	}

	access.organization.budgets ||= {};
	access.organization.budgets[key] = {
		key,
		label: boundedLabel(input.label, key),
		limitPerutahs: limit,
		spentPerutahs: spent,
		updatedAt: now
	};
	access.organization.updatedAt = now;
	recordOrganizationEvent(database, {
		operation: "allocate",
		idempotencyKey: retry,
		userId,
		organizationId: id,
		projectKey: key,
		amountPerutahs: limit,
		at: now
	});
	return success(access.organization, userId, key, false);
}

function remainingBudgetTotal(organization, excludedKey) {
	return Object.values(organization.budgets || {}).reduce((sum, budget) => {
		if (budget.key === excludedKey) return sum;
		return sum + Math.max(
			(Number(budget.limitPerutahs) || 0) - (Number(budget.spentPerutahs) || 0),
			0
		);
	}, 0);
}

function boundedLabel(value, fallback) {
	const label = String(value || fallback).trim().replace(/\s+/g, " ");
	return label.slice(0, 100) || fallback;
}

function success(organization, userId, key, deduplicated) {
	return {
		ok: true,
		deduplicated,
		budget: budgetView(organization.budgets[key]),
		organization: organizationView(organization, userId)
	};
}

module.exports = { allocateOrganizationBudgetInside };
