// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * Public media-creation vessels for Awtsmoos.com. The Awtsmoos renews image,
 * sound, caption, and motion beyond every finite tool; these compact catalog
 * rows keep each real doorway honest, distinct, and discoverable without clutter.
 */
export const MEDIA_APPS = Object.freeze([
	defineApp({
		id: "nesher-studio",
		title: "Nesher Studio",
		href: "./nesher-studio",
		description: "Broadcast, relay, record, benchmark, and produce video from one serious studio.",
		icon: "🦅",
		chip: "Studio",
		categories: ["studio", "media"],
		commerceLabel: "Cloud relay/render planned"
	}),
	defineApp({
		id: "rebbe",
		title: "Rebbe Audio",
		href: "./rebbe",
		description: "Search, hear, clip, and work with the Rebbe audio archive without turning Torah access into a paywall.",
		icon: "♫",
		chip: "Audio",
		categories: ["media"],
		commerceLabel: "Core listening stays open",
		commerceState: "free"
	}),
	defineApp({
		id: "audio-editor",
		title: "Audio Editor",
		href: "./audio-editor",
		description: "Cut, arrange, inspect, and process sound; reserve future charges for server-heavy restoration or rendering.",
		icon: "≋",
		chip: "Editor",
		categories: ["editor", "media"],
		commerceLabel: "Heavy processing planned"
	}),
	defineApp({
		id: "video-editor",
		title: "Video Editor",
		href: "./video-editor",
		description: "Assemble visual media locally with a responsive preview, timeline, captions, and touch-ready controls.",
		icon: "▶",
		chip: "Editor",
		categories: ["editor", "media"],
		commerceLabel: "Cloud render planned"
	}),
	defineApp({
		id: "piano",
		title: "Piano & Synth",
		href: "./piano",
		description: "Play and compose immediately; future durable instrument, effect, and visual packs can extend the studio.",
		icon: "♬",
		chip: "Music",
		categories: ["studio", "media"],
		commerceLabel: "Durable packs planned"
	}),
	defineApp({
		id: "captions",
		title: "Caption Maker",
		href: "./captions/video",
		description: "Create timed captions locally, then optionally use future transcription, translation, and render services.",
		icon: "CC",
		chip: "Accessibility",
		categories: ["editor", "media"],
		commerceLabel: "AI/render service planned"
	}),
	defineApp({
		id: "ein-sof-caption-engine",
		title: "Ein Sof Caption Engine",
		href: "./captions/",
		description: "Design cinematic caption graphics and animated visual treatments from one advanced local canvas engine.",
		icon: "∞",
		chip: "Visual Lab",
		categories: ["editor", "media", "studio"],
		commerceLabel: "Local creation",
		commerceState: "free"
	})
]);
