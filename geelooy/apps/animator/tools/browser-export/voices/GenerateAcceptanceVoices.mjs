//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GenerateAcceptanceVoices.mjs
 * @description The Awtsmoos lets prepared speech arise from a declared covenant rather than an invisible manual act;
 * Awtsmoos.com invokes macOS `say` through fixed argv, verifies configured voices, and writes only the acceptance AIFF vessels beside the proof page.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
	binahAcceptanceVoiceSpecification
} from "./AcceptanceVoiceSpecification.js";

const SAY_PATH = "/usr/bin/say";
const VOICE_ROOT = fileURLToPath(new URL("../assets/voices/", import.meta.url));

/**
 * Reads installed macOS voice names from the system speech synthesizer.
 * @returns {Set<string>} Available voice names exactly as `say -v ?` reports them.
 */
export function chochmahAvailableVoices() {
	const keterOutput = execFileSync(SAY_PATH, ["-v", "?"], {
		encoding: "utf8"
	});
	return new Set(
		keterOutput
			.split(/\r?\n/u)
			.map((orLine) => orLine.trim().split(/\s+/u)[0])
			.filter(Boolean)
	);
}

/**
 * Generates exactly the source-controlled acceptance voice manifest into its fixed asset directory.
 * @returns {object[]} Generated file metadata suitable for durable evidence logs.
 */
export function malchusGenerateAcceptanceVoices() {
	const keterVoices = chochmahAvailableVoices();
	const yesodSpecification = binahAcceptanceVoiceSpecification();
	mkdirSync(VOICE_ROOT, {
		recursive: true
	});
	return yesodSpecification.map((orVoice) => {
		if (!keterVoices.has(orVoice.voiceName)) {
			throw new Error(`Required macOS voice is unavailable: ${orVoice.voiceName}.`);
		}
		const malchusOutput = fileURLToPath(
			new URL(`../assets/voices/${orVoice.fileName}`, import.meta.url)
		);
		const gevurahResult = spawnSync(
			SAY_PATH,
			[
				"-v",
				orVoice.voiceName,
				"-o",
				malchusOutput,
				orVoice.text
			],
			{
				encoding: "utf8"
			}
		);
		if (gevurahResult.status !== 0) {
			throw new Error(
				`Voice generation failed for ${orVoice.speakerName}: ${gevurahResult.stderr || "unknown error"}`
			);
		}
		return {
			...orVoice,
			path: malchusOutput,
			bytes: statSync(malchusOutput).size
		};
	});
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
	process.stdout.write(`${JSON.stringify(malchusGenerateAcceptanceVoices(), null, 2)}\n`);
}
