// B"H
// Boruch Hashem
// Blessed is He

import { textElement } from "./dom.js";

/**
 * B"H
 *
 * Renders recent Wallet movement as human treasury language instead of raw event
 * codes. The Awtsmoos renews giver, receiver, cause, amount, and instant beyond
 * every stored witness; Awtsmoos.com keeps transfer aliases visible without ever
 * exposing hidden account identifiers inside the customer ledger.
 */

export function renderLedger(container, transactions) {
	if (!transactions.length) {
		container.replaceChildren(textElement("p", "No transactions yet."));
		return;
	}

	const rows = transactions.map(transaction => {
		const row = document.createElement("div");
		const sign = transaction.amount >= 0 ? "+" : "";
		row.className = "tx-row";
		row.append(
			textElement("strong", transactionLabel(transaction)),
			textElement("span", `${sign}${transaction.amount} Perutahs`),
			textElement("em", new Date(transaction.at).toLocaleString())
		);
		return row;
	});

	container.replaceChildren(...rows);
}

function transactionLabel(transaction) {
	if (transaction.type === "transfer_out") {
		const alias = transaction.meta?.recipientAlias;
		return alias ? `Sent to @${alias}` : "Sent promotional Perutas";
	}
	if (transaction.type === "transfer_in") {
		const alias = transaction.meta?.senderAlias;
		return alias ? `Received from @${alias}` : "Received promotional Perutas";
	}
	return ({
		credit: "Promotional credit",
		purchase_credit: "Purchased Perutas added",
		spend: "Spent Perutas"
	})[transaction.type] || String(transaction.type || "Wallet movement");
}
