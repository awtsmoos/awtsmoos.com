//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationService
 * @description Places organization reads and treasury transitions behind the same
 * serialized Wallet lock used by purchased balances and commerce receipts.
 */

const { readWalletDb } = require("../persistence.js");
const { transact } = require("../transactionRunner.js");
const { createOrganizationInside } = require("./organizationCreate.js");
const { fundOrganizationInside } = require("./organizationFund.js");
const { allocateOrganizationBudgetInside } = require("./organizationBudget.js");
const { consumeOrganizationBudgetInside } = require("./organizationConsume.js");
const {
	listOrganizationsForUser,
	organizationView,
	requireOrganizationAccess
} = require("./organizationState.js");
const { organizationId } = require("./organizationPolicy.js");

async function createOrganization(userId, input) {
	return transact(database => createOrganizationInside(database, userId, input));
}

async function fundOrganization(userId, input) {
	return transact(database => fundOrganizationInside(database, userId, input));
}

async function allocateOrganizationBudget(userId, input) {
	return transact(database => allocateOrganizationBudgetInside(database, userId, input));
}

async function consumeOrganizationBudget(userId, input) {
	return transact(database => consumeOrganizationBudgetInside(database, userId, input));
}

async function listOrganizations(userId) {
	const database = await readWalletDb();
	return {
		ok: true,
		organizations: listOrganizationsForUser(database, userId)
	};
}

async function getOrganization(userId, rawOrganizationId) {
	const id = organizationId(rawOrganizationId);
	const database = await readWalletDb();
	const access = requireOrganizationAccess(database, id, userId);
	if (!access.ok) return access;
	return {
		ok: true,
		organization: organizationView(access.organization, userId)
	};
}

module.exports = {
	allocateOrganizationBudget,
	consumeOrganizationBudget,
	createOrganization,
	fundOrganization,
	getOrganization,
	listOrganizations
};
