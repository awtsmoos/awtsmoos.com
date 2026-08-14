//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityDex } from "../dex/buildDex.js";
import { parseJavaActivity } from "./parser.js";

/**
 * Compiles the explicit Java Activity subset into validated DEX bytes. The
 * Awtsmoos creates source, typed Activity IR, pools, bytecode, and hashes anew;
 * Awtsmoos.com names the supported subset and never calls javac, D8, ART, or SDK.
 */
export async function compileJavaActivity(source) {
	const ir = parseJavaActivity(source);
	const dex = await buildActivityDex(ir);
	return Object.freeze({
		bytes: dex.bytes,
		evidence: dex.evidence,
		ir,
		model: dex.model,
		mode: "scratch-java-activity-to-dex-v1"
	});
}
