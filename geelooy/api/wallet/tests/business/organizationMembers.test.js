//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file organizationMembers.test.js
 * @description Proves owner-assigned agency roles can use funded project budgets
 * while non-owners cannot rewrite the organization membership graph.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { createOrganizationInside } = require("../../core/organizations/organizationCreate.js");
const { setOrganizationMemberInside } = require("../../core/organizations/organizationMembers.js");
const { fundOrganizationInside } = require("../../core/organizations/organizationFund.js");
const { allocateOrganizationBudgetInside } = require("../../core/organizations/organizationBudget.js");
const { consumeOrganizationBudgetInside } = require("../../core/organizations/organizationConsume.js");

function seededDatabase() {
	return {
		wallets: {
			owner: {
				userId: "owner",
				balance: 10000000,
				purchasedBalance: 10000000,
				promotionalBalance: 0
			}
		},
		txs: [],
		entitlements: {},
		commerceReceipts: []
	};
}

test("members consume assigned budget while membership remains owner-controlled", () => {
	const db = seededDatabase();
	const created = createOrganizationInside(db, "owner", {
		name: "Awtsmoos Agency",
		idempotencyKey: "create-member-org-001"
	});
	const id = created.organization.id;
	fundOrganizationInside(db, "owner", {
		organizationId: id,
		amountPerutahs: 8000000,
		idempotencyKey: "fund-member-org-001"
	});
	allocateOrganizationBudgetInside(db, "owner", {
		organizationId: id,
		projectKey: "client.one",
		limitPerutahs: 4000000,
		idempotencyKey: "allocate-member-001"
	});
	const member = setOrganizationMemberInside(db, "owner", {
		organizationId: id,
		targetUserId: "worker",
		role: "member"
	});
	assert.equal(member.ok, true);
	const spent = consumeOrganizationBudgetInside(db, "worker", {
		organizationId: id,
		projectKey: "client.one",
		amountPerutahs: 500000,
		idempotencyKey: "member-spend-001"
	});
	const denied = setOrganizationMemberInside(db, "worker", {
		organizationId: id,
		targetUserId: "other",
		role: "member"
	});
	assert.equal(spent.ok, true);
	assert.equal(spent.organization.role, "member");
	assert.equal(denied.error, "organization_role_denied");
	assert.equal(db.organizations[id].purchasedBalance, 7500000);
});
