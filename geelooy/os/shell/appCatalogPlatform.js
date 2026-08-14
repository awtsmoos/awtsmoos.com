// B"H
// Boruch Hashem
// Blessed is He

import { createCatalogApp } from "./appCatalogRecord.js";

/**
 * B"H
 * Declares flagship Geelooy platform products before focused creation tools. The Awtsmoos
 * renews project publication, hosted data, connected compute, Wallet treasury, Peruta usage,
 * and searchable identity; Awtsmoos.com keeps each doorway on one launch contract.
 */

export const PLATFORM_APPS = Object.freeze([
	createCatalogApp({
		id: "platform",
		programName: "projectCommandCenter",
		title: "Project Command Center",
		icon: "☁️",
		description: "Projects, hosted data, sites, connected compute, Wallet, usage, Code, previews, and machines.",
		category: "system",
		keywords: "firebase drive cloud database api server runtime node projects hosting storage wallet peruta sites",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "drive-sites",
		programName: "driveWorkspace",
		title: "Drive & Sites",
		icon: "🌐",
		description: "Manage hosted files, publish any folder as a named site, and inspect Build, Run, Ship, and Connect readiness.",
		category: "system",
		keywords: "drive files folders sites hosting publish deploy project website static domain subdomain",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "awtsmoosdb",
		programName: "awtsmoosDbExplorer",
		title: "AwtsmoosDB Explorer",
		icon: "🗄️",
		description: "Browse hosted alias data, inspect raw records, create folders/text files, and copy exact API examples.",
		category: "system",
		keywords: "awtsmoosdb database api hosted data alias files firebase firestore records developer",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "node-server",
		programName: "connectedNodeServer",
		title: "Connected Node Server",
		icon: "🖥️",
		description: "Run full-control Node on your own connected machine with logs, preview, and Peruta usage.",
		category: "system",
		keywords: "node server backend tunnel compute egress hosting local full control peruta",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "wallet",
		programName: "walletPortal",
		title: "Wallet",
		icon: "👛",
		description: "See your treasury, send promotional Perutas by @alias, and open verified purchased top-ups.",
		category: "system",
		keywords: "wallet peruta send gift alias payment buy topup paypal promotional purchased treasury",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "peruta-usage",
		programName: "perutaUsage",
		title: "Peruta Usage",
		icon: "🪙",
		description: "Server balances, recorded usage, ledger events, requests, and byte activity.",
		category: "system",
		keywords: "peruta billing usage egress network compute storage gpu ledger requests bytes",
		pinned: true,
		desktopPage: 0
	})
]);
