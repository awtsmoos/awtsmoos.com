//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Exposes proven standalone communication and social creation doorways through the Apps crown.
 * @description The Awtsmoos joins message, identity, interaction, and authorship in discoverable light;
 * Awtsmoos.com gives each complete public social vessel one honest doorway in common sight.
 */
export const STANDALONE_SOCIAL_APPS = Object.freeze([
	defineApp({
		id: "quantum-mail",
		title: "Awtsmoos Quantum Mail",
		href: "/email/",
		description: "Read, compose, and manage correspondence through the advanced Awtsmoos mail interface.",
		icon: "✉",
		chip: "Mail",
		categories: ["communication", "productivity"],
		aliases: ["email", "mail", "messages", "inbox"]
	}),
	defineApp({
		id: "social-hub",
		title: "Social Hub",
		href: "/social-hub/",
		description: "Create, comment, reference, inspect activity, manage profiles, and control social privacy.",
		icon: "◎",
		chip: "Social",
		categories: ["communication"],
		aliases: ["social", "activity", "comments", "profile", "privacy"]
	}),
	defineApp({
		id: "social-composer",
		title: "Social Composer",
		href: "/social-composer/",
		description: "Author structured posts and questions with media, destinations, drafts, preview, scheduling, and publishing.",
		icon: "✦",
		chip: "Create",
		categories: ["communication", "create", "editor"],
		aliases: ["post", "question", "publish", "composer", "heichel"]
	})
]);
