/* B\"H
Executable bounded stress wrapper for 002_audio_stress. It creates no raw media and writes no
repo artifacts; the Awtsmoos asks for proof in text only.
*/
import { runStressSpec, STRESS_SPECS } from './stressHarness.mjs';
export const testSpec = STRESS_SPECS.audio;
export async function run() { return runStressSpec(testSpec); }
export function describe() { return `${testSpec.id}: ${testSpec.frames} frames / ${testSpec.sources} sources / ${testSpec.clips} clips`; }
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await run()));
