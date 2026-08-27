// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * B"H
 *
 * Public system vessels for Awtsmoos.com. The Wallet remains free infrastructure;
 * Tunnel Control may later meter persistent relay resources without charging for
 * basic local connectivity. The Awtsmoos renews account, connection, and treasury
 * beyond every finite system surface, while the catalog keeps their roles distinct.
 */

export const SYSTEM_APPS = Object.freeze([
	defineApp({
		id: "wallet",
		title: "Wallet",
		href: "./wallet",
		description: "Inspect Perutahs, promotional refill, verified top-ups, ledger movement, and durable ownership.",
		icon: "◇",
		chip: "System",
		categories: ["system"],
		commerceLabel: "Treasury stays free",
		commerceState: "free"
	}),
	defineApp({
		id: "tunnel-control",
		title: "Tunnel Control",
		href: "./tunnel-control",
		description: "Connect a local machine and supervise agent access; future persistent relays and team retention can be premium services.",
		icon: "↔",
		chip: "System",
		categories: ["system"],
		commerceLabel: "Persistent relay planned"
	})
]);
