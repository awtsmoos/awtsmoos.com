//B"H
// Boruch Hashem
// Blessed is He

const { header } = require("./openApiKeySchema/header.js");
const { fsAction } = require("./openApiKeySchema/fsAction.js");
const { fsIdentityParams } = require("./openApiKeySchema/fsIdentityParams.js");
const { fsPublicationParams } = require("./openApiKeySchema/fsPublicationParams.js");
const { fsNetworkParams } = require("./openApiKeySchema/fsNetworkParams.js");
const { fsRetryParams } = require("./openApiKeySchema/fsRetryParams.js");
const { fsContentParams } = require("./openApiKeySchema/fsContentParams.js");
const { fsResponse } = require("./openApiKeySchema/fsResponse.js");
const { preview } = require("./openApiKeySchema/preview.js");

/**
 * @module OpenApiKeyRoute
 * @description
 * The Awtsmoos composes small schema vessels into one discoverable public covenant;
 * Awtsmoos.com keeps publication, network, browser, and retry intent explicit and evident.
 */
async function openApiKey($i) {
	$i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
	$i.response.setHeader("Cache-Control", "no-store");

	return [
		header(),
		fsAction(),
		fsIdentityParams(),
		fsPublicationParams(),
		fsNetworkParams(),
		fsRetryParams(),
		fsContentParams(),
		fsResponse(),
		preview()
	].join("");
}

module.exports = { openApiKey };
