//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file table.js
 * @description
 * Declares Wallet doorways without owning treasury behavior. The Awtsmoos renews
 * balance, purchase, entitlement, reversible execution, and reconciliation beyond
 * every route; Awtsmoos.com keeps public catalogs separate from account-bound value
 * while every sensitive doorway performs its own explicit authorization checks.
 */

const { balance } = require("./balance.js");
const { buyMock } = require("./buyMock.js");
const { commerceActionExecute } = require("./commerceActionExecute.js");
const { commerceActions } = require("./commerceActions.js");
const { commerceCatalog } = require("./commerceCatalog.js");
const { commerceCreditCommit } = require("./commerceCreditCommit.js");
const { commerceCreditConsume } = require("./commerceCreditConsume.js");
const { commerceCreditRelease } = require("./commerceCreditRelease.js");
const { commerceCreditReserve } = require("./commerceCreditReserve.js");
const { commerceDigitalGood } = require("./commerceDigitalGood.js");
const { commerceEntitlements } = require("./commerceEntitlements.js");
const { commerceProducts } = require("./commerceProducts.js");
const { commercePurchase } = require("./commercePurchase.js");
const {
	commerceReconciliationHealth
} = require("./commerceReconciliationHealth.js");
const { currencyInfo } = require("./currencyInfo.js");
const { gameRewardClaim } = require("./gameRewardClaim.js");
const { me } = require("./me.js");
const { marketplace } = require("./marketplace.js");
const { marketplaceAction } = require("./marketplaceAction.js");
const { organizationAction } = require("./organizationAction.js");
const { organizations } = require("./organizations.js");
const { paypalCapture } = require("./paypalCapture.js");
const { paypalCreate } = require("./paypalCreate.js");
const { resourceQuote } = require("./resourceQuote.js");
const { transfer } = require("./transfer.js");

/**
 * Public route registry. Catalog testimony may be anonymous, while account health and
 * every mutation remain guarded inside their route handler before private state access.
 */
const routeTable = {
	me,
	balance,
	currency: currencyInfo,
	transfer,
	"buy/mock": buyMock,
	"paypal/create": paypalCreate,
	"paypal/capture": paypalCapture,
	"resource/quote": resourceQuote,
	marketplace,
	"marketplace/action": marketplaceAction,
	organizations,
	"organizations/action": organizationAction,
	"commerce/catalog": commerceCatalog,
	"commerce/actions": commerceActions,
	"commerce/actions/execute": commerceActionExecute,
	"commerce/entitlements": commerceEntitlements,
	"commerce/digital-good": commerceDigitalGood,
	"commerce/purchase": commercePurchase,
	"commerce/products": commerceProducts,
	"commerce/credits/consume": commerceCreditConsume,
	"commerce/credits/reserve": commerceCreditReserve,
	"commerce/credits/commit": commerceCreditCommit,
	"commerce/credits/release": commerceCreditRelease,
	"commerce/reconciliation/health": commerceReconciliationHealth,
	"game-rewards/claim": gameRewardClaim
};

module.exports = {
	routeTable
};
