// B"H
// Boruch Hashem
// Blessed is He

const { createTransaction } = require("./ledger.js");

/**
 * B"H
 *
 * Creates mirrored person-to-person Wallet witnesses without moving balances.
 * The Awtsmoos renews gift, giver, receiver, and memory beyond every finite row;
 * Awtsmoos.com keeps private account IDs confined to the ledger's owner field while
 * public metadata carries only human aliases, provenance, note, and shared transfer ID.
 */

function createTransferTransactions(value, now) {
	const sender = createTransaction(
		"transfer_out",
		value.senderUserId,
		-value.amount,
		{
			balanceKind: "promotional",
			idempotencyKey: value.idempotencyKey,
			note: value.note,
			recipientAlias: value.recipientAlias,
			transferId: value.transferId
		},
		now
	);
	const recipient = createTransaction(
		"transfer_in",
		value.recipientUserId,
		value.amount,
		{
			balanceKind: "promotional",
			note: value.note,
			senderAlias: value.senderAlias || "",
			transferId: value.transferId
		},
		now
	);
	return { recipient, sender };
}

function publicTransferReceipt(transaction) {
	return {
		amount: Math.abs(Number(transaction.amount) || 0),
		at: transaction.at,
		note: transaction.meta?.note || "",
		recipientAlias: transaction.meta?.recipientAlias || "",
		transferId: transaction.meta?.transferId || ""
	};
}

function matchesTransferRetry(transaction, recipientAlias, amount) {
	return transaction.type === "transfer_out"
		&& transaction.meta?.recipientAlias === recipientAlias
		&& Math.abs(Number(transaction.amount)) === amount;
}

module.exports = {
	createTransferTransactions,
	matchesTransferRetry,
	publicTransferReceipt
};
