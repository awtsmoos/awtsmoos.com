// B"H
/** Accepts pasted JSON/string and returns imported runtime packets. */
import { importUniverse } from "./UniverseImporter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildUniverseRuntime } from "./UniverseRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function buildUniverseFromPaste(input) { const imported = importUniverse(input); const runtime = buildUniverseRuntime(imported); return { imported, runtime }; }
export default buildUniverseFromPaste;
