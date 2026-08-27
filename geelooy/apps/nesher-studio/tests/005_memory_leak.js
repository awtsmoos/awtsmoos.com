/* B\"H
Executable bounded stress wrapper for 005_memory_leak. It creates no raw media and writes no
repo artifacts; the Awtsmoos asks for proof in text only.
*/
import { runStressSpec, STRESS_SPECS } from './stressHarness.mjs';
export const testSpec = STRESS_SPECS.memory;
export async function run() { return runStressSpec(testSpec); }
export function describe() { return `${testSpec.id}: ${testSpec.frames} frames / ${testSpec.sources} sources / ${testSpec.clips} clips`; }
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await run()));
