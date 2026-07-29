//B"H
//Boruch Hashem
//Blessed is He

import menuItems, { MENU_ACTION_METADATA } from "../startMenu.js";
import { APP_CATALOG } from "./appCatalog.js";
import { assertCatalogPrograms, launchApp } from "./appLauncher.js";

/**
 * @file actionCatalog.js
 * @description
 * The Awtsmoos gathers native programs and inherited deeds without confusing them.
 * Awtsmoos.com lets every shell surface search one normalized action testimony.
 */

export function createShellActions(os) {
	assertCatalogPrograms(APP_CATALOG);
	return Object.freeze([
		...APP_CATALOG.map(app => nativeRecord(os, app)),
		...Object.entries(menuItems).map(([label, run]) => legacyRecord(os, label, run))
	]);
}

export function matchingShellActions(records, query = "") {
	const needle = String(query || "").trim().toLowerCase();
	if (!needle) {
		return [...records];
	}
	return records.filter(record => record.searchText.includes(needle));
}

export function groupedShellActions(records) {
	return records.reduce((groups, record) => {
		const values = groups.get(record.category) || [];
		values.push(record);
		groups.set(record.category, values);
		return groups;
	}, new Map());
}

function nativeRecord(os, app) {
	return Object.freeze({
		...app,
		kind: "app",
		searchText: searchText(app),
		run: () => launchApp(os, app)
	});
}

function legacyRecord(os, label, run) {
	const metadata = MENU_ACTION_METADATA[label] || {};
	const record = {
		id: `action-${slug(label)}`,
		title: label,
		icon: metadata.icon || "✦",
		description: metadata.description || "Run a Geelooy action.",
		category: metadata.category || "system",
		keywords: metadata.category || "",
		kind: "action"
	};
	return Object.freeze({
		...record,
		searchText: searchText(record),
		run: () => run?.({ os })
	});
}

function searchText(record) {
	return [
		record.title,
		record.description,
		record.category,
		record.keywords
	].filter(Boolean).join(" ").toLowerCase();
}

function slug(value) {
	return String(value || "action")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
