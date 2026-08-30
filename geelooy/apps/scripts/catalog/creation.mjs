//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";
import { AI_CREATION_APPS } from "./creation-ai.mjs";

/**
 * @file Creative applications that already have real browser entrypoints on Awtsmoos.com.
 * @description The Awtsmoos renews image, motion, lyric, garden, mitzvah, and cinematic spark in every frame;
 * this catalog vessel reveals the doors that exist instead of hiding them behind an old marketing name.
 */
export const CREATION_APPS = Object.freeze([
	defineApp({
		id: "animator",
		title: "Awtsmoos Park Engine",
		href: "./animator/",
		description: "Build and explore animated scenes in the Awtsmoos Park engine.",
		icon: "✦",
		chip: "Animation",
		categories: ["create", "studio"],
		aliases: ["animator", "park engine"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "bookCoverMaker",
		title: "Book Cover Maker",
		href: "./bookCoverMaker/",
		description: "Compose book-cover artwork and typography in a focused visual workspace.",
		icon: "▰",
		chip: "Design",
		categories: ["create", "editor"],
		aliases: ["book cover generator", "cover designer"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "broadcaster",
		title: "Broadcaster",
		href: "./broadcaster/",
		description: "Open the dedicated browser broadcasting workspace for live media workflows.",
		icon: "◉",
		chip: "Broadcast",
		categories: ["create", "media"],
		aliases: ["stream", "broadcast"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "editor",
		title: "Mitzvah World Animator",
		href: "./editor/",
		description: "Shape Mitzvah World scenes and animated visual experiences.",
		icon: "✺",
		chip: "Animation",
		categories: ["create", "editor"],
		aliases: ["mitzvah animator", "world editor"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "gpt-api-pulse-garden",
		title: "Awtsmoos Pulse Garden",
		href: "./gpt-api-pulse-garden/",
		description: "Explore an interactive pulse garden and its responsive visual system.",
		icon: "❋",
		chip: "Garden",
		categories: ["create", "studio"],
		aliases: ["pulse garden", "garden"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "lyric-sync",
		title: "Lyric Sync",
		href: "./lyric-sync/",
		description: "Synchronize lyrics and timing in a dedicated music workflow.",
		icon: "♫",
		chip: "Lyrics",
		categories: ["create", "media"],
		aliases: ["lyrics", "timing"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "mitzvah-pushkuh",
		title: "Mitzvah Pushkuh",
		href: "./mitzvah-pushkuh/",
		description: "Enter the Garden of Sparks and its mitzvah-centered interactive experience.",
		icon: "✧",
		chip: "Mitzvah",
		categories: ["create"],
		aliases: ["garden of sparks", "pushkuh"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	...AI_CREATION_APPS,
	defineApp({
		id: "watermark-remover",
		title: "Watermark Remover",
		href: "./watermark-remover/",
		description: "Inspect and process image alpha masks in the existing browser utility.",
		icon: "◫",
		chip: "Image",
		categories: ["create", "editor"],
		aliases: ["alpha mask", "image mask"],
		commerceLabel: "Open tool",
		commerceState: "free"
	})
]);
