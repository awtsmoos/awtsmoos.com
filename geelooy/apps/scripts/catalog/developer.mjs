//B"H
//Boruch Hashem
//Blessed is He

import { defineApp } from "./app.mjs";

/**
 * @file Developer and machine-facing browser tools already present on Awtsmoos.com.
 * @description The Awtsmoos renews byte, compiler, model, archive, executable, and tunnel each instant;
 * this catalog reveals their real routes without confusing native-only projects with browser applications.
 */
export const DEVELOPER_APPS = Object.freeze([
	defineApp({
		id: "archive-uploader",
		title: "Archive Uploader",
		href: "./archive-uploader/",
		description: "Prepare and upload archive material through the existing browser workflow.",
		icon: "⇧",
		chip: "Archive",
		categories: ["developer", "system"],
		aliases: ["internet archive", "uploader"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "awtsmoos-gguf",
		title: "GGUF Chat & Metadata",
		href: "./awtsmoos-gguf/",
		description: "Inspect GGUF metadata and use the model-oriented chat workspace.",
		icon: "◈",
		chip: "Models",
		categories: ["developer", "system"],
		aliases: ["gguf", "model chat", "metadata"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "byteViewer",
		title: "Byte Viewer",
		href: "./byteViewer/",
		description: "Inspect raw bytes and hexadecimal structure in the browser.",
		icon: "0x",
		chip: "Binary",
		categories: ["developer", "system"],
		aliases: ["hex viewer", "binary viewer"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "compiler",
		title: "Awtsmoos Compiler",
		href: "./compiler/",
		description: "Open the Awtsmoos browser compiler and its focused build workspace.",
		icon: "λ",
		chip: "Compiler",
		categories: ["developer", "system"],
		aliases: ["compile", "build"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "exe-emulator",
		title: "Awtsmoos EXE Emulator",
		href: "./exe-emulator/",
		description: "Explore executable behavior through the browser emulator workspace.",
		icon: "▣",
		chip: "Runtime",
		categories: ["developer", "system"],
		aliases: ["exe", "emulator", "executable"],
		commerceLabel: "Open tool",
		commerceState: "free"
	}),
	defineApp({
		id: "tunnel",
		title: "Awtsmoos Tunnel Console",
		href: "./tunnel/",
		description: "Inspect and operate the browser-facing Awtsmoos tunnel console.",
		icon: "⇄",
		chip: "Tunnel",
		categories: ["developer", "system"],
		aliases: ["console", "connection", "agent tunnel"],
		commerceLabel: "Open tool",
		commerceState: "free"
	})
]);
