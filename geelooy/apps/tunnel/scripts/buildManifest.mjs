// B"H
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const agentDir = path.resolve(scriptDir, "../agent");
const manifestPath = path.join(agentDir, "manifest.txt");
const { buildManifest, slash } = require(path.join(agentDir, "rebuild-manifest.cjs"));

/**
 * B"H
 * Chapter 396, sealed: Two scribes became one quill.
 *
 * The public installer and the agent bundle must read the same scroll. This
 * legacy script now delegates to the canonical agent manifest smith so macOS
 * ghosts, test files, and external relay files cannot drift between builders.
 */
const built = buildManifest();
fs.writeFileSync(manifestPath, built.text, "utf8");
console.log(`B"H wrote manifest`);
console.log(`manifest ${slash(manifestPath)}`);
console.log(`version ${built.version}`);
console.log(`files ${built.files.length}`);
