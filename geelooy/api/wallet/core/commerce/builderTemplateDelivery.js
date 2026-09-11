//B"H
//Boruch Hashem
//Blessed be He

const { templateAccess } = require("./builderTemplateAccess.js");
const { buildBuilderTemplate } = require("./builderTemplates/catalog.js");

/**
 * @module BuilderTemplateDelivery
 * @description Resolves one durable entitlement into one protected editable source package.
 */

function deliverBuilderTemplate(database, userId, starterId, projectName) {
	const access = templateAccess(database, userId, starterId);
	if (!access.exists) throw deliveryError("digital_good_not_found", 404);
	if (!access.owned) throw deliveryError("digital_good_not_owned", 403, access.template.skuId);
	const good = buildBuilderTemplate(starterId, projectName);
	if (!good) throw deliveryError("digital_good_not_found", 404);
	return good;
}

function deliveryError(code, statusCode, skuId = null) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	error.skuId = skuId;
	return error;
}

module.exports = { deliverBuilderTemplate };
