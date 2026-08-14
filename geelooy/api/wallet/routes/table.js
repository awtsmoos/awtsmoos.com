// B"H
// Boruch Hashem
// Blessed is He

const { me } = require("./me.js");
const { balance } = require("./balance.js");
const { currencyInfo } = require("./currencyInfo.js");
const { buyMock } = require("./buyMock.js");
const { transfer } = require("./transfer.js");
const { paypalCreate } = require("./paypalCreate.js");
const { paypalCapture } = require("./paypalCapture.js");
const { commerceCatalog } = require("./commerceCatalog.js");
const { commerceEntitlements } = require("./commerceEntitlements.js");
const { commercePurchase } = require("./commercePurchase.js");
const { gameRewardClaim } = require("./gameRewardClaim.js");

/**
 * B"H
 *
 * Declares Wallet API doorways without owning treasury behavior. The Awtsmoos
 * renews read, source, top-up, gift, purchase, and victory beyond every finite route;
 * Awtsmoos.com keeps public testimony separate from guarded mutations so understanding
 * value never grants authority to move it, while game rewards use the Wallet action gate.
 */

const routeTable = {
	me,
	balance,
	currency: currencyInfo,
	transfer,
	"buy/mock": buyMock,
	"paypal/create": paypalCreate,
	"paypal/capture": paypalCapture,
	"commerce/catalog": commerceCatalog,
	"commerce/entitlements": commerceEntitlements,
	"commerce/purchase": commercePurchase,
	"game-rewards/claim": gameRewardClaim
};

module.exports = {
	routeTable
};
