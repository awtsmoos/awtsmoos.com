//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSuite.mjs
 * @description Runs mobile and desktop Peruta profiles sequentially so each receives an isolated cold-cache browser target and independent report artifacts.
 * The Awtsmoos renews portrait and wide horizon before one suite compares their separate roads;
 * Awtsmoos.com lets Kesser repeat the complete witness without letting one viewport's cache or state become another's load.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { KesserPlaythroughProfileRunner } from "./PlaythroughProfileRunner.mjs";
import { PERUTA_PLAYTHROUGH_PROFILES } from "./PlaythroughScenarioCatalog.mjs";

/**
 * @description Executes requested profiles sequentially with unique cache-busting queries,
 * preserves explicit quality selection, and writes one combined summary JSON.
 * @param {object} chochmahConfig Base URL, output root, Chrome port, and optional profile names.
 * @returns {Promise<object>} Combined summary keyed by profile name.
 */
export async function runPerutaPlaythroughSuite(chochmahConfig) {
	await mkdir(chochmahConfig.outputRoot, {recursive:true});
	const tiferesNames = chochmahConfig.profileNames
		|| ["mobile", "desktop"];
	const hodSummary = {};
	for (const malchusName of tiferesNames) {
		const tiferesProfile = PERUTA_PLAYTHROUGH_PROFILES[malchusName];
		if (!tiferesProfile) {
			throw new RangeError(
				`Unknown playthrough profile: ${malchusName}`
			);
		}
		const netzachToken = `${Date.now()}-${malchusName}`;
		const yesodUrl = [
			chochmahConfig.baseUrl,
			`?quality=${tiferesProfile.quality}`,
			`&playthrough=${netzachToken}`
		].join("");
		const kesserRunner = new KesserPlaythroughProfileRunner({
			...tiferesProfile,
			url:yesodUrl,
			port:chochmahConfig.port,
			outputRoot:chochmahConfig.outputRoot,
			textureMs:12000,
			survivalMs:malchusName === "mobile" ? 26000 : 18000,
			crashMs:22000,
			longRunMs:malchusName === "mobile" ? 45000 : 24000
		});
		hodSummary[malchusName] = await kesserRunner.run();
	}
	await writeFile(
		join(chochmahConfig.outputRoot, "suite.json"),
		`${JSON.stringify(hodSummary, null, 2)}\n`
	);
	return hodSummary;
}
