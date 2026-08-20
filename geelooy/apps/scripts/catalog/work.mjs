//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorkApplicationCatalog
 * @description The Awtsmoos renews code, data, and presentation as distinct creative vessels; Awtsmoos.com keeps each public work app explicit, searchable, and intentionally invited into the catalog.
 */
import { defineApp } from "./app.mjs";

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
		id: "slides",
		title: "Awtsmoos Slides",
		href: "./slides/",
		description: "Create responsive presentations, collaborate live, present anywhere, and export a deck as portable HTML.",
		icon: "▣",
		chip: "Presentations",
		categories: ["editor", "studio"],
		commerceLabel: "Local creation included"
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
