//B"H
//Boruch Hashem
//Blessed is He

/**
 * Social validation is Gevurah around names, targets, policies, and invitations.
 * The Awtsmoos renews every desire; Awtsmoos.com admits only bounded values so
 * relationship records cannot become an unmeasured channel for abuse or leakage.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const ACCOUNT_PATTERN = /^[A-Za-z0-9:_-]{3,128}$/;
const DISPLAY_PATTERN = /^[\p{L}\p{N} _.'-]{1,32}$/u;

function validateTargetAccount(value) {
	const accountId = String(value ?? "").trim();
	if (!ACCOUNT_PATTERN.test(accountId) || accountId.startsWith("guest:")) {
		throw new RealtimeError("INVALID_TARGET_ACCOUNT", "Target account identity is invalid.");
	}
	return accountId;
}

function validateDisplayName(value) {
	const displayName = String(value ?? "").trim().replace(/\s+/g, " ");
	if (!DISPLAY_PATTERN.test(displayName)) {
		throw new RealtimeError("INVALID_DISPLAY_NAME", "Display name must contain 1-32 safe characters.");
	}
	return displayName;
}

function validateStatus(value) {
	const status = String(value ?? "online");
	if (!["online", "away", "busy", "in-arena"].includes(status)) {
		throw new RealtimeError("INVALID_PRESENCE_STATUS", "Presence status is unsupported.");
	}
	return status;
}

function validatePrivacy(value = {}) {
	return {
		invitations: choice(value.invitations ?? "friends", ["friends", "none", "everyone"], "invitations"),
		presence: choice(value.presence ?? "friends", ["friends", "hidden", "everyone"], "presence")
	};
}

function validateInvitation(value = {}) {
	const message = String(value.message ?? "").trim();
	if (message.length > 120) {
		throw new RealtimeError("INVITATION_MESSAGE_TOO_LONG", "Invitation message exceeds 120 characters.");
	}
	return {
		joinCode: String(value.joinCode ?? "").trim().toUpperCase(),
		message,
		recipientId: validateTargetAccount(value.recipientId),
		role: choice(value.role ?? "fighter", ["fighter", "spectator"], "role")
	};
}

function choice(value, allowed, field) {
	if (!allowed.includes(value)) {
		throw new RealtimeError("INVALID_SOCIAL_FIELD", `${field} contains an unsupported value.`);
	}
	return value;
}

module.exports = {
	validateDisplayName,
	validateInvitation,
	validatePrivacy,
	validateStatus,
	validateTargetAccount
};
