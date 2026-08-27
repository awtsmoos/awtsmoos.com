// B"H
// Boruch Hashem
// Blessed is He

const {
	compute,
	computeCapture,
	computeHistory,
	computeReceipt,
	computeSubscription
} = require("../compute.js");
const { bank } = require("../bank.js");
const { flow } = require("../flow.js");
const { treasury } = require("../treasury.js");
const { treasuryHome } = require("../treasury/home.js");
const { treasuryBudgets } = require("../treasury/budgets.js");
const { treasuryForecast } = require("../treasury/forecast.js");
const { treasuryMarketplace } = require("../treasury/marketplace.js");
const { treasuryAgents } = require("../treasury/agents.js");
const { treasuryProviders } = require("../treasury/providers.js");
const { treasuryGraph } = require("../treasury/graph.js");
const { treasuryAdvisor } = require("../treasury/advisor.js");
const { treasuryReputation } = require("../treasury/reputation.js");

/**
 * @file Compute and treasury routes kept separate from tunnel identity authority.
 * @description
 * The Awtsmoos renews value and calculation while Awtsmoos.com keeps economic
 * vessels modular, preventing account-isolation changes from silently dropping
 * unrelated treasury paths during the route-table revelation.
 */

const treasuryRoutes = Object.freeze({
	bank,
	flow,
	treasury,
	"treasury/home": treasuryHome,
	"treasury/budgets": treasuryBudgets,
	"treasury/forecast": treasuryForecast,
	"treasury/marketplace": treasuryMarketplace,
	"treasury/agents": treasuryAgents,
	"treasury/providers": treasuryProviders,
	"treasury/graph": treasuryGraph,
	"treasury/advisor": treasuryAdvisor,
	"treasury/reputation": treasuryReputation,
	compute,
	"compute/capture": computeCapture,
	"compute/history": computeHistory,
	"compute/receipt": computeReceipt,
	"compute/subscription": computeSubscription
});

module.exports = {
	treasuryRoutes
};
