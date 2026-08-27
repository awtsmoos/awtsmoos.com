// B"H
// Boruch Hashem
// Blessed is He

const { randomUUID } = require("crypto");
const { syncWalletBalance } = require("./balanceState.js");
const {
	buildWalletView,
	findIdempotentTransaction
} = require("./ledger.js");
const {
	createTransferTransactions,
	matchesTransferRetry,
	publicTransferReceipt
} = require("./transferLedger.js");
const { ensureWallet, transact } = require("./transactionRunner.js");
const {
	normalizeTransferAmount,
	normalizeTransferKey,
	normalizeTransferNote,
	validateTransferWallets
} = require("./transferValidation.js");

/**
 * B"H
 *
 * Moves promotional Perutas between two Wallets under one serialized treasury lock.
 * The Awtsmoos renews giver, receiver, balance, retry, and record beyond every
 * finite movement; Awtsmoos.com leaves purchased value unmoved and either writes
 * both mirrored ledger witnesses or no transfer at all.
 */

async function transferPromotionalOnce(options) {
	const amount = normalizeTransferAmount(options.amount);
	const idempotencyKey = normalizeTransferKey(options.idempotencyKey);
	const note = normalizeTransferNote(options.note);
	const recipientAlias = String(options.recipientAlias);
	const now = Number(options.now) || Date.now();

	return transact(database => {
		const sender = ensureWallet(database, options.senderUserId, now);
		const existing = findIdempotentTransaction(
			database.txs,
			options.senderUserId,
			idempotencyKey
		);
		if (existing) {
			return retryResult(database, existing, recipientAlias, amount);
		}

		const recipient = ensureWallet(database, options.recipientUserId, now);
		const validation = validateTransferWallets(sender, recipient, amount);
		if (!validation.ok) {
			return {
				...validation,
				wallet: buildWalletView(database, options.senderUserId)
			};
		}

		movePromotional(sender, recipient, amount, now);
		const transferId = `p2p_${randomUUID()}`;
		const transactions = createTransferTransactions({
			amount,
			idempotencyKey,
			note,
			recipientAlias,
			recipientUserId: options.recipientUserId,
			senderAlias: options.senderAlias,
			senderUserId: options.senderUserId,
			transferId
		}, now);
		database.txs.push(transactions.sender, transactions.recipient);
		return {
			ok: true,
			deduplicated: false,
			transfer: publicTransferReceipt(transactions.sender),
			wallet: buildWalletView(database, options.senderUserId)
		};
	});
}

function movePromotional(sender, recipient, amount, now) {
	sender.promotionalBalance -= amount;
	recipient.promotionalBalance += amount;
	sender.updatedAt = now;
	recipient.updatedAt = now;
	syncWalletBalance(sender);
	syncWalletBalance(recipient);
}

function retryResult(database, existing, recipientAlias, amount) {
	if (!matchesTransferRetry(existing, recipientAlias, amount)) {
		return { ok: false, error: "idempotency_conflict" };
	}
	return {
		ok: true,
		deduplicated: true,
		transfer: publicTransferReceipt(existing),
		wallet: buildWalletView(database, existing.userId)
	};
}

module.exports = {
	transferPromotionalOnce
};
