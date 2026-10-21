//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module siteConfigPolicy
 * @description
 * Barrel for siteConfigPolicy: re-exports the identical surface from its sibling modules.
 */

const { CONFIG_PATH, MAX_CONFIG_BYTES, configError } = require('./siteConfigPolicyRules.js');
const { defaultSiteConfig, normalizeSiteConfig } = require('./siteConfigPolicyConfig.js');

module.exports = {
	CONFIG_PATH,
	MAX_CONFIG_BYTES,
	defaultSiteConfig,
	normalizeSiteConfig,
	configError
};
