// B"H
/** Accepts pasted JSON/string and returns imported runtime packets. */
import { importUniverse } from "./UniverseImporter.js";
import { buildUniverseRuntime } from "./UniverseRuntime.js";
export function buildUniverseFromPaste(input) { const imported = importUniverse(input); const runtime = buildUniverseRuntime(imported); return { imported, runtime }; }
export default buildUniverseFromPaste;
