// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * Public flagship creation/runtime studios that already have complete browser
 * entrypoints. Keeping them explicit prevents mature products from disappearing
 * merely because their source trees are deeper than older catalog categories.
 */
export const PLATFORM_STUDIOS = Object.freeze([
	defineApp({
		id: "awtsmoos-studio",
		title: "Awtsmoos Studio",
		href: "./awtsmoos-studio/",
		description: "Direct cinematic and interactive projects in the flagship Awtsmoos creative workspace.",
		icon: "✦",
		chip: "Flagship Studio",
		categories: ["create", "studio", "media"],
		aliases: ["movie studio", "creative studio", "director"],
		commerceLabel: "Local creation included",
		commerceState: "free"
	}),
	defineApp({
		id: "mitzvah-studio",
		title: "Mitzvah Studio",
		href: "./mitzvah-studio/",
		description: "Create mitzvah-centered interactive media through a focused browser studio.",
		icon: "✧",
		chip: "Mitzvah Studio",
		categories: ["create", "studio"],
		aliases: ["mitzvah creator", "mitzvah media"],
		commerceLabel: "Local creation included",
		commerceState: "free"
	}),
	defineApp({
		id: "universal-procedural",
		title: "Universal Procedural",
		href: "./universal-procedural/",
		description: "Explore semantic procedural generation through one reusable doorway into many possible worlds.",
		icon: "◌",
		chip: "Procedural",
		categories: ["create", "developer", "studio"],
		aliases: ["procedural generation", "world generation", "semantic world"],
		commerceLabel: "Local exploration included",
		commerceState: "free"
	})
]);
