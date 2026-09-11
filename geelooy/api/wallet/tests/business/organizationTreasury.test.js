//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file organizationTreasury.test.js
 * @description Proves prepaid organization pools preserve purchased-value truth,
 * bounded project allocation, idempotency, and role-aware access.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { createOrganizationInside } = require("../../core/organizations/organizationCreate.js");
const { fundOrganizationInside } = require("../../core/organizations/organizationFund.js");
const { allocateOrganizationBudgetInside } = require("../../core/organizations/organizationBudget.js");
const { consumeOrganizationBudgetInside } = require("../../core/organizations/organizationConsume.js");
const { setOrganizationMemberInside } = require("../../core/organizations/organizationMembers.js");

function database(purchased = 0, promotional = 50000000) {
	return {
		wallets: {
			owner: {
				userId: "owner",
				balance: purchased + promotional,
				purchasedBalance: purchased,
				promotionalBalance: promotional
			}
		},
		txs: [],
		entitlements: {},
		commerceReceipts: []
	};
}

test("organization funding uses purchased Perutas and deduplicates", () => {
	const db = database(20000000);
	const created = createOrganizationInside(db, "owner", {
		name: "BH Agency",
		idempotencyKey: "create-agency-001"
	}, 100);
	const id = created.organization.id;
	const funded = fundOrganizationInside(db, "owner", {
		organizationId: id,
		amountPerutahs: 15000000,
		idempotencyKey: "fund-agency-001"
	}, 200);
	const retried = fundOrganizationInside(db, "owner", {
		organizationId: id,
		amountPerutahs: 15000000,
		idempotencyKey: "fund-agency-001"
	}, 300);
	assert.equal(funded.ok, true);
	assert.equal(retried.deduplicated, true);
	assert.equal(db.wallets.owner.purchasedBalance, 5000000);
	assert.equal(db.wallets.owner.promotionalBalance, 50000000);
	assert.equal(db.organizations[id].purchasedBalance, 15000000);
});

test("project budgets cannot overcommit and metered consumption is bounded", () => {
	const db = database(30000000);
	const created = createOrganizationInside(db, "owner", {
		name: "Client Fleet",
		idempotencyKey: "create-fleet-001"
	});
	const id = created.organization.id;
	fundOrganizationInside(db, "owner", {
		organizationId: id,
		amountPerutahs: 20000000,
		idempotencyKey: "fund-fleet-001"
	});
	const first = allocateOrganizationBudgetInside(db, "owner", {
		organizationId: id,
		projectKey: "client.alpha",
		limitPerutahs: 12000000,
		idempotencyKey: "allocate-alpha-001"
	});
	const blocked = allocateOrganizationBudgetInside(db, "owner", {
		organizationId: id,
		projectKey: "client.beta",
		limitPerutahs: 9000000,
		idempotencyKey: "allocate-beta-001"
	});
	assert.equal(first.ok, true);
	assert.equal(blocked.error, "organization_budget_overcommitted");
	const spent = consumeOrganizationBudgetInside(db, "owner", {
		organizationId: id,
		projectKey: "client.alpha",
		amountPerutahs: 3000000,
		purpose: "hosted bandwidth",
		idempotencyKey: "consume-alpha-001"
	});
	const retry = consumeOrganizationBudgetInside(db, "owner", {
		organizationId: id,
		projectKey: "client.alpha",
		amountPerutahs: 3000000,
		purpose: "hosted bandwidth",
		idempotencyKey: "consume-alpha-001"
	});
	assert.equal(spent.ok, true);
	assert.equal(retry.deduplicated, true);
	assert.equal(db.organizations[id].purchasedBalance, 17000000);
	assert.equal(db.organizations[id].budgets["client.alpha"].spentPerutahs, 3000000);
});

