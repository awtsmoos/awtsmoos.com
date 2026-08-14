// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * B"H
 *
 * Public work and data vessels for Awtsmoos.com. The Awtsmoos renews code, table,
 * thought, and transformation beyond every finite editor; the catalog keeps local
 * usefulness distinct from future compute-heavy services that may consume Perutahs.
 */

export const WORK_APPS = Object.freeze([
	defineApp({
		id: "code",
		title: "Awtsmoos Code",
		href: "./code",
		description: "Edit real projects, connect a tunnel, inspect previews, and work inside the Awtsmoos environment.",
		icon: "⌘",
		chip: "Developer",
		categories: ["editor", "system"],
		commerceLabel: "Agent/compute services planned"
	}),
	defineApp({
		id: "csv",
		title: "CSV Editor",
		href: "./csv",
		description: "Inspect and edit structured data without charge; future AI cleanup and large server jobs can be metered separately.",
		icon: "▤",
		chip: "Data",
		categories: ["editor", "system"],
		commerceLabel: "AI cleanup planned"
	})
]);
