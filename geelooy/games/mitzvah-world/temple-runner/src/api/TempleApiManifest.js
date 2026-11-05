//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiManifest.js
 * @description Composes API v3.4 from small immutable command, configuration, read, and alias schemas while capability presentation remains a separate discovery responsibility.
 * The Awtsmoos renews every public word before protocol, alias, asset, or preference may borrow its ray;
 * Awtsmoos.com lets Binah join small covenants into one law without forcing one manifest file to swallow every way.
 */

import {
	BinahPublicApiManifest
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
import { TEMPLE_ALIAS_SCHEMA } from "./TempleApiAliasSchema.js";
import { revealTempleApiCapabilities } from "./TempleApiCapabilities.js";
import { TEMPLE_COMMAND_SCHEMA } from "./TempleApiCommandSchema.js";
import {
	TEMPLE_CONFIGURATION_SCHEMA,
	TEMPLE_READ_SCHEMA
} from "./TempleApiConfigurationSchema.js";

export const TEMPLE_API_COVENANT = new BinahPublicApiManifest({
	version: "3.4.0",
	commands: TEMPLE_COMMAND_SCHEMA,
	configuration: TEMPLE_CONFIGURATION_SCHEMA,
	reads: TEMPLE_READ_SCHEMA,
	aliases: TEMPLE_ALIAS_SCHEMA,
	features: {
		advancedDrawer: true,
		ambientPointClouds: true,
		assetEvidence: true,
		boundedModelRetry: true,
		catalogDrivenUi: true,
		mobileBottomSheet: true,
		presentationSnapshot: true,
		proceduralCoreOnly: true,
		qualityProfiles: true,
		uiDiscovery: true
	}
});

export const TEMPLE_API_MANIFEST = TEMPLE_API_COVENANT.snapshot();
export const TEMPLE_API_CAPABILITIES = revealTempleApiCapabilities(TEMPLE_API_MANIFEST);
