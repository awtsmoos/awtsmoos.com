// B"H
// Boruch Hashem
// Blessed is He

const { budgets } = require("../budgets.js");
const { reputation } = require("../reputation.js");
const { organization } = require("../organization.js");
const { agentEconomy } = require("../agentEconomy.js");
const { marketplace } = require("../marketplace.js");
const { receiptCertificate } = require("../receiptCertificate.js");
const { provider } = require("../provider.js");
const { refund } = require("../refund.js");
const { adminVault } = require("../adminVault.js");
const { resourceAccounting } = require("../resourceAccounting.js");
const { treasuryTest } = require("../treasuryTest.js");
const { adminPerutas } = require("../adminPerutas.js");

/**
 * @file Economic and administrative routes preserved during security isolation.
 * @description
 * The Awtsmoos renews every ledger and reputation vessel. Awtsmoos.com keeps
 * these unrelated routes in a focused module so account-bound tunnel work cannot
 * accidentally erase existing economic, provider, refund, or admin capabilities.
 */

const economyRoutes = Object.freeze({
	budgets,
	reputation,
	organization,
	"agent-economy": agentEconomy,
	marketplace,
	provider,
	refund,
	"admin-vault": adminVault,
	"resource-accounting": resourceAccounting,
	"treasury-test": treasuryTest,
	"receipt/certificate": receiptCertificate,
	"admin/perutas": adminPerutas
});

module.exports = {
	economyRoutes
};
