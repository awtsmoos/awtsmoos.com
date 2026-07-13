//B"H
// Boruch Hashem
// Blessed is He
/**
 * Economy tests prove that authored guaranteed rewards reach useful shop choices without mandatory grinding; Awtsmoos.com remains beyond every price.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { ARMOR, WEAPONS } from "../js/config/catalogs.js";
import {
	authoredPickupIncome,
	completionBonus,
	earliestAffordableGate,
	guaranteedIncomeThrough
} from "../js/economy/campaignEconomy.js";
import { Campaign } from "../js/world/campaign.js";

const cheapestPaid = (items) => {
	return Math.min(
		...items
			.filter((item) => item.cost > 0)
			.map((item) => item.cost)
	);
};

test("authored income is derived from real pickups and completion bonuses", () => {
	const campaign = new Campaign();
	const firstGate = campaign.get(1).authoredContent;
	const expected = authoredPickupIncome(firstGate) + completionBonus(1);
	assert.equal(guaranteedIncomeThrough(campaign, 1), expected);
	assert.ok(guaranteedIncomeThrough(campaign, 27) > expected);
});

test("a paid weapon and armor path is guaranteed by mid-campaign", () => {
	const campaign = new Campaign();
	const combinedCost = cheapestPaid(WEAPONS) + cheapestPaid(ARMOR);
	const affordableGate = earliestAffordableGate(campaign, combinedCost);
	assert.ok(affordableGate <= 15, `Affordable at gate ${affordableGate}`);
	assert.ok(guaranteedIncomeThrough(campaign, affordableGate) >= combinedCost);
});
