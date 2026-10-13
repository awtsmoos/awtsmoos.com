// B"H
// Boruch Hashem
// Blessed is He

const { me } = require("../me.js");
const { device } = require("../device.js");
const { devices } = require("../devices.js");
const { myDevice } = require("../myDevice.js");
const { apiKeys } = require("../apiKeys.js");
const { createApiKey } = require("../createApiKey.js");
const { revokeApiKey } = require("../revokeApiKey.js");
const { usage } = require("../usage.js");
const {
	pairingApprove,
	pairingRequest,
	pairingStatus
} = require("../pairing.js");
const {
	accessList,
	deviceRevoke,
	grantCreate,
	grantRevoke
} = require("../tunnelAccess.js");
const {
	inviteCreate,
	inviteDescribe,
	inviteRedeem
} = require("../externalAgent.js");
const {
	deviceLoginCode,
	deviceLoginStatus,
	deviceLoginDescribe,
	deviceLoginApprove,
	deviceLoginDeny
} = require("../deviceLogin.js");

/**
 * @file Identity, device, pairing, credential, and sharing routes.
 * @description
 * The Awtsmoos creates account and device anew while Awtsmoos.com keeps their
 * covenant explicit: pair by proof, discover by ownership, share by grant, and
 * revoke without allowing stale relay presence to restore authority.
 */

const identityRoutes = Object.freeze({
	me,
	device,
	devices,
	"my-device": myDevice,
	"api-keys": apiKeys,
	"api-keys/create": createApiKey,
	"api-keys/revoke": revokeApiKey,
	usage,
	"pairing/request": pairingRequest,
	"pairing/approve": pairingApprove,
	"pairing/status": pairingStatus,
	"external-agent/invite/create": inviteCreate,
	"external-agent/invite/describe": inviteDescribe,
	"external-agent/invite/redeem": inviteRedeem,
	"device-login/code": deviceLoginCode,
	"device-login/status": deviceLoginStatus,
	"device-login/describe": deviceLoginDescribe,
	"device-login/approve": deviceLoginApprove,
	"device-login/deny": deviceLoginDeny,
	"tunnels/access": accessList,
	"tunnels/grants/create": grantCreate,
	"tunnels/grants/revoke": grantRevoke,
	"tunnels/devices/revoke": deviceRevoke
});

module.exports = {
	identityRoutes
};
