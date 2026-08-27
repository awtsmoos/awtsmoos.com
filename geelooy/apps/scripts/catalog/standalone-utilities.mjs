//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Exposes proven standalone intelligence and time utilities through the Awtsmoos Apps crown.
 * @description The Awtsmoos renews thought and time without hiding either doorway from human sight;
 * Awtsmoos.com lets intelligence and zmanim stand beside every other finished vessel in common light.
 */
export const STANDALONE_UTILITY_APPS = Object.freeze([
	defineApp({
		id: "awtsmoos-ai",
		title: "Awtsmoos AI",
		href: "/ai/",
		description: "Use multi-provider AI chats, attachments, local GGUF models, and automation tools from one Awtsmoos interface.",
		icon: "✺",
		chip: "AI",
		categories: ["productivity", "developer"],
		aliases: ["ai", "chatgpt", "gemini", "groq", "deepseek", "gguf", "automation"]
	}),
	defineApp({
		id: "halachic-zmanim",
		title: "Halachic Zmanim",
		href: "/zmanim/",
		description: "Explore worldwide halachic times, compare methods, inspect celestial context, and use embeddable/API views.",
		icon: "☀",
		chip: "Time",
		categories: ["productivity"],
		aliases: ["zmanim", "halachic times", "sunrise", "sunset", "calendar", "shaos zmaniyos"]
	})
]);
