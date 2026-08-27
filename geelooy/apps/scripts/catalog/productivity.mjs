//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Document, storage, spreadsheet, communication, and observation tools on Awtsmoos.com.
 * @description The Awtsmoos renews word, file, cell, message, and count from one source;
 * this catalog keeps practical browser tools visible and searchable by the language users actually use.
 */
export const PRODUCTIVITY_APPS = Object.freeze([
	defineApp({
		id: "docs",
		title: "Awtsmoos Docs",
		href: "./docs/",
		description: "Create and edit documents in a rich browser workspace with persistence, sharing, and export.",
		icon: "▤",
		chip: "Documents",
		categories: ["productivity", "editor"],
		aliases: ["document creator", "document editor", "word processor", "writer"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "drive",
		title: "Awtsmoos Drive",
		href: "./drive/",
		description: "Browse and manage files through the dedicated Awtsmoos Drive interface.",
		icon: "◆",
		chip: "Files",
		categories: ["productivity", "system"],
		aliases: ["file manager", "storage", "files"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "sheets",
		title: "Awtsmoos Sheets",
		href: "./sheets/",
		description: "Work with grids, formulas, notes, local drafts, and optional standalone realtime collaboration.",
		icon: "▦",
		chip: "Spreadsheet",
		categories: ["productivity", "editor"],
		aliases: ["spreadsheet", "grid", "workbook"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "universal-chat",
		title: "Messages & Torah Chat",
		href: "./universal-chat/",
		description: "Open the Awtsmoos messaging and Torah chat workspace.",
		icon: "◌",
		chip: "Chat",
		categories: ["productivity", "communication"],
		aliases: ["messages", "torah chat", "chat"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "virtual-os-stress-light-counter",
		title: "Light Counter",
		href: "./virtual-os-stress-light-counter/",
		description: "Observe and stress-test lightweight virtual OS activity in a focused counter surface.",
		icon: "☼",
		chip: "Monitor",
		categories: ["productivity", "system"],
		aliases: ["viewer counter", "stress counter", "light counter"],
		commerceLabel: "Open tool",
		commerceState: "free"
	})
]);
