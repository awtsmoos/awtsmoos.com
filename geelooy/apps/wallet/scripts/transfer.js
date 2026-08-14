// B"H
// Boruch Hashem
// Blessed is He

import { postWalletJson } from "./client.js";
import {
	setTransferStatus,
	transferMessage
} from "./transferView.js";

/**
 * B"H
 *
 * Coordinates one deliberate promotional Peruta gift from the Wallet page. The
 * Awtsmoos renews alias, retry key, click, and response beyond every browser event;
 * Awtsmoos.com reuses one idempotency key after uncertain network replies so a
 * human retry cannot silently double-send a gift that already reached the server.
 */

export function bindTransfer(options = {}) {
	const form = document.getElementById("transferForm");
	const button = document.getElementById("transferBtn");
	const status = document.getElementById("transferStatus");
	const recipient = document.getElementById("recipientAlias");
	const amount = document.getElementById("transferAmount");
	const note = document.getElementById("transferNote");
	let retryKey = "";

	if (!form || !button || !status || !recipient || !amount || !note) {
		return () => {};
	}

	async function submit(event) {
		event.preventDefault();
		const alias = recipient.value.trim();
		const value = Number(amount.value);
		if (!alias || !Number.isFinite(value) || value <= 0) {
			setTransferStatus(status, "Enter a recipient @alias and a positive whole Perutah amount.", "error");
			return;
		}

		retryKey ||= createRetryKey();
		button.disabled = true;
		setTransferStatus(status, `Sending ${Math.floor(value)} promotional Perutas to ${formatAlias(alias)}…`);
		const result = await postWalletJson("/api/wallet/transfer", {
			amount: Math.floor(value),
			idempotencyKey: retryKey,
			note: note.value,
			recipientAlias: alias
		});
		const uncertain = result.error === "wallet_network_error";
		setTransferStatus(status, transferMessage(result), result.ok ? "success" : "error");

		if (result.ok) {
			recipient.value = "";
			amount.value = "25";
			note.value = "";
			retryKey = "";
			await options.onSuccess?.(result);
		} else if (!uncertain) {
			retryKey = "";
		}
		button.disabled = false;
	}

	form.addEventListener("submit", submit);
	return () => form.removeEventListener("submit", submit);
}

function createRetryKey() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `wallet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatAlias(value) {
	return `@${String(value).replace(/^@+/, "")}`;
}
