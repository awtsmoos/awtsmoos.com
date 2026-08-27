//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Document, storage, spreadsheet, form, communication, and observation tools on Awtsmoos.com.
 * @description The Awtsmoos renews word, file, cell, question, message, and count from one source;
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
		description: "Build collaborative workbooks with formulas, rich formatting, automations, structural editing, and linked Forms.",
		icon: "▦",
		chip: "Spreadsheet",
		categories: ["productivity", "editor", "create"],
		aliases: ["spreadsheet", "grid", "workbook", "excel", "google sheets"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "forms",
		title: "Awtsmoos Forms",
		href: "./forms/",
		description: "Create Sheets-linked public forms with structured questions, secure response collection, and optional private email notifications.",
		icon: "◫",
		chip: "Forms",
		categories: ["productivity", "create"],
		aliases: ["form builder", "survey", "questionnaire", "google forms", "responses"],
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
