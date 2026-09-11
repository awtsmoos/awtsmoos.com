//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationFund
 * @description Moves verified purchased Perutas from an owner's Wallet into an
 * organization pool atomically, preserving provenance and an idempotent witness.
 */

const { createTransaction, buildWalletView } = require("../ledger.js");
const { ensureWallet } = require("../transactionRunner.js");
const { debitPurchasedOnly } = require("../commerce/purchaseDebit.js");
const {
	idempotencyKey,
	organizationId,
	perutahs
} = require("./organizationPolicy.js");
const {
	organizationView,
	requireOrganizationAccess
} = require("./organizationState.js");
const {
	findOrganizationEvent,
	recordOrganizationEvent
} = require("./organizationEvents.js");

function fundOrganizationInside(database, userId, input = {}, now = Date.now()) {
	const id = organizationId(input.organizationId);
	const amount = perutahs(input.amountPerutahs);
	const key = idempotencyKey(input.idempotencyKey);
	const access = requireOrganizationAccess(database, id, userId, ["owner"]);
	if (!access.ok) return access;

	const existing = findOrganizationEvent(database, userId, "fund", key);
	if (existing) {
		return existing.amountPerutahs === amount && existing.organizationId === id
			? success(database, access.organization, userId, true)
			: { ok: false, error: "idempotency_conflict" };
	}

	const wallet = ensureWallet(database, userId, now);
	const debit = debitPurchasedOnly(wallet, amount);
	if (!debit.ok) {
		return {
			ok: false,
			error: "insufficient_purchased_perutahs",
			needed: amount,
			balance: wallet.purchasedBalance
		};
	}

	access.organization.purchasedBalance += amount;
	access.organization.updatedAt = now;
	database.txs.push(createTransaction("organization_fund", userId, -amount, {
		organizationId: id,
		balanceKind: "purchased",
		idempotencyKey: `organization:fund:${key}`
	}, now));

	recordOrganizationEvent(database, {
		operation: "fund",
		idempotencyKey: key,
		userId,
		organizationId: id,
		amountPerutahs: amount,
		at: now
	});
	return success(database, access.organization, userId, false);
}

function success(database, organization, userId, deduplicated) {
	return {
		ok: true,
		deduplicated,
		organization: organizationView(organization, userId),
		wallet: buildWalletView(database, userId)
	};
}

module.exports = { fundOrganizationInside };
