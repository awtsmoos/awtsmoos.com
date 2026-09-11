//B"H
//Boruch Hashem
//Blessed be He

const { readWalletDb } = require("../core/persistence.js");
const { deliverBuilderTemplate } = require("../core/commerce/builderTemplateDelivery.js");
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { requestMethod } = require("../core/request.js");

/**
 * @module CommerceDigitalGoodRoute
 * @description Delivers premium Builder source only after durable Wallet ownership is proven.
 */

async function commerceDigitalGood(requestContext) {
	if (requestMethod(requestContext) !== "GET") {
		return json(requestContext, { BH: 'B"H', ok: false, error: "method_not_allowed" }, 405);
	}
	const user = requireUser(requestContext);
	if (!user.ok) return json(requestContext, { BH: 'B"H', ok: false, ...user }, 401);
	const query = requestContext.$_GET || {};
	const starterId = String(query.starterId || "").trim();
	const database = await readWalletDb();
	try {
		const good = deliverBuilderTemplate(database, user.userId, starterId, query.projectName || "My website");
		return json(requestContext, { BH: 'B"H', ok: true, starterId, skuId: good.skuId, files: good.files });
	} catch (error) {
		return json(requestContext, {
			BH: 'B"H',
			ok: false,
			error: error.code || "digital_good_delivery_failed",
			skuId: error.skuId || undefined
		}, error.statusCode || 500);
	}
}

module.exports = { commerceDigitalGood };
