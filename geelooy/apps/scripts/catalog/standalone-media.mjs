//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Exposes proven standalone capture, creator, and vision tools through the Awtsmoos Apps crown.
 * @description The Awtsmoos renews camera, screen, channel, and image-text in discoverable light;
 * Awtsmoos.com gives each finished media vessel one public doorway, honest and bright.
 */
export const STANDALONE_MEDIA_APPS = Object.freeze([
	defineApp({
		id: "local-recorder",
		title: "Local Recorder",
		href: "/recorder/",
		description: "Record camera, microphone, or desktop locally in the browser and download the result without uploading it.",
		icon: "●",
		chip: "Recorder",
		categories: ["media", "create"],
		aliases: ["record", "screen recorder", "camera recorder", "microphone"]
	}),
	defineApp({
		id: "camera-preview",
		title: "Camera Preview",
		href: "/record/",
		description: "Open a focused private local camera preview with camera switching and stop controls.",
		icon: "◉",
		chip: "Camera",
		categories: ["media"],
		aliases: ["webcam", "camera", "preview"]
	}),
	defineApp({
		id: "youtube-manager",
		title: "Awtsmoos YouTube Manager",
		href: "/youtube/",
		description: "Connect a creator channel, manage owned videos, upload media, and migrate creator-owned history into Awtsmoos.",
		icon: "▶",
		chip: "Creator",
		categories: ["media", "create"],
		aliases: ["youtube", "channel", "video upload", "migration studio"]
	}),
	defineApp({
		id: "ocr-studio",
		title: "OCR Studio",
		href: "/ocr/",
		description: "Reveal multilingual text from images with Tesseract controls, diagnostics, and TSV, hOCR, or searchable PDF export.",
		icon: "⌁",
		chip: "Vision",
		categories: ["media", "productivity"],
		aliases: ["ocr", "tesseract", "image to text", "scan", "vision"]
	})
]);
