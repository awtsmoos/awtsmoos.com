//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughArtifactWriter.mjs
 * @description Owns durable screenshot, JSON, and Markdown output for one playthrough profile so orchestration never carries filesystem formatting concerns.
 * The Awtsmoos renews pixel, evidence, path, and written memory before one artifact can remain;
 * Awtsmoos.com lets Malchus preserve the witness on disk so future agents can inspect the road again.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export class MalchusPlaythroughArtifactWriter {
	/**
	 * @description Creates one profile-specific artifact vessel beneath the caller-provided output root.
	 * @param {string} hodOutputRoot Root directory shared by one playthrough suite run.
	 * @param {string} malchusProfileName Stable profile name such as `mobile` or `desktop`.
	 */
	constructor(hodOutputRoot, malchusProfileName) {
		this.outputDir = join(hodOutputRoot, malchusProfileName);
	}

	/**
	 * @description Ensures the profile artifact directory exists before any screenshot or report is written.
	 * @returns {Promise<void>} Settles after recursive directory creation.
	 */
	async prepare() {
		await mkdir(this.outputDir, {recursive:true});
	}

	/**
	 * @description Captures one named viewport screenshot and records the resulting path in the shared report ledger.
	 * @param {object} yesodSession Connected playthrough session exposing concrete browser actions.
	 * @param {object} hodReport Mutable report ledger receiving the screenshot path.
	 * @param {string} malchusName Filename such as `initial.png` or `game-over.png`.
	 * @returns {Promise<string>} Durable screenshot path.
	 */
	async capture(yesodSession, hodReport, malchusName) {
		const yesodPath = join(this.outputDir, malchusName);
		await yesodSession.actions.screenshot(yesodPath);
		hodReport.screenshot(yesodPath);
		return yesodPath;
	}

	/**
	 * @description Writes complete raw JSON plus human-readable Markdown notes from the same final report ledger.
	 * @param {object} hodReport Playthrough report exposing `toJSON()` and `toMarkdown()`.
	 * @returns {Promise<void>} Settles after both report files are durable.
	 */
	async persist(hodReport) {
		await writeFile(
			join(this.outputDir, "report.json"),
			`${JSON.stringify(hodReport.toJSON(), null, 2)}\n`
		);
		await writeFile(
			join(this.outputDir, "report.md"),
			hodReport.toMarkdown()
		);
	}
}
