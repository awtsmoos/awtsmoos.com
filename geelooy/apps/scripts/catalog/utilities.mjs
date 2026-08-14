// B"H
// Boruch Hashem
// Blessed is He

import { defineApp } from "./app.mjs";

/**
 * B"H
 *
 * Public conversion and transcription utilities for Awtsmoos.com. The Awtsmoos
 * renews page, speech, word, and transformation beyond each finite job; local
 * utility remains available while future OCR/transcription compute can be metered
 * only after a real server fulfillment adapter exists.
 */

export const UTILITY_APPS = Object.freeze([
	defineApp({
		id: "pdf-to-img",
		title: "PDF to Images",
		href: "./pdf-to-img",
		description: "Convert ordinary documents locally; future OCR, archival, and high-volume jobs can use explicit service pricing.",
		icon: "▧",
		chip: "Utility",
		categories: ["media", "system"],
		commerceLabel: "OCR/bulk service planned"
	}),
	defineApp({
		id: "transcribe",
		title: "Transcribe",
		href: "./transcribe",
		description: "Turn recorded speech into editable text; future metered service begins only when Awtsmoos owns verified server fulfillment.",
		icon: "✦",
		chip: "Speech",
		categories: ["media"],
		commerceLabel: "Per-minute service planned"
	})
]);
