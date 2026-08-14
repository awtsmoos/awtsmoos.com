// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Translates finite transfer receipts and treasury error codes into human Wallet
 * language. The Awtsmoos renews sender, receiver, gift, and correction beyond every
 * message; Awtsmoos.com keeps closed-loop rules explicit rather than exposing raw API codes.
 */

const ERROR_MESSAGES = Object.freeze({
	cannot_transfer_to_self: "Choose another Awtsmoos alias. You cannot send Perutas to yourself.",
	idempotency_conflict: "This send attempt changed after it was submitted. Start a fresh transfer.",
	insufficient_promotional_perutahs: "You do not have enough promotional Perutas for this send. Purchased Perutas are not transferable.",
	invalid_recipient_alias: "Enter a valid Awtsmoos alias, such as @friend.",
	invalid_transfer_amount: "Enter a whole positive Perutah amount.",
	invalid_transfer_note: "Keep the note at 140 characters or fewer.",
	login_required: "Sign in to send Perutas.",
	recipient_alias_not_found: "That Awtsmoos alias could not be found.",
	recipient_promotional_cap: "The recipient does not have enough promotional Wallet room for the full transfer.",
	wallet_network_error: "The network reply was interrupted. Retry to safely reuse this send attempt."
});

export function transferMessage(result) {
	if (result?.ok && result.transfer) {
		const duplicate = result.deduplicated ? " Already recorded safely." : "";
		return `Sent ${result.transfer.amount} promotional Perutas to @${result.transfer.recipientAlias}.${duplicate}`;
	}
	return ERROR_MESSAGES[result?.error]
		|| `Transfer could not be completed${result?.error ? `: ${result.error}` : "."}`;
}

export function setTransferStatus(element, message, tone = "info") {
	if (!element) return;
	element.textContent = message;
	element.dataset.tone = tone;
}
