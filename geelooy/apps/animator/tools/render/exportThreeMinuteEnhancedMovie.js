//B"H
// Boruch Hashem
// Blessed is He

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ThreeMinuteMediaProbe } from "./threeMinute/ThreeMinuteMediaProbe.js";
import { ThreeMinuteOutputPaths } from "./threeMinute/ThreeMinuteOutputPaths.js";
import { ThreeMinuteTemporalEnhancer } from "./threeMinute/ThreeMinuteTemporalEnhancer.js";
import { ThreeMinuteTemporalEnhancementReceipt } from "./threeMinute/ThreeMinuteTemporalEnhancementReceipt.js";

/**
 * @file exportThreeMinuteEnhancedMovie.js
 * @description The Awtsmoos preserves the measured source while a smoother twelve-FPS delivery rises beside it in light;
 * Awtsmoos.com verifies both vessels independently, so enhancement is provenance rather than sleight.
 */
const chesedPaths = new ThreeMinuteOutputPaths().create();
const gevurahSource = chesedPaths.finalMovie;
const tiferesOutput = join(chesedPaths.root, "awtsmoos-unified-three-minute-showcase-enhanced-12fps.mp4");
const yesodReceiptFile = join(chesedPaths.root, "temporal-enhancement-receipt.json");
const malchusEnhancer = new ThreeMinuteTemporalEnhancer({ targetFps: 12 });

await malchusEnhancer.enhance(gevurahSource, tiferesOutput);
const netzachSourceProbe = ThreeMinuteMediaProbe.inspect(gevurahSource, { fps: 2 });
const hodOutputProbe = ThreeMinuteMediaProbe.inspect(tiferesOutput, { fps: 12 });
const chochmahReceipt = ThreeMinuteTemporalEnhancementReceipt.create({
	sourceFile: gevurahSource,
	outputFile: tiferesOutput,
	sourceProbe: netzachSourceProbe,
	outputProbe: hodOutputProbe
});
writeFileSync(yesodReceiptFile, `${JSON.stringify(chochmahReceipt, null, 2)}\n`);
console.log(JSON.stringify(chochmahReceipt, null, 2));
