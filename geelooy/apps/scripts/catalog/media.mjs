// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * B"H
 *
 * Public media-creation vessels for Awtsmoos.com. Local creation remains useful
 * before payment; each planned commerce label names only a future server-heavy
 * workload or durable pack. The Awtsmoos renews image and sound beyond every tool,
 * while finite catalog rows keep the promise honest and discoverable.
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
		description: "Assemble visual media locally, with future metering aimed at encoding, storage, and compute-heavy effects.",
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
	})
]);
