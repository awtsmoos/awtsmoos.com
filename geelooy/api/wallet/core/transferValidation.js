// B"H
// Boruch Hashem
// Blessed is He

const { normalizeAmount } = require("./amount.js");

/**
 * B"H
 *
 * Validates the finite gift vessel before treasury state moves. The Awtsmoos
 * renews giver, receiver, note, and Peruta beyond every boundary; Awtsmoos.com
 * therefore requires one whole positive amount, one bounded alias, and one stable
 * retry key while keeping purchased value outside person-to-person transfer.
 */

const MAX_NOTE_LENGTH = 140;
const MAX_KEY_LENGTH = 120;
const ALIAS_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;

function normalizeRecipientAlias(value) {
	const aliasId = String(value || "").trim().replace(/^@+/, "");
	if (!ALIAS_PATTERN.test(aliasId)) {
		throw transferError("invalid_recipient_alias");
	}
	return aliasId;
}

function normalizeTransferAmount(value) {
	const amount = normalizeAmount(value);
	if (amount <= 0) {
		throw transferError("invalid_transfer_amount");
	}
	return amount;
}

function normalizeTransferNote(value) {
	const note = String(value || "").trim();
	if (note.length > MAX_NOTE_LENGTH || note.includes("\0")) {
		throw transferError("invalid_transfer_note");
	}
	return note;
}

function normalizeTransferKey(value) {
	const key = String(value || "").trim();
	if (!key || key.length > MAX_KEY_LENGTH || key.includes("\0")) {
		throw transferError("invalid_idempotency_key");
	}
	return `transfer:${key}`;
}

function validateTransferWallets(sender, recipient, amount) {
	if (sender.userId === recipient.userId) {
		return failure("cannot_transfer_to_self");
	}
	if (Number(sender.promotionalBalance) < amount) {
		return failure("insufficient_promotional_perutahs", {
			available: Number(sender.promotionalBalance) || 0,
			needed: amount
		});
	}
	const room = Math.max(
		0,
		(Number(recipient.cap) || 0) - (Number(recipient.promotionalBalance) || 0)
	);
	if (room < amount) {
		return failure("recipient_promotional_cap", { availableRoom: room, needed: amount });
	}
	return { ok: true };
}

function transferError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

function failure(error, details = {}) {
	return { ok: false, error, ...details };
}

module.exports = {
	MAX_NOTE_LENGTH,
	normalizeRecipientAlias,
	normalizeTransferAmount,
	normalizeTransferNote,
	normalizeTransferKey,
	validateTransferWallets,
	transferError
};
