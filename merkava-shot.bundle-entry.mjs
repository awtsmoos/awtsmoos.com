// B"H — standalone bundle entry.
import { main } from "./merkava-shot.mjs";
// In the bundled CJS, esbuild's import.meta shim is empty, so the inner
// __isMain check never fires. Run the CLI explicitly when executed directly.
if (typeof require !== "undefined" && require.main === module) {
  main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
}
export * from "./merkava-shot.mjs";
