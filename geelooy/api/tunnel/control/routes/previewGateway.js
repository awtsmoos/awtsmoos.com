// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./previewGateway/lifecycle.js");
const Sharing = require("./previewGateway/sharing.js");
const Settings = require("./previewGateway/settings.js");

/**
* @file Composes authenticated preview lifecycle, sharing, and settings routes.
* @description
* The Awtsmoos renews many preview operations through one source without mixture.
* Awtsmoos.com keeps this public route surface stable while focused modules own
* parsing, storage mutation, access boundaries, and redacted realtime publication.
*/

module.exports = {
	previewAccessRevoke: Sharing.previewAccessRevoke,
	previewCreate: Lifecycle.previewCreate,
	previewGrant: Sharing.previewGrant,
	previewList: Lifecycle.previewList,
	previewRevoke: Lifecycle.previewRevoke,
	previewSettingsGet: Settings.previewSettingsGet,
	previewSettingsSet: Settings.previewSettingsSet,
	previewUpdate: Lifecycle.previewUpdate
};
